import { render, screen, waitFor } from '@testing-library/react';
import useSWR from 'swr';
import videoJs from 'video.js';

import { VideoPlayer } from './VideoPlayer';

const mockUseSWR = useSWR as jest.Mock;
const mockVideojs = videoJs as unknown as jest.Mock;
jest.mock('swr', () => ({
    __esModule: true,
    default: jest.fn(),
}));
jest.mock('video.js', () => ({
    __esModule: true,
    default: jest.fn(),
}));
jest.mock('videojs-hls-quality-selector', () => ({}));
jest.mock('videojs-youtube', () => ({}));

describe('VideoPlayer', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('shows the processing message for HLS media while it is not ready', () => {
        mockUseSWR.mockReturnValue({ data: false });

        render(<VideoPlayer src="/media/videos/sample.m3u8" />);

        expect(screen.getByText('La vidéo est en cours de traitement...')).toBeInTheDocument();
        expect(mockVideojs).not.toHaveBeenCalled();
    });

    it('initializes and disposes the player once HLS media is ready', async () => {
        const dispose = jest.fn();
        const hlsQualitySelector = jest.fn();
        mockUseSWR.mockReturnValue({ data: true });
        mockVideojs.mockReturnValue({
            dispose,
            hlsQualitySelector,
            isDisposed: () => false,
        });

        const { unmount } = render(<VideoPlayer src="/media/videos/sample.m3u8" mimeType="application/x-mpegURL" />);

        await waitFor(() => {
            expect(mockVideojs).toHaveBeenCalledWith(
                expect.any(HTMLElement),
                expect.objectContaining({
                    controls: true,
                    playsInline: true,
                    sources: [{ src: '/media/videos/sample.m3u8', type: 'application/x-mpegURL' }],
                }),
            );
        });
        expect(hlsQualitySelector).toHaveBeenCalledWith({ displayCurrentQuality: true });

        unmount();

        expect(dispose).toHaveBeenCalledTimes(1);
    });
});
