import { COUNTRIES } from '@lib/iso-3166-countries-french';
import { jsonFetcher } from '@lib/json-fetcher';
import { db } from '@server/database';
import { classrooms } from '@server/database/schemas/classrooms';
import type { UserRole } from '@server/database/schemas/users';
import { users } from '@server/database/schemas/users';
import { villages } from '@server/database/schemas/villages';
import { genericOAuth } from 'better-auth/plugins';
import { eq, inArray } from 'drizzle-orm';
import stringSimilarity from 'string-similarity';

import { registerService } from './register-service';

interface PLMUser {
    id: string;
    email: string;
    pseudo: string;
    school?: string;
    address?: string;
    city?: string;
    postalCode?: string;
    country?: string;
    groups?: Array<{
        name: string; // village name
        id: string; // number in string, village id
        is_admin: string; // boolean in string ("0" or "1")
        is_mod: string; // boolean in string ("0" or "1")
        user_title: string;
    }>;
}

export const PARLEMONDE_SSO_PROVIDER_ID = 'parlemonde-sso';
const CLIENT_ID = process.env.CLIENT_ID || '';
const CLIENT_SECRET = process.env.CLIENT_SECRET || '';

export const isParlemondeSSOPluginEnabled = CLIENT_ID !== '' && CLIENT_SECRET !== '';

export const ssoPlugin = registerService('parlemonde-sso-plugin', () =>
    isParlemondeSSOPluginEnabled
        ? genericOAuth({
              config: [
                  {
                      providerId: PARLEMONDE_SSO_PROVIDER_ID,
                      redirectURI: `${process.env.HOST_URL || ''}/login`,
                      responseType: 'code',
                      clientId: CLIENT_ID,
                      clientSecret: CLIENT_SECRET,
                      authorizationUrl: `https://prof.parlemonde.org/oauth/authorize`,
                      tokenUrl: `https://prof.parlemonde.org/oauth/token`,
                      getUserInfo: async (tokens) => {
                          const plmUser = await jsonFetcher<PLMUser>(`https://prof.parlemonde.org/oauth/me?access_token=${tokens.accessToken}`, {
                              method: 'GET',
                          });
                          // 1. create user in database if not exists
                          let user: { id: string; role: UserRole } | undefined = await db.query.users.findFirst({
                              columns: {
                                  id: true,
                                  role: true,
                              },
                              where: eq(users.email, plmUser.email),
                          });
                          if (!user) {
                              let role: UserRole = 'teacher';
                              const userGroups = plmUser.groups || [];
                              if (userGroups.length > 1) {
                                  if (
                                      plmUser.groups?.some((g) => parseInt(g.is_mod, 10) === 1) ||
                                      plmUser.groups?.some((g) => parseInt(g.is_admin, 10) === 1)
                                  ) {
                                      role = 'admin';
                                  }
                              }
                              user = (
                                  await db
                                      .insert(users)
                                      .values({
                                          email: plmUser.email,
                                          emailVerified: true,
                                          name: plmUser.pseudo,
                                          role,
                                      })
                                      .returning({
                                          id: users.id,
                                          role: users.role,
                                      })
                              )[0];
                          }
                          // 2. create classroom in database if not exists
                          if (user && user.role === 'teacher') {
                              const classroom = await db.query.classrooms.findFirst({
                                  columns: {
                                      id: true,
                                  },
                                  where: eq(classrooms.teacherId, user.id),
                              });
                              if (!classroom) {
                                  const villageIds = plmUser.groups?.map((g) => Number(g.id)).filter((id) => Number.isSafeInteger(id)) || [];
                                  const village =
                                      villageIds.length > 0
                                          ? await db.query.villages.findFirst({
                                                where: inArray(villages.plmId, villageIds),
                                            })
                                          : undefined;
                                  let countryCode: string = 'FR';
                                  if (plmUser.country) {
                                      const matchs = village?.countries || Object.keys(COUNTRIES);
                                      const c = stringSimilarity.findBestMatch(
                                          plmUser.country?.trim().toLowerCase(),
                                          matchs.map((c) => COUNTRIES[c]?.toLowerCase()).filter((c) => c !== undefined),
                                      );
                                      if (c.bestMatch.rating > 0.55) {
                                          countryCode = matchs[c.bestMatchIndex];
                                      }
                                  }
                                  if (village && !village.countries.includes(countryCode)) {
                                      countryCode = village.countries[0];
                                  }
                                  await db.insert(classrooms).values({
                                      name: plmUser.school || '',
                                      address: plmUser.address || '',
                                      city: plmUser.city || '',
                                      countryCode,
                                      teacherId: user.id,
                                      villageId: village?.id,
                                  });
                              }
                          }
                          // 3. return user info
                          return {
                              id: plmUser.id,
                              email: plmUser.email,
                              name: plmUser.pseudo,
                              emailVerified: true,
                          };
                      },
                  },
              ],
          })
        : undefined,
);
