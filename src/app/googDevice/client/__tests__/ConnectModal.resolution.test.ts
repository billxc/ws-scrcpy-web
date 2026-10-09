// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import type { ParamsStreamScrcpy } from '../../../../types/ParamsStreamScrcpy';
import type { BasePlayer } from '../../../player/BasePlayer';
import { startStream } from '../../../public/startStream';
import type VideoSettings from '../../../VideoSettings';
import { ConnectModal } from '../ConnectModal';

vi.mock('../../../public/startStream', () => ({ startStream: vi.fn(() => ({ stop: vi.fn() })) }));
vi.mock('../../../client/ThemeToggle', () => ({ createThemeToggle: () => document.createElement('button') }));
beforeEach(() => {
    HTMLDialogElement.prototype.showModal = vi.fn();
    HTMLDialogElement.prototype.close = vi.fn();
    vi.clearAllMocks();
});
afterEach(() => {
    document.body.innerHTML = '';
});

const settings = { bounds: { width: 384, height: 832 }, bitrate: 1_000_000, maxFps: 15 } as VideoSettings;
function open(fit: boolean) {
    return new ConnectModal({ udid: 'device' } as ParamsStreamScrcpy, {} as BasePlayer, fit, settings, 'MuMu');
}
it('fits the display without reusing legacy viewport bounds as an encoder limit', () => {
    open(true);
    expect(vi.mocked(startStream).mock.calls[0]![2]).toMatchObject({ bitrate: 1_000_000, maxSize: undefined });
});
it('preserves explicitly configured bounds when fit is off', () => {
    open(false);
    expect(vi.mocked(startStream).mock.calls[0]![2]?.maxSize).toBe(832);
});
