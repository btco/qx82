export declare class TextRendererFont {
    fontName_: string;
    fontImageFile_: string;
    origImg_: HTMLImageElement | null;
    chrImages_: HTMLImageElement[];
    charWidth_: number;
    charHeight_: number;
    origFgColor_: number;
    origBgColor_: number;
    constructor(fontName: string, fontImageFile: string);
    getCharWidth(): number;
    getCharHeight(): number;
    getImageForColor(colorNumber: number): HTMLImageElement;
    initAsync(): Promise<void>;
    regenColors(): void;
}
export declare class TextRenderer {
    fonts_: {
        [fontName: string]: TextRendererFont;
    };
    curFont_: TextRendererFont | null;
    origFgColor_: number | null;
    origBgColor_: number | null;
    constructor();
    initAsync(): Promise<void>;
    loadFontAsync(fontName: string, fontImageFile: string): Promise<void>;
    setFont(fontName: string): void;
    print(text: string): void;
    printCentered(text: string, width: number): void;
    printChar(ch: number, n?: number): void;
    spr(ch: number, x: number, y: number): void;
    drawText(x: number, y: number, text: string, fontName?: string): void;
    measure(text: string): {
        cols: number;
        rows: number;
    };
    printRect(width: number, height: number, ch: number): void;
    printBox(width: number, height: number, fill: boolean, borderCh: number): void;
    put_(ch: number, col: number, row: number, fgColor: number, bgColor: number): void;
    putxy_(ch: number, x: number, y: number, fgColor: number, bgColor: number, passedFont?: TextRendererFont): void;
    processEscapeSeq_(text: string, startPos: number, pretend?: boolean): number;
    runEscapeCommand_(command: string): void;
    regenColors(): void;
}
