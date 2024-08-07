type MenuOptions = {
    title: string;
    prompt: string;
    selBgColor: number;
    selFgColor: number;
    bgChar: number;
    borderChar: number;
    centerH: boolean;
    centerV: boolean;
    center: boolean;
    padding: number;
    selIndex: number;
    cancelable: boolean;
};
export declare function menu(choices: string[], passedOptions: Partial<MenuOptions>): Promise<number>;
export {};
