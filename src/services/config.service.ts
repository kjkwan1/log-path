import { MultipleEndpointConfig, SingleEndpointConfig } from "../interfaces/log-config.interface";
import { LogConfig } from "../types/log-config.type";
import { isValidLogLevel } from "../types/log-level.type";
import { DEFAULT_CONFIG } from "../shared/default-config";

export class ConfigService {
    private static instance: ConfigService;
    private static config: LogConfig = DEFAULT_CONFIG;
    
    public static getInstance() {
        if (!this.instance) {
            this.instance = new ConfigService();
        }
        return this.instance;
    }

    public getConfig() {
        return ConfigService.config;
    }

    public setConfig(config: Partial<LogConfig>) {
        const isValid = this.validateConfig(config);
        if (!isValid) {
            throw new Error('Failed to set config, invalid config');
        }
        ConfigService.config = this.mergeConfig(ConfigService.config, config);
    }

    private validateConfig = (config: Partial<LogConfig>) => {
        if (typeof config.devMode !== 'boolean'
            || typeof config.logMode !== 'string'
            || !['single', 'multiple'].includes(config.logMode)
        ) {
            return false;
        }
    
        if (config.logMode === 'single') {
            return typeof (config as SingleEndpointConfig).endpoint === 'string';
        } else {
            const cfg = config as MultipleEndpointConfig;
            return Array.isArray(cfg)
                && cfg.endpointParams.every(({ logLevel, endpoint }) => isValidLogLevel(logLevel) && typeof endpoint === 'string')
        }
    }

    private mergeConfig = (existingConfig: LogConfig, newConfig: Partial<LogConfig>): LogConfig => {
        if (newConfig.logMode && newConfig.logMode !== existingConfig.logMode) {
            // If logMode is changing, we need to reset the endpoint configuration
            return {
                ...existingConfig,
                ...newConfig,
                ...(newConfig.logMode === 'single' 
                    ? { endpoint: (newConfig as SingleEndpointConfig).endpoint || (DEFAULT_CONFIG as SingleEndpointConfig).endpoint} 
                    : { endpointParams: (newConfig as MultipleEndpointConfig).endpointParams || [] })
            };
        }
    
        return {
            ...existingConfig,
            ...newConfig,
            ...(existingConfig.logMode === 'multiple' && newConfig.logMode !== 'single'
                ? { endpointParams: [...(existingConfig as MultipleEndpointConfig).endpointParams, ...((newConfig as MultipleEndpointConfig).endpointParams || [])] }
                : {})
        };
    }
}