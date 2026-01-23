import { sendToast } from '@frontend/components/Toasts';
import { ActivityContext } from '@frontend/contexts/activityContext';
import { VillageContext } from '@frontend/contexts/villageContext';
import { jsonFetcher } from '@lib/json-fetcher';
import { serializeToQueryUrl } from '@lib/serialize-to-query-url';
import type { Activity } from '@server/database/schemas/activities';
import React, { useCallback, useContext } from 'react';

export const useImageStories = () => {
    const { village } = useContext(VillageContext);

    // This function is to fetch all RE_INVENT_STORY in activity table page.
    const getAllStories = React.useCallback(
        async (imageId: number) => {
            if (!village) {
                return;
            }
            const response = await jsonFetcher<{ data: Activity[]; error: boolean }>(
                `/activities${serializeToQueryUrl({
                    villageId: village?.id,
                    //type: ActivityType.RE_INVENT_STORY,
                    type: 'histoire',
                })}`,
                {
                    method: 'GET',
                },
            );
            if (response.error && response.data) {
                return;
            }
            const stories = [] as Activity[];
            response.data.forEach((activity: Activity) => {
                const data = activity.data as ActivityData<'histoire'>;
                if (data?.object.imageId === imageId || data?.place.imageId === imageId || data?.odd.imageId === imageId) {
                    stories.push(activity);
                    return;
                }
            });

            return stories;
        },
        [village],
    );

    // This function is to display story activity cards in activity page.
    const getInspiredStories = React.useCallback(
        async (activityStoryId: number) => {
            if (!village) {
                return 0;
            }
            const response = await jsonFetcher<{ data: Activity[]; error: boolean }>(
                `/activities${serializeToQueryUrl({
                    villageId: village?.id,
                    //type: `${ActivityType.STORY},${ActivityType.RE_INVENT_STORY}`,
                    type: 'histoire',
                })}`,
                {
                    method: 'GET',
                },
            );

            if (response.error && response.data) {
                return 0;
            }
            const stories = [] as Activity[];
            response.data.forEach((activity: Activity) => {
                const data = activity.data as ActivityData<'histoire'>;
                if (
                    data?.object.inspiredStoryId === activityStoryId ||
                    data?.place.inspiredStoryId === activityStoryId ||
                    data?.odd.inspiredStoryId === activityStoryId
                ) {
                    stories.push(activity);
                }
            });
            return stories.filter((activity: Activity) => activity.id !== activityStoryId);
        },
        [village],
    );

    // Fetch stories by their Id
    const getStoriesByIds = React.useCallback(
        async (activityStoryIds: number[]) => {
            if (!village) {
                return;
            }
            const getStoryData = async (id: number) =>
                await jsonFetcher(`/activities/${id}`, {
                    method: 'GET',
                });

            const stories = [] as Activity[];
            await Promise.all(
                activityStoryIds.map(async (activityStoryId) => {
                    await getStoryData(activityStoryId).then((response) => stories.push(response.data));
                }),
            );
            return stories;
        },
        [village],
    );

    // This is a function that returns random images for slot machine
    const getRandomImagesData = useCallback(async () => {
        if (!village) {
            return 0;
        }
        const response = await jsonFetcher<{ data: unknown; error: boolean }>(
            `/stories/all${serializeToQueryUrl({
                villageId: village.id,
            })}`,
            {
                method: 'GET',
            },
        );
        if (response.error) {
            return 0;
        }
        return response.data;
    }, [village]);

    return { getAllStories, getInspiredStories, getStoriesByIds, getRandomImagesData };
};

export const useImageStoryRequests = () => {
    //const queryClient = useQueryClient();
    const { getAllStories } = useImageStories();
    const { activity, onCreateActivity } = useContext(ActivityContext);
    //const { selectedPhase } = useContext(VillageContext);

    const deleteStoryImage = useCallback(
        async (id: number | null, data: ActivityData<'histoire'>, step?: number) => {
            if (!id) {
                return;
            }
            // This will return an array of used images.
            const storiesDatas = await getAllStories(id).catch();
            if (activity && storiesDatas && storiesDatas.length >= 1) {
                let newActivityData = {} as ActivityData<'histoire'>;
                const imageData = {
                    imageId: 0,
                    imageUrl: '',
                    inspiredStoryId: 0,
                };
                if (step === 1) {
                    newActivityData = {
                        ...data,
                        object: {
                            ...data?.object,
                            ...imageData,
                        },
                    };
                } else if (step === 2) {
                    newActivityData = {
                        ...data,
                        place: {
                            ...data.place,
                            ...imageData,
                        },
                    };
                } else if (step === 3) {
                    newActivityData = {
                        ...data,
                        odd: {
                            ...data?.odd,
                            ...imageData,
                        },
                    };
                }
                onCreateActivity('histoire', {
                    ...newActivityData,
                });
                //We exit the function because no delete is expected
                return;
            }
            const response = await jsonFetcher<{ data: unknown; error: boolean }>(`/stories/${id}`, {
                method: 'DELETE',
            });
            if (response.error) {
                sendToast({
                    message: 'Une erreur est survenue...',
                    type: 'error',
                });

                return;
            }
            //queryClient.invalidateQueries('stories');
            //queryClient.invalidateQueries('activities');
        },
        [activity, onCreateActivity, getAllStories],
    );

    return {
        deleteStoryImage,
    };
};
