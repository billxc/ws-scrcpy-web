// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { BasePlayer } from '../../../player/BasePlayer';
import { StreamToolbar } from '../StreamToolbar';

let toolbar: StreamToolbar;
afterEach(() => {
    toolbar?.dispose();
    document.body.innerHTML = '';
    vi.restoreAllMocks();
});

function build() {
    const dialog = document.createElement('dialog');
    dialog.className = 'connect-modal';
    dialog.innerHTML =
        '<div class="modal-frame"><header class="modal-header"><div class="modal-header-controls"></div></header><div class="device-view"><div class="control-wrapper"></div></div></div>';
    document.body.appendChild(dialog);
    const view = dialog.querySelector<HTMLElement>('.device-view')!;
    const holder = view.firstElementChild as HTMLElement;
    for (const title of ['Power', 'Back', 'Home', 'Overview']) {
        const button = document.createElement('button');
        button.title = title;
        button.className = 'control-button';
        holder.appendChild(button);
    }
    const apply = vi.fn();
    const player = { getVideoSettings: () => ({ bitrate: 8_000_000 }) } as unknown as BasePlayer;
    toolbar = new StreamToolbar(holder, view, player, apply);
    return { holder, dialog, apply };
}

describe('compact stream toolbar', () => {
    it('keeps exactly Back/Home/Overview/More visible and moves other controls into More', () => {
        const { holder } = build();
        expect(
            Array.from(holder.querySelectorAll('.stream-navigation button'), (b) => b.getAttribute('aria-label')),
        ).toEqual(['返回', 'Home', '多任务', '更多']);
        const panel = holder.querySelector<HTMLElement>('.stream-more-panel')!;
        expect(panel.hidden).toBe(true);
        holder.querySelector<HTMLButtonElement>('.stream-more-toggle')!.click();
        expect(panel.hidden).toBe(false);
        expect(panel.querySelector('[title="Power"]')).not.toBeNull();
    });

    it('applies a bitrate preset in bits per second and shows an honest video-only estimate', () => {
        const { holder, apply, dialog } = build();
        const preset = Array.from(holder.querySelectorAll<HTMLButtonElement>('.stream-bitrate-presets button')).find(
            (b) => b.textContent === '0.5 Mbps',
        )!;
        preset.click();
        expect(apply).toHaveBeenCalledWith(500_000);
        expect(holder.querySelector('output')!.textContent).toContain('3.8 MB/分钟');
        expect(dialog.querySelector('.stream-header-action:last-child')?.textContent ?? dialog.textContent).toContain(
            '0.5 Mbps',
        );
    });

    it('uses page fullscreen without the native API and can exit it', () => {
        const { holder, dialog } = build();
        const fullscreen = holder.querySelector<HTMLButtonElement>('.stream-menu-action')!;
        fullscreen.click();
        expect(dialog.classList.contains('stream-expanded')).toBe(true);
        expect(fullscreen.textContent).toBe('退出全屏');
        fullscreen.click();
        expect(dialog.classList.contains('stream-expanded')).toBe(false);
        expect(fullscreen.textContent).toBe('全屏');
    });
});
