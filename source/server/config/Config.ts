/**
 * ds-boilerplate
 * server/config/Config.ts
 */

import esbuild from "esbuild";
import path from "path";

import fs from "fs";
import { dtsPlugin } from "esbuild-plugin-d.ts";

export class Config {
    config: esbuild.BuildOptions;  

    constructor(config: esbuild.BuildOptions) {
        this.config = config;
    }

    computeEntrypoints(resourcePath: string) {
        // If no entrypoint was supplied.
        if (!this.config.entryPoints)
            return;

        let entrypoints: string[] = [];

        if (Array.isArray(this.config.entryPoints)) {
            this.config.entryPoints.forEach((entrypoint) => typeof entrypoint === "string" ? entrypoints.push(entrypoint) : entrypoints.push(entrypoint.in));
        }
        else if (this.isRecord(this.config.entryPoints)) {
            Object.values(this.config.entryPoints).forEach((entrypoint) => entrypoints.push(entrypoint));
        }
        else {
            return;
        }

        // console.log(entrypoints.toString());
        entrypoints.forEach(console.log);
        this.config.entryPoints = entrypoints.map((entrypoint) => path.join(path.resolve(resourcePath), entrypoint));
        // console.log(this.config.entryPoints.toString());
    }

    computePlugins(resourcePath: string) {
        if (!this.config.plugins)
            this.config.plugins = [];

        if (!this.config.entryPoints)
            return;

        // console.log(this.config.entryPoints);
        // (this.config.entryPoints as string[]).forEach((entrypoint) => console.log(entrypoint));

        const dir = path.parse((this.config.entryPoints as string[])[0]).dir
        const tsconfig = path.join(dir, "./tsconfig.json");
    
        // console.log(dir, "\n");
        // console.log(path.resolve(resourcePath), "\n")
        // console.log(tsconfig, "\n");

        // const tsconfig = path.join(path.parse(path.join(resourcePath, (this.config.entryPoints as string[])[0])).dir, "./tsconfig.json");
        if (!fs.existsSync(tsconfig))
            return; // No tsconfig exists, don't bother pushing config.

        // console.log(tsconfig.toString());
        this.config.plugins.push(dtsPlugin({ tsconfig }));
    }

    // Private methods
    private isRecord(value: Array<string> | Object | Record<string, string> | undefined): boolean {
        return typeof value === 'object' && value !== null && !Array.isArray(value);
    }
}