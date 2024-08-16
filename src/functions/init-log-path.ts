import { LogConfig } from "types/log-config.type";
import { ConfigService } from "../services/config.service";

/**
 * Initializes the LogPath library with the provided configuration.
 * 
 * @param {LogConfig} config - The configuration object for LogPath
 * @throws Will throw an error if the provided configuration is invalid
 * 
 * @example
 * ```typescript
 * initLogPath({
 *   devMode: process.env.NODE_ENV !== 'production',
 *   logMode: 'single',
 *   endpoint: 'https://logs.example.com'
 * });
 * ```
 */
export const initLogPath = (params: Partial<LogConfig>) => {
    try {
        ConfigService.getInstance().setConfig(params);
    } catch (e) {
        console.error('Failed to initialize log path', e);
    }
}