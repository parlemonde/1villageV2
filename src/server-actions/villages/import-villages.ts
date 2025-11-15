'use server';

import { COUNTRIES } from '@lib/iso-3166-countries-french';
import { jsonFetcher } from '@lib/json-fetcher';
import { serializeToQueryUrl } from '@lib/serialize-to-query-url';
import { db } from '@server/database';
import type { Village } from '@server/database/schemas/villages';
import { villages } from '@server/database/schemas/villages';
import { getEnvVariable } from '@server/lib/get-env-variable';
import { isNotNull } from 'drizzle-orm';
import FuzzySet from 'fuzzyset.js';

interface PlmVillage {
    id: string; // number in string
    creator_id: string; // number in string
    name: string;
    slug: string; // format: 'village-monde-country1-country2'
    description: string;
    status: 'private' | 'hidden' | 'public';
    parent_id: string; // number in string
    enable_forum: string; // number in string
    date_created: string; // date "YYYY-MM-DD HH:MM:SS",
}

export async function importVillages(): Promise<void> {
    let plmVillages: PlmVillage[] = [];
    try {
        plmVillages = await jsonFetcher<PlmVillage[]>(
            `https://prof.parlemonde.org/wp-json/api/v1/villages${serializeToQueryUrl({
                // eslint-disable-next-line camelcase
                client_id: getEnvVariable('CLIENT_ID'),
                // eslint-disable-next-line camelcase
                client_secret: getEnvVariable('CLIENT_SECRET'),
            })}`,
        );
    } catch (error) {
        console.error(error);
        return;
    }

    const importedVillages = new Set(
        (
            await db
                .select({
                    plmId: villages.plmId,
                })
                .from(villages)
                .where(isNotNull(villages.plmId))
        ).map((row) => row.plmId),
    );
    const villagesToCreate = plmVillages.map(getVillage).filter((v): v is Omit<Village, 'id'> => v !== null && !importedVillages.has(v.plmId));
    if (villagesToCreate.length > 0) {
        await db.insert(villages).values(villagesToCreate);
    }
}

/**
 * Return true if the village is the general info village. We don't want to import it.
 */
function isGeneralInfoVillage(plmVillage: PlmVillage): boolean {
    const fuzzySet = FuzzySet(['informations générales']);
    const result = fuzzySet.get(plmVillage.name.trim().toLowerCase())?.[0];
    return result !== undefined && result[0] > 0.8;
}

/**
 * Slug is in the format: 'village-monde-country1-country2-country3...' or 'country1-country2-country3...'
 * Return the ISO country codes in the slug.
 */
function getCountries(slug: string): string[] {
    const cleanedSlug = slug.startsWith('village-monde-') ? slug.slice(14) : slug;

    // Normalize a string: lowercase, remove accents and apostrophes
    const normalize = (str: string): string =>
        str
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') // Remove accents
            .replace(/'/g, ''); // Remove apostrophes

    // Create a map of normalized country names to ISO codes
    const countryMap = new Map<string, string>();
    const normalizedCountries: string[] = [];
    Object.entries(COUNTRIES).forEach(([isoCode, name]) => {
        if (name) {
            const normalized = normalize(name);
            countryMap.set(normalized, isoCode);
            normalizedCountries.push(normalized);
        }
    });

    // Create fuzzy set for typo tolerance
    const fuzzySet = FuzzySet(normalizedCountries);

    // Normalize the slug
    const normalizedSlug = normalize(cleanedSlug);
    const parts = normalizedSlug.split('-');

    const result: string[] = [];
    let i = 0;

    // Greedy matching: try to match the longest country name at each position
    while (i < parts.length) {
        let found = false;

        // Try matching from longest to shortest
        for (let length = parts.length - i; length >= 1; length--) {
            const candidate = parts.slice(i, i + length).join('-');

            // First try exact match
            if (countryMap.has(candidate)) {
                result.push(countryMap.get(candidate)!);
                i += length;
                found = true;
                break;
            }

            // Then try fuzzy match with threshold 0.8 (80% similarity)
            const fuzzyResult = fuzzySet.get(candidate);
            if (fuzzyResult && fuzzyResult[0] && fuzzyResult[0][0] >= 0.8) {
                const matchedNormalizedName = fuzzyResult[0][1];
                const isoCode = countryMap.get(matchedNormalizedName);
                if (isoCode) {
                    result.push(isoCode);
                    i += length;
                    found = true;
                    break;
                }
            }
        }

        if (!found) {
            // Skip this part if no match found (could be a typo or unrecognized country)
            i++;
        }
    }

    return result;
}

/**
 * Get a PLM village to create in the database.
 */
function getVillage(plmVillage: PlmVillage): Omit<Village, 'id'> | null {
    const plmId = Number(plmVillage.id);
    if (!Number.isSafeInteger(plmId) || plmVillage.status !== 'private' || isGeneralInfoVillage(plmVillage)) {
        return null;
    }

    const countries = getCountries(plmVillage.slug);
    const name = countries.length > 1 ? countries.map((c) => COUNTRIES[c] || c).join(' • ') : plmVillage.name;

    return {
        plmId: plmId,
        name,
        countries,
        activePhase: 1,
        phaseStartDates: { 1: new Date().toISOString() },
        classroomCount: Object.fromEntries(countries.map((c) => [c, 0])),
    };
}
