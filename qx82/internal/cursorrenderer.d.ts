export declare class CursorRenderer {
    blinkCycle_: number;
    toggleBlinkHandle_: number | null;
    constructor();
    setCursorVisible(visible: boolean): void;
    advanceBlink_(): void;
    drawCursor(targetCtx: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number): void;
}
