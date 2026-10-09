import { expect, it } from 'vitest';
import { maxSizeForCodec } from '../streamEncoding';

it('caps every H.265 stream at 1920 while preserving a lower explicit limit', () => {
    expect(maxSizeForCodec('h265', 0)).toBe(1920);
    expect(maxSizeForCodec('h265', 2560)).toBe(1920);
    expect(maxSizeForCodec('h265', 1280)).toBe(1280);
});
it('does not downscale H.264 based on viewport or previous H.265 selection', () => {
    expect(maxSizeForCodec('h264', 0)).toBe(0);
    expect(maxSizeForCodec('h264', 2560)).toBe(2560);
});
