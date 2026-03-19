import { getCurrentUser } from '@server/helpers/get-current-user';
import { getPelicoPresentation } from '@server-actions/activities/get-pelico-presentation';
import { NextResponse } from 'next/server';

export const GET = async () => {
    const user = await getCurrentUser();
    if (!user) {
        return new NextResponse(null, { status: 401 });
    }

    const presentation = await getPelicoPresentation();
    if (!presentation) {
        return new NextResponse(null, { status: 404 });
    }

    return NextResponse.json(presentation);
};
