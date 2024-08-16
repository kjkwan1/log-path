import { LogData, LogPathOptions } from "../interfaces/log-path.interface";
import { ProcessContext } from "../interfaces/context.interface";
import { ConfigService } from "../services/config.service";
import { LogConfig } from "../types/log-config.type";
import { LogLevel } from "../types/log-level.type";
import { v4 as uuidv4 } from 'uuid';

// import * as https from 'https';

/**
 * WeakMap allows using key of objects with values that do not create strong references to its keys preventing garbage collection.
 * Taking advantage of this, using this function execution context as a key means that once the context terminates, the values will be automatically garbage collected.
 * Log system relies on the fact nested function calls share the same execution context. Uses `this` as key value to check whether or not the current context already exists
 * to meaningfully correlate children to parents.
 */
const contexts = new WeakMap<any, ProcessContext>();

/**
 * LogPath decorator for automatic function logging.
 * 
 * @remarks
 * This decorator automatically logs entry, error, and exit points for a function and its sub-functions 
 * that are also decorated with LogPath. It must be used in conjunction with initLogPath() for proper initialization.
 * 
 * @param {LogConfig} options - Configuration options for the LogPath decorator
 * @param options.isTopLevel - If true, creates a new process ID for this function call
 * @param options.logLevel - Specifies the log level for this function (default: 'info')
 * @param options.isSensitive - If true, prevents logging of function arguments
 * 
 * @example
 * ```typescript
 * LogPath({ isTopLevel: true, logLevel: 'debug' })
 * async function processOrder(orderId: string) {
 *   // Function implementation
 * }
 * ```
 * 
 * @throws Will throw an error if used before calling initLogPath()
 * 
 * @see {@link initLogPath} for initialization
 * @see {@link LogConfig} for configuring log endpoints
 */
export const LogPath = (options: LogPathOptions = {}) => {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
      const config = ConfigService.getInstance().getConfig();
      let context: ProcessContext;

      if (options.isTopLevel) {
        context = {
          processId: uuidv4()
        }
      } else if (!contexts.has(this)) {
        context = {
          processId: uuidv4(),
        };
        contexts.set(this, context);
      } else {
        const existingContext = contexts.get(this)!;
        context = {
          processId: uuidv4(),
          parentId: existingContext.processId
        };
        contexts.set(this, context);
      }

      const logLevel = options.logLevel || 'info';
      logEntry(config, context, target.constructor.name, propertyKey, args, logLevel, options.isSensitive || false);

      let result = originalMethod.apply(this, args);

      if (result instanceof Promise) {
        return result
          .then((result) => {
            logExit(config, context, target.constructor.name, propertyKey, logLevel);
            return result;
          })
          .catch((e) => {
            logError(config, context, target.constructor.name, propertyKey, e);
            throw e;
          })
          .finally(() => {
            if (options.isTopLevel) {
              contexts.delete(this);
            }
          });
      } else {
        logExit(config, context, target.constructor.name, propertyKey, logLevel);
        if (options.isTopLevel) {
          contexts.delete(this);
        }
        return result;
      }
    };

    return descriptor;
  };
};

const message = (
  logLevel: LogLevel,
  processId: string,
  className: string,
  methodName: string,
  action: 'Enter' | 'Exit' | 'Error',
  parentId?: string
) => parentId
    ? `${new Date().toISOString()} [${logLevel}: ${parentId} > ${processId}]: ${action} ${className}.${methodName}`
    : `${new Date().toISOString()} [${logLevel}: ${processId}]: ${action} ${className}.${methodName}`

const logEntry = (
  config: LogConfig,
  context: ProcessContext,
  className: string,
  methodName: string,
  args: any[],
  logLevel: LogLevel,
  isSensitive: boolean
) => {
  const logData: LogData = {
    processId: context.processId,
    parentId: context.parentId,
    logLevel,
    className,
    methodName,
    action: 'Enter',
    timestamp: Date.now(),
    message: message(logLevel, context.processId, className, methodName, 'Enter', context.parentId)
  };

  if (!isSensitive) {
    logData.args = args;
  }

  sendLog(config, logData, logLevel);
};

const logExit = (
  config: LogConfig,
  context: ProcessContext,
  className: string,
  methodName: string,
  logLevel: LogLevel
) => {
  const logData: LogData = {
    processId: context.processId,
    parentId: context.parentId,
    logLevel,
    className,
    methodName,
    action: 'Exit',
    timestamp: Date.now(),
    message: message(logLevel, context.processId, className, methodName, 'Exit', context.parentId)
  };

  sendLog(config, logData, logLevel);
};

const logError = (
  config: LogConfig,
  context: ProcessContext,
  className: string,
  methodName: string,
  error: unknown,
) => {
  const logData: LogData = {
    processId: context.processId,
    parentId: context.parentId,
    logLevel: 'error',
    className,
    methodName,
    action: 'Error',
    error: error instanceof Error ? error.message : String(error),
    timestamp: Date.now(),
    message: message('error', context.processId, className, methodName, 'Enter', context.parentId)
  };

  sendLog(config, logData, 'error');
};


const sendLog = (config: LogConfig, logData: LogData, logLevel: string) => {
  if (config.devMode) {
    console.log(
      logData.args && logData.args.length
        ? logData.message += ` with args ${JSON.stringify(logData.args)}`
        : logData.message
    );
    return;
  }

  // const options = {
  //     hostname: '',
  //     method: 'POST',
  //     headers: {
  //         'Content-Type': 'application/json',
  //     }
  // }

  // if (config.logMode === 'single') {
  //     options.hostname = (config as SingleEndpointConfig).endpoint;
  //     const request = https.request(options);

  //     request.on('error', (error) => {
  //         console.error('Failed to send logs due to an error', error);
  //     });

  //     request.write(JSON.stringify(logData));
  //     request.end();
  //     return;
  // }

  // const endpoints = (config as MultipleEndpointConfig).endpointParams.filter(param => param.logLevel === logLevel);
  // endpoints.forEach(endpoint => {
  //     const request = https.request({ ...options, hostname: endpoint.endpoint });
  //     request.on('error', error => console.error('Failed to send logs:', error));
  //     request.write(JSON.stringify(logData));
  //     request.end();
  // });
}