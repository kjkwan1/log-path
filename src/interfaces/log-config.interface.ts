import { LogLevel } from "types/log-level.type";
import { LogMode } from "types/log-mode.type";

/**
 * Specify an endpoint to send logs to based on log level. You may provide multiple endpoints for any log level if necessary.
 * @property {LogLevel} logLevel debug, info, warn, or error 
 */
export interface LogLevelTo {
    logLevel: LogLevel;
    endpoint: string;
}

interface LogConfig {
    devMode: boolean;
    logMode: LogMode;
}

export interface MultipleEndpointConfig extends LogConfig {
    endpointParams: LogLevelTo[];
}

export interface SingleEndpointConfig extends LogConfig {
    endpoint: string;
}