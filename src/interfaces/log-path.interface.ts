import { LogLevel } from "../types/log-level.type";

export interface LogPathOptions {
    isTopLevel?: boolean;
    logInputs?: boolean;
    isSensitive?: boolean;
    logLevel?: LogLevel;
}

export interface LogData {
    processId: string;
    logLevel: LogLevel;
    className: string;
    methodName: string;
    action: 'Enter' | 'Error' | 'Exit';
    timestamp: number;
    message: string;
    error?: string;
    parentId?: string;
    args?: any[];
}