export declare class InputSys {
    keysHeld_: Set<string>;
    keysJustPressed_: Set<string>;
    constructor();
    keyHeld(keyName: string): boolean;
    keyJustPressed(keyName: string): boolean;
    onEndFrame(): void;
    onKeyDown(e: {
        key: string;
    }): void;
    onKeyUp(e: {
        key: string;
    }): void;
    readKeyAsync(): Promise<string>;
    readLine(initString: string, maxLen: number, maxWidth?: number): Promise<string>;
}
