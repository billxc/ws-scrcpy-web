export type StreamCodec = 'auto' | 'h264' | 'h265';

/** HEVC is capped independently of viewport orientation and bitrate. */
export function maxSizeForCodec(codec: string | undefined, requestedMaxSize: number): number {
    return codec === 'h265' ? Math.min(requestedMaxSize || 1920, 1920) : requestedMaxSize;
}
