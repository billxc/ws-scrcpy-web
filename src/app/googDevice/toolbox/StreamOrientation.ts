export type StreamOrientationMode = 'auto' | 'portrait' | 'landscape';

/** Rotate the whole fullscreen view, including its controls, without rotating Android. */
export class StreamOrientation {
    private mode: StreamOrientationMode;
    private fullscreen = false;
    private readonly update = (): void => {
        const width = window.innerWidth;
        const height = window.innerHeight;
        const rotate = this.fullscreen && this.mode !== 'auto' && (this.mode === 'landscape') !== width >= height;
        this.view.classList.toggle('stream-view-rotated', rotate);
        this.view.dataset['viewRotation'] = rotate ? '90' : '0';
        this.view.style.setProperty('--stream-view-width', `${rotate ? height : width}px`);
        this.view.style.setProperty('--stream-view-height', `${rotate ? width : height}px`);
        this.view.style.width = rotate ? `${height}px` : '';
        this.view.style.height = rotate ? `${width}px` : '';
    };

    constructor(
        private readonly view: HTMLElement,
        mode: StreamOrientationMode,
    ) {
        this.mode = mode;
        window.addEventListener('resize', this.update);
    }

    public setMode(mode: StreamOrientationMode): void {
        this.mode = mode;
        this.update();
    }

    public setFullscreen(active: boolean): void {
        this.fullscreen = active;
        this.update();
    }

    public dispose(): void {
        window.removeEventListener('resize', this.update);
        this.fullscreen = false;
        this.update();
    }
}
