'use client';

import { Button } from '@frontend/components/ui/Button';
import { TextArea } from '@frontend/components/ui/Form';
import { useCurrentActivity } from '@frontend/hooks/useCurrentActivity';
import { ChevronRightIcon } from '@radix-ui/react-icons';

interface FreeActivityContent {
    text: string;
    title: string;
    extract: string;
}
export const isFreeActivityContent = (content: unknown): content is FreeActivityContent => {
    return (
        typeof content === 'object' &&
        content !== null &&
        'text' in content &&
        typeof content.text === 'string' &&
        'title' in content &&
        typeof content.title === 'string' &&
        'extract' in content &&
        typeof content.extract === 'string'
    );
};

export const FreeContentStep1Form = () => {
    const { activity, setActivity } = useCurrentActivity({ activityType: 'libre' });
    const freeContent = isFreeActivityContent(activity?.content) ? activity?.content : { text: '', title: '', extract: '' };

    return (
        <div>
            <TextArea
                value={freeContent.text}
                onChange={(e) =>
                    setActivity({
                        ...activity,
                        content: {
                            ...freeContent,
                            text: e.target.value,
                        },
                    })
                }
                color="secondary"
                placeholder="Ecrivez le contenu de votre publication"
                marginY="md"
            />
            <div style={{ textAlign: 'right' }}>
                <Button as="a" href="/contenu-libre/2" color="primary" label="Étape suivante" rightIcon={<ChevronRightIcon />}></Button>
            </div>
        </div>
    );
};
