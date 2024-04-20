/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Unit tests for src/class/config.ts
 */

import { cwd } from 'node:process';
import { normalize, join } from 'node:path';
//
import { Config } from '../src/class/config';

describe('config.ts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  /**
   * Instance test
   */
  it('config instance', async () => {
    const testRootPath: string = normalize(join(cwd(), '__tests__', 'configs'));
    const config: Config = new Config(testRootPath);
    expect(config instanceof Config).toBe(true);
  });
  /**
   * Throw exceptions
   */
  it('config init error login - default path', async () => {
    // no config file
    try {
      new Config();
    } catch (error) {
      // eslint-disable-next-line jest/no-conditional-expect
      expect(error).toHaveProperty('message', 'Login or password must be filled in config.json file or Environment');
    }
  });
  it('config init error login', async () => {
    const testRootPath: string = normalize(join(cwd(), '__tests__', 'configs', 'no_login'));
    try {
      new Config(testRootPath);
    } catch (error) {
      // eslint-disable-next-line jest/no-conditional-expect
      expect(error).toHaveProperty('message', 'Login or password must be filled in config.json file or Environment');
    }
  });
  it('config check error tr environment value', async () => {
    const testRootPath: string = normalize(join(cwd(), '__tests__', 'configs', 'no_tr_env'));
    try {
      new Config(testRootPath);
    } catch (error) {
      // eslint-disable-next-line jest/no-conditional-expect
      expect(error).toHaveProperty(
        'message',
        `One or more parameters do not match the requirements: TR_APP_VERSION - "undefined", TR_TORRENT_ID - "200", TR_TORRENT_DIR - "/mnt/data/download", TR_TORRENT_NAME - "Some file name", TR_TORRENT_HASH - "9ef9e27600d656140ba016aa81460fe2e518cbda", TR_TIME_LOCALTIME - "Sun Nov  6 04:31:04 2022"`
      );
    }
  });
  /**
   * Get all parameters test
   */
  it('get base parameters', async () => {
    const testRootPath: string = normalize(join(cwd(), '__tests__', 'configs'));
    const config: Config = new Config(testRootPath);
    //
    expect(config.rootPath).toBe(testRootPath);
    expect(config.devmode).toBe(true);
    expect(config.appVersion).toBe('99.99.99');
    expect(config.logLevel).toBe('trace');
    expect(config.dateFormat).toBe('dd.MM.yyyy_hh:mm:ss.SSS');
    //
    expect(config.ipAddress).toBe('127.0.0.1');
    expect(config.port).toBe(9091);
    expect(config.allowedMediaExtensions).toStrictEqual(/.(mkv|mp4|avi)/i);
    expect(config.mediaPath).toBe(normalize(join(cwd(), '/__tests__/configs/mnt/data/media')));
    expect(config.serialsRootDir).toBe('TV Shows');
    expect(config.filmsRootDir).toBe('Movies');
    //
    expect(config.trAppVersion).toBe('33.00');
    expect(config.trTorrentId).toBe(200);
    expect(config.trTorrentName).toBe('Some file name');
    expect(config.trTorrentDir).toBe('/mnt/data/download');
    expect(config.trTorrentHash).toBe('9ef9e27600d656140ba016aa81460fe2e518cbda');
    expect(config.trTimeLocaltime).toBe('Sun Nov  6 04:31:04 2022');
    expect(config.trTorrentLabels).toBe('');
    expect(config.trTorrentBytesDownloaded).toBe(NaN);
    expect(config.trTorrentTrackers).toBe(undefined);
  });
  it('get once allowedMediaExtensions', async () => {
    const testRootPath: string = normalize(join(cwd(), '__tests__', 'configs', 'once_ext'));
    const config: Config = new Config(testRootPath);
    expect(config.allowedMediaExtensions).toStrictEqual(/.(mkv)/i);
  });
});
