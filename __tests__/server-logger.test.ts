/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Unit tests for src/class/server-logger.ts
 */
import { cwd } from 'node:process';
import { normalize, join } from 'node:path';
import type { Level } from 'log4js';
//
import { ServerLogger } from '../src/class/server-logger';
import { Config } from '../src/class/config';

const devConfigPath: string = normalize(join(cwd(), '__tests__', 'configs'));
const prodConfigPath: string = normalize(join(cwd(), '__tests__', 'configs', 'ak_prod'));
// const prodConfigPath: string = normalize(join(cwd(), '__tests__', 'config_prod'));
// const devConfig: Config = new Config(devConfigPath);
// const prodConfig: Config = new Config(prodConfigFile);

// Mock logger
let logMock: jest.SpyInstance;

describe('server-logger.ts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  /**
   * Instance test
   */
  it('server-logger instance', async () => {
    const serverLogger: ServerLogger = new ServerLogger(devConfigPath);
    expect(serverLogger instanceof ServerLogger).toBe(true);
  });
  it('server-logger instance - default path', async () => {
    // no config file
    try {
      new ServerLogger();
    } catch (error) {
      // eslint-disable-next-line jest/no-conditional-expect
      expect(error).toHaveProperty('message', 'Login or password must be filled in config.json file or Environment');
    }
  });
  /**
   * Get config from server logger
   */
  it('get config and logger from ServerLogger', async () => {
    // get config
    const serverLogger: ServerLogger = new ServerLogger(devConfigPath);
    expect(serverLogger.config instanceof Config).toBe(true);
    // logger log
    logMock = jest
      .spyOn(serverLogger.logger, 'log')
      .mockImplementation((_level: string | Level, ...args: any[]): any => {
        return args;
      });
    serverLogger.logger.log('hello world');
    expect(logMock).toHaveBeenNthCalledWith(1, 'hello world');
  });
  /**
   * Dev or Prod config logger
   */
  it('develop or prod config for logger', async () => {
    // develop
    // appenders, level, enableCallStack
    const serverLoggerDev: ServerLogger = new ServerLogger(devConfigPath);
    expect(serverLoggerDev.config.logFilePath).toBe('./logs/torrentdone.log');
    //
    const serverLoggerProd: ServerLogger = new ServerLogger(prodConfigPath);
    expect(serverLoggerProd.config.logFilePath).toBe('./logs/torrentdone_prod.log');
  });
});
