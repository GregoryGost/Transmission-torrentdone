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
   * Config instance object
   */
  private readonly _config: Config;
  /**
   * Log4js module
   */
  private readonly _log4js: typeof log4js;
  /**
   * Logger object
   */
  private readonly _logger: Logger;

  constructor(root_path?: string) {
    this._config = new Config(root_path);
    this._log4js = log4js;
    this.init();
    this._logger = this._log4js.getLogger();
  }

  /**
   * Get Config instance object
   * @returns {Config} nconf instance object
   */
  get config(): Config {
    return this._config;
  }

  /**
   * Get logger instance object
   * @returns {Logger} log4js logger instance object
   */
  get logger(): Logger {
    return this._logger;
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
            pattern: `[%d{${this.config.dateFormat}}] : %[[%p]%] : %m`
          }
        },
        logFile: {
          type: 'file',
          filename: this.config.logFilePath,
          maxLogSize: '10M',
          compress: true,
          layout: {
            type: 'pattern',
            pattern: `[%d{${this.config.dateFormat}}] : [%p] : %m`
          }
        }
      },
      categories: {
        default: {
          appenders: this.config.devmode ? ['console'] : ['console', 'logFile'],
          level: this.config.logLevel,
          enableCallStack: this.config.devmode ? true : false
        }
      }
    };
    this._log4js.configure(configServerLogger);
  }
}

export { ServerLogger };
