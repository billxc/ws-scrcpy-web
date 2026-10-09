export function rotatedTouchPoint(
    clientX: number,
    clientY: number,
    rect: Pick<DOMRect, 'left' | 'top' | 'width' | 'height'>,
    videoWidth: number,
    videoHeight: number,
): { x: number; y: number; invalid: boolean } {
    const u = (clientX - rect.left) / rect.width;
    const v = (clientY - rect.top) / rect.height;
    return { x: v * videoWidth, y: (1 - u) * videoHeight, invalid: u < 0 || u > 1 || v < 0 || v > 1 };
}
