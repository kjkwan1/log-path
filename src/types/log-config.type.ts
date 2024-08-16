import { MultipleEndpointConfig, SingleEndpointConfig } from "../interfaces/log-config.interface";

/**
 * Configuration options for LogPath library.
 * 
 * @typedef {Object} LogConfig
 * @property {boolean} devMode - If true, logs are printed to console instead of sent to endpoints
 * @property {'single' | 'multiple'} logMode - Determines whether to use a single endpoint or multiple endpoints based on log level
 * @property {string} [endpoint] - The endpoint URL for logs when in 'single' mode
 * @property {Array<{logLevel: LogLevel, endpoint: string}>} [endpointParams] - Array of log levels and their corresponding endpoints for 'multiple' mode
 * 
 * @example
 * ```typescript
 * const config: LogConfig = {
 *   devMode: false,
 *   logMode: 'multiple',
 *   endpointParams: [
 *     { logLevel: 'error', endpoint: 'https://error-logs.example.com' },
 *     { logLevel: 'info', endpoint: 'https://info-logs.example.com' }
 *   ]
 * };
 * ```
 */
export type LogConfig = SingleEndpointConfig | MultipleEndpointConfig;