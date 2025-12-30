/* eslint-disable no-debugger */
import type { ClassroomVillageTeacher } from '@app/api/classrooms/route';
import { getGravatarUrl } from '@frontend/components/Avatar/Avatar';
import type { Classroom } from '@server/database/schemas/classrooms';
import { Marker } from 'maplibre-gl';
import { v4 } from 'uuid';

import type { Disposable } from './world-map.types';

interface MarkerSVGProps {
    markerId: string;
    avatarUrl: string;
    classroom: Classroom | undefined;
}
const MarkerSVG = ({
    markerId,
    avatarUrl,
    classroom,
}: MarkerSVGProps): string => `<div style="cursor: pointer; position: relative;"><svg display="block" height="41px" width="27px" viewBox="0 0 27 41">
        <g fill-rule="nonzero">
            <g transform="translate(3.0, 29.0)" fill="#000000">
                <ellipse opacity="0.04" cx="10.5" cy="5.80029008" rx="10.5" ry="5.25002273"></ellipse>
                <ellipse opacity="0.04" cx="10.5" cy="5.80029008" rx="10.5" ry="5.25002273"></ellipse>
                <ellipse opacity="0.04" cx="10.5" cy="5.80029008" rx="9.5" ry="4.77275007"></ellipse>
                <ellipse opacity="0.04" cx="10.5" cy="5.80029008" rx="8.5" ry="4.29549936"></ellipse>
                <ellipse opacity="0.04" cx="10.5" cy="5.80029008" rx="7.5" ry="3.81822308"></ellipse>
                <ellipse opacity="0.04" cx="10.5" cy="5.80029008" rx="6.5" ry="3.34094679"></ellipse>
                <ellipse opacity="0.04" cx="10.5" cy="5.80029008" rx="5.5" ry="2.86367051"></ellipse>
                <ellipse opacity="0.04" cx="10.5" cy="5.80029008" rx="4.5" ry="2.38636864"></ellipse>
            </g>
            <g fill="var(--primary-color)">
                <path d="M27,13.5 C27,19.074644 20.250001,27.000002 14.75,34.500002 C14.016665,35.500004 12.983335,35.500004 12.25,34.500002 C6.7499993,27.000002 0,19.222562 0,13.5 C0,6.0441559 6.0441559,0 13.5,0 C20.955844,0 27,6.0441559 27,13.5 Z"></path>
            </g>
            <g opacity="0.4" fill="#000000">
                <path d="M13.5,0 C6.0441559,0 0,6.0441559 0,13.5 C0,19.222562 6.7499993,27 12.25,34.5 C13,35.522727 14.016664,35.500004 14.75,34.5 C20.250001,27 27,19.074644 27,13.5 C27,6.0441559 20.955844,0 13.5,0 Z M13.5,1 C20.415404,1 26,6.584596 26,13.5 C26,15.898657 24.495584,19.181431 22.220703,22.738281 C19.945823,26.295132 16.705119,30.142167 13.943359,33.908203 C13.743445,34.180814 13.612715,34.322738 13.5,34.441406 C13.387285,34.322738 13.256555,34.180814 13.056641,33.908203 C10.284481,30.127985 7.4148684,26.314159 5.015625,22.773438 C2.6163816,19.232715 1,15.953538 1,13.5 C1,6.584596 6.584596,1 13.5,1 Z"></path>
            </g>
            <g transform="translate(6.0, 7.0)" fill="#FFFFFF"></g>
            <g transform="translate(8.0, 8.0)">
                <circle fill="#000000" opacity="0.25" cx="5.5" cy="5.5" r="10.2"></circle>
                <circle fill="#FFFFFF" cx="5.5" cy="5.5" r="10.2"></circle>
            </g>
        </g>
    </svg>
    <div style="position: absolute; top: 3px; left: 3px; width: 21px; height: 21px; border-radius: 50%; overflow: hidden;">
        <img src="${avatarUrl}" alt="Marker" style="width: 100%; height: 100%; object-fit: cover;">
    </div>
    <div id="popover-${markerId}" style="display: none; position: absolute; top: 0; left: 0; width: 350px; background-color: white; transform: translate(-50%, calc(-100% - 4px)); border-radius: 8px; padding: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.15);">
        <div style="display: flex; align-items: center; gap: 8px">    
            <img src="${avatarUrl}" alt="avatar" style="flex-basis: 40px;width: 40px; height: 40px; border-radius: 20px; object-fit: cover;background-color: var(--grey-100);border: 1px solid var(--grey-100);">
            <div>
                <h2 style="margin: 0; padding: 0;">${classroom?.name}</h2>
                <div style="display: flex; align-items: center; gap: 8px">
                    <span style="margin: 0; padding: 0; font-size: 0.75rem; color: #666; line-height: 1.2">${classroom?.address}</span>
                    <p style="margin: 0; padding: 0; font-size: 0.75rem; color: #666">&middot;</p>
                    <img alt="${classroom?.countryCode} flag" style="width:auto;height:16px;border-radius:2px;box-shadow:0 0 2px var(--grey-400)" src="/static/country-flags/${classroom?.countryCode?.toLowerCase()}.svg">
                </div>
            </div>
        </div>
    </div>
</div>`;

export interface DisposableMarker extends Disposable {
    marker: Marker;
    setClickHandler: (handler: (event: MouseEvent) => void) => void;
}
interface GetClassroomMarkerArgs {
    classroomVT: ClassroomVillageTeacher | undefined;
    canvas: HTMLDivElement;
}
export const getClassroomMarker = ({ classroomVT, canvas }: GetClassroomMarkerArgs): DisposableMarker => {
    debugger;
    const classroom = classroomVT?.classroom;
    const markerId = v4();
    const avatarUrl = classroom?.avatarUrl || getGravatarUrl(`classroom-${classroom?.id}@parlemonde.org`, 40);

    const el = document.createElement('div');
    el.innerHTML = MarkerSVG({
        markerId,
        avatarUrl,
        classroom,
    });
    const marker = new Marker({
        element: el,
        anchor: 'bottom',
        offset: [0, 6],
    }).setLngLat({
        lng: classroom?.coordinates?.longitude || 0,
        lat: classroom?.coordinates?.latitude || 0,
    });
    const onMouseEnter = () => {
        const elOpacity = el.style.opacity;
        const popover = el.querySelector(`#popover-${markerId}`);
        if (popover && popover instanceof HTMLElement && elOpacity === '1') {
            popover.style.display = 'block';
            const popoverBoundingClientRect = popover.getBoundingClientRect();
            const popoverTop = popoverBoundingClientRect.top;
            const canvasTop = canvas.getBoundingClientRect().top;
            const computedPopoverTop =
                popover.style.transform === `translate(-50%, calc(-100% - 4px))`
                    ? popoverTop
                    : popoverTop - 40 - popoverBoundingClientRect.height - 4;
            if (computedPopoverTop - 4 < canvasTop) {
                popover.style.transform = `translate(-50%, 40px)`;
            } else {
                popover.style.transform = `translate(-50%, calc(-100% - 4px))`;
            }
        }
    };
    const onMouseLeave = () => {
        const popover = el.querySelector(`#popover-${markerId}`);
        if (popover && popover instanceof HTMLElement) {
            popover.style.display = 'none';
        }
    };
    el.addEventListener('mouseenter', onMouseEnter);
    el.addEventListener('mouseleave', onMouseLeave);
    let onClick: ((event: MouseEvent) => void) | undefined;
    const onMarkerClick = (event: MouseEvent) => {
        if (onClick) {
            const elBoundingClientRect = el.getBoundingClientRect();
            if (
                event.clientX < elBoundingClientRect.left ||
                event.clientX > elBoundingClientRect.right ||
                event.clientY < elBoundingClientRect.top ||
                event.clientY > elBoundingClientRect.bottom
            ) {
                return;
            }
            onClick(event);
        }
    };
    el.addEventListener('click', onMarkerClick);
    return {
        marker,
        dispose: () => {
            el.removeEventListener('mouseenter', onMouseEnter);
            el.removeEventListener('mouseleave', onMouseLeave);
            el.removeEventListener('click', onMarkerClick);
        },
        setClickHandler: (handler: (event: MouseEvent) => void) => {
            onClick = handler;
        },
    };
};
