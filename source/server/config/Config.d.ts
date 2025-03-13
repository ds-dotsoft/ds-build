/**
 * ds-boilerplate
 * server/config/Config.ts
 */
import esbuild from "esbuild";
export declare class Config {
    config: esbuild.BuildOptions;
    constructor(config: esbuild.BuildOptions);
    computeEntrypoints(resourcePath: string): void;
    computePlugins(resourcePath: string): void;
    private isRecord;
}
