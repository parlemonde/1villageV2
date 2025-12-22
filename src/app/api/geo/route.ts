import { serializeToQueryUrl } from '@lib/serialize-to-query-url';
import { getCurrentUser } from '@server/helpers/get-current-user';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

type NominatimQuery =
    | {
          q: string;
      }
    | {
          city?: string;
          country: string;
      };

export interface NominatimPlace {
    address: {
        city: string;
        country_code: string;
    };
    lat: string;
    lon: string;
}

export const GET = async (request: NextRequest) => {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
        return new NextResponse(null, {
            status: 401,
        });
    }

    const query = request.nextUrl.searchParams.get('query');
    if (!query) {
        return new NextResponse(null, {
            status: 400,
        });
    }

    const result = await getPosition({
        q: query,
    });

    return NextResponse.json(result);
};

export async function getPosition(query: NominatimQuery): Promise<NominatimPlace | null> {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search.php${serializeToQueryUrl({
                ...query,
                addressdetails: 1,
                format: 'jsonv2',
                'accept-language': 'fr',
            })}`,
            {
                method: 'GET',
            },
        );

        if (!response.ok) {
            return null;
        }

        return await response.json();
    } catch {
        return null;
    }
}
