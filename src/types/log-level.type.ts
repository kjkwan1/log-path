const LogLevel = ['debug', 'info', 'warn', 'error'] as const;

export type LogLevel = typeof LogLevel[number];

export const isValidLogLevel = (logLevel: string): logLevel is LogLevel => LogLevel.indexOf(logLevel as LogLevel) !== -1;
