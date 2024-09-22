import * as log4js from 'log4js';
import type { Logger } from 'log4js';
//
import { Config } from './config';
import type { ServerLoggerConfiguration } from '../types';

/**
 * Logger class
 */
class ServerLogger {
  /**
   * Log4js module
   */
  private readonly _log4js: typeof log4js;
  /**
   * Config instance object
   */
  private readonly _config: Config;
  /**
   * Logger object
   */
  private readonly _logger: Logger;

  constructor(root_path?: string) {
    this._log4js = log4js;
    this._config = new Config(root_path);
    this.init();
    this._logger = this._log4js.getLogger();
  }

  /**
   * Get Logger
   */
  get logger(): Logger {
    return this._logger;
  }

  /**
   * Get Config
   */
  get config(): Config {
    return this._config;
  }

  /**
   * Init ServerLogger object
   */
  private init(): void {
    const configServerLogger: ServerLoggerConfiguration = {
      appenders: {
        console: {
          type: 'console',
          layout: {
            type: 'pattern',
            pattern: `[%d{${this._config.dateFormat}}] : %[[%p]%] : %m`
          }
        },
        logFile: {
          type: 'file',
          filename: this._config.logFilePath,
          maxLogSize: '10M',
          compress: true,
          layout: {
            type: 'pattern',
            pattern: `[%d{${this._config.dateFormat}}] : [%p] : %m`
          }
        }
      },
      categories: {
        default: {
          appenders: this._config.devmode ? ['console'] : ['console', 'logFile'],
          level: this._config.logLevel,
          enableCallStack: this._config.devmode ? true : false
        }
      }
    };
    this._log4js.configure(configServerLogger);
  }
}

export { ServerLogger };
