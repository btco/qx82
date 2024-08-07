export declare function key(): Promise<string>;
export declare function readLine(initString?: string, maxLen?: number, maxWidth?: number): Promise<string>;
export declare function menu(choices: string[], options?: {}): Promise<number>;
export declare function dialog(prompt: string, choices?: string[]): Promise<number>;
export declare function wait(seconds: number): Promise<void>;
export declare function typewriter(text: string, delay?: number): Promise<void>;
export declare function loadImage(url: string): Promise<unknown>;
export declare function loadSound(url: string): Promise<unknown>;
export declare function loadFont(fontImageFile: string): Promise<string>;
