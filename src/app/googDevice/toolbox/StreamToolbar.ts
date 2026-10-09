import '../../../style/mobile-stream.css';
import type { BasePlayer } from '../../player/BasePlayer';

const NAVIGATION = new Map([
    ['Back', '返回'],
    ['Home', 'Home'],
    ['Overview', '多任务'],
]);

/** Compact navigation with the existing controls tucked into a stream-local menu. */
export class StreamToolbar {
    private readonly panel = document.createElement('div');
    private readonly more = document.createElement('button');
    private readonly fullscreenButton = document.createElement('button');
    private readonly bitrateButton = document.createElement('button');
    private readonly bitrate = document.createElement('input');
    private readonly summary = document.createElement('output');
    private readonly fullscreenTarget: HTMLElement;
    private readonly dialog: HTMLDialogElement | null;
    private readonly headerButtons: HTMLButtonElement[] = [];

    constructor(
        holder: HTMLElement,
        deviceView: HTMLElement,
        player: BasePlayer,
        applyBitrate: (bitrate: number) => void,
    ) {
        holder.classList.add('compact-toolbar');
        const existing = Array.from(holder.children) as HTMLElement[];
        const navigation = document.createElement('div');
        navigation.className = 'stream-navigation';
        for (const [title, label] of NAVIGATION) {
            const button = existing.find((element) => element.title === title)!;
            button.setAttribute('aria-label', label);
            navigation.appendChild(button);
        }
        this.more.className = 'control-button stream-more-toggle';
        this.more.textContent = '⋮';
        this.more.title = 'More';
        this.more.setAttribute('aria-label', '更多');
        this.more.setAttribute('aria-expanded', 'false');
        this.more.onclick = () => this.setMenuOpen(this.panel.hidden === true);
        navigation.appendChild(this.more);

        this.panel.className = 'stream-more-panel';
        this.panel.hidden = true;
        this.panel.setAttribute('aria-label', '更多控制');
        this.dialog = deviceView.closest<HTMLDialogElement>('dialog.connect-modal');
        this.fullscreenTarget = deviceView.closest<HTMLElement>('.modal-frame') ?? deviceView;
        this.fullscreenButton.className = 'stream-menu-action';
        this.fullscreenButton.textContent = '全屏';
        this.fullscreenButton.onclick = () => void this.toggleFullscreen();
        this.panel.appendChild(this.fullscreenButton);

        const quality = document.createElement('form');
        quality.className = 'stream-quality';
        const heading = document.createElement('strong');
        heading.textContent = '视频码率';
        quality.appendChild(heading);
        const presets = document.createElement('div');
        presets.className = 'stream-bitrate-presets';
        for (const value of [0.5, 1, 2, 4, 8]) {
            const button = document.createElement('button');
            button.type = 'button';
            button.textContent = `${value} Mbps`;
            button.onclick = () => {
                this.bitrate.value = String(value);
                quality.requestSubmit();
            };
            presets.appendChild(button);
        }
        quality.appendChild(presets);
        const custom = document.createElement('label');
        custom.className = 'stream-bitrate-custom';
        custom.append('自定义 Mbps');
        this.bitrate.type = 'number';
        this.bitrate.min = '0.25';
        this.bitrate.max = '50';
        this.bitrate.step = '0.25';
        this.bitrate.required = true;
        this.bitrate.inputMode = 'decimal';
        this.bitrate.setAttribute('aria-label', '视频码率 Mbps');
        this.bitrate.value = String(player.getVideoSettings().bitrate / 1_000_000);
        custom.appendChild(this.bitrate);
        const apply = document.createElement('button');
        apply.type = 'submit';
        apply.textContent = '应用';
        custom.appendChild(apply);
        quality.append(custom, this.summary);
        const note = document.createElement('small');
        note.textContent = '流量估算仅含视频，实际还含音频及网络开销。切换会短暂重连，设置自动保存。';
        quality.appendChild(note);
        quality.onsubmit = (event) => {
            event.preventDefault();
            applyBitrate(Math.round(this.bitrate.valueAsNumber * 1_000_000));
            this.updateBitrateLabel();
        };
        this.panel.appendChild(quality);
        this.updateBitrateLabel();

        const secondary = document.createElement('div');
        secondary.className = 'stream-secondary-controls control-wrapper';
        for (const element of existing) {
            if (NAVIGATION.has(element.title)) continue;
            if (element.matches('.control-button')) {
                const label = document.createElement('span');
                label.textContent = element.title;
                element.appendChild(label);
            }
            secondary.appendChild(element);
        }
        this.panel.appendChild(secondary);
        const close = document.createElement('button');
        close.className = 'stream-menu-action';
        close.textContent = '关闭投屏';
        close.onclick = () =>
            this.dialog?.querySelector<HTMLButtonElement>('.modal-header .modal-close:last-child')?.click();
        if (this.dialog) this.panel.appendChild(close);
        holder.append(navigation, this.panel);

        const header = this.dialog?.querySelector('.modal-header-controls');
        if (header) {
            const fullscreen = document.createElement('button');
            fullscreen.className = 'stream-header-action';
            fullscreen.textContent = '全屏';
            fullscreen.onclick = () => void this.toggleFullscreen();
            this.bitrateButton.className = 'stream-header-action';
            this.bitrateButton.onclick = () => this.setMenuOpen(this.panel.hidden === true);
            header.prepend(fullscreen, this.bitrateButton);
            this.headerButtons.push(fullscreen, this.bitrateButton);
        }
        document.addEventListener('fullscreenchange', this.onFullscreenChange);
    }

    private setMenuOpen(open: boolean): void {
        this.panel.hidden = !open;
        this.more.setAttribute('aria-expanded', String(open));
    }

    private updateBitrateLabel(): void {
        const mbps = this.bitrate.valueAsNumber;
        this.bitrateButton.textContent = `码率 · ${mbps} Mbps`;
        this.summary.textContent = `当前 ${mbps} Mbps ≈ ${(mbps * 7.5).toFixed(1)} MB/分钟`;
    }

    private setFullscreen(active: boolean): void {
        this.fullscreenTarget.classList.toggle('stream-fullscreen', active);
        this.dialog?.classList.toggle('stream-expanded', active);
        this.fullscreenButton.textContent = active ? '退出全屏' : '全屏';
    }

    private readonly onFullscreenChange = (): void => {
        this.setFullscreen(document.fullscreenElement === this.fullscreenTarget);
    };

    private async toggleFullscreen(): Promise<void> {
        this.setMenuOpen(false);
        if (this.fullscreenTarget.classList.contains('stream-fullscreen')) {
            if (document.fullscreenElement === this.fullscreenTarget) await document.exitFullscreen();
            this.setFullscreen(false);
            return;
        }
        this.setFullscreen(true);
        if (this.fullscreenTarget.requestFullscreen) {
            try {
                await this.fullscreenTarget.requestFullscreen();
            } catch {
                // Keep page fullscreen when the browser refuses native fullscreen (e.g. iPhone).
            }
        }
    }

    public dispose(): void {
        document.removeEventListener('fullscreenchange', this.onFullscreenChange);
        if (document.fullscreenElement === this.fullscreenTarget) void document.exitFullscreen();
        this.setFullscreen(false);
        this.headerButtons.forEach((button) => button.remove());
    }
}
