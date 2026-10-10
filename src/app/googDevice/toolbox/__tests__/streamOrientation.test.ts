// @vitest-environment jsdom
import { afterEach, expect, it } from 'vitest';
import { StreamOrientation } from '../StreamOrientation';
import { rotatedTouchPoint } from '../../../interactionHandler/rotatedTouch';

let orientation: StreamOrientation;
afterEach(() => orientation?.dispose());
function viewport(width: number, height: number) {
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: width });
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: height });
    window.dispatchEvent(new Event('resize'));
}
it('locks landscape inside a portrait viewport and follows subsequent physical rotation', () => {
    viewport(390, 844);
    const view = document.createElement('div');
    orientation = new StreamOrientation(view, 'landscape');
    orientation.setFullscreen(true);
    expect(view.dataset['viewRotation']).toBe('90');
    expect(view.style.width).toBe('844px');
    expect(view.style.height).toBe('390px');
    viewport(844, 390);
    expect(view.dataset['viewRotation']).toBe('0');
    expect(view.style.width).toBe('');
    orientation.setMode('portrait');
    expect(view.dataset['viewRotation']).toBe('90');
    orientation.setFullscreen(false);
    expect(view.dataset['viewRotation']).toBe('0');
});
it('uses fullscreen container dimensions rather than stale Safari innerHeight', () => {
    viewport(390, 844);
    const frame = document.createElement('div');
    frame.className = 'stream-fullscreen';
    frame.getBoundingClientRect = () => ({ width: 390, height: 744 }) as DOMRect;
    const view = document.createElement('div');
    frame.appendChild(view);
    orientation = new StreamOrientation(view, 'landscape');
    orientation.setFullscreen(true);
    expect(view.style.width).toBe('744px');
    expect(view.style.height).toBe('390px');
});

it('inverts the 90-degree display transform for device touch coordinates', () => {
    const rect = { left: 10, top: 20, width: 100, height: 200 };
    expect(rotatedTouchPoint(35, 70, rect, 1920, 1080)).toEqual({ x: 480, y: 810, invalid: false });
    expect(rotatedTouchPoint(0, 70, rect, 1920, 1080).invalid).toBe(true);
});
