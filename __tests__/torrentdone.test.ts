/* eslint-disable jest/no-commented-out-tests */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Unit tests for src/class/torrentdone.ts
 */
import { cwd, env } from 'node:process';
import { normalize, join } from 'node:path';
import fs, { rmSync, existsSync, copyFileSync, symlinkSync } from 'node:fs';
import cproc from 'node:child_process';
import type { Level } from 'log4js';
//
// import { Config } from '../src/class/config';
// import { ServerLogger } from '../src/class/server-logger';
import { Torrentdone } from '../src/class/torrentdone';

const testRoot: string = normalize(cwd());
const testRootConfigsPath: string = normalize(join(cwd(), '__tests__', 'configs'));
const logFilePath = './logs/torrentdone.log';
const testMntDataPath = normalize(`${testRoot}/__tests__/configs/mnt/data`);
const testMntDownloadsPath = normalize(`${testRoot}/__tests__/mnt/downloads`);
const version = '3.00';
// const configFile: string = normalize(`${testRoot}/__tests__/configs/test.json`);

// Mock logger
let logInfoMock: jest.SpyInstance;
let logDebugMock: jest.SpyInstance;
let logErrorMock: jest.SpyInstance;
// let logTraceMock: jest.SpyInstance;

// Mock node functions
// let execSyncMock: jest.SpyInstance;
// let readdirSyncMock: jest.SpyInstance;

// Basically, logs are added to the file and target directories. Remove before testing.
if (existsSync(logFilePath)) rmSync(logFilePath);
if (existsSync(testMntDataPath)) rmSync(testMntDataPath, { recursive: true });

describe('torrentdone.ts - Main tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('Torrentdone class instance and init params', () => {
    // Set variables like transmission does
    env.TR_APP_VERSION = version;
    env.TR_TORRENT_ID = '555';
    env.TR_TORRENT_NAME = 'INSTANCE_TEST.mp4';
    env.TR_TORRENT_DIR = '/mnt/media/download/';
    env.TR_TORRENT_HASH = '540d0ae0eac6cc48e321e54293b19b858db355da';
    env.TR_TIME_LOCALTIME = 'Fri Nov  4 17:22:09 2022';
    env.TR_TORRENT_LABELS = '';
    env.TR_TORRENT_BYTES_DOWNLOADED = '';
    env.TR_TORRENT_TRACKERS = '';
    // Create Torrentdone class instance
    const torrentdone: Torrentdone = new Torrentdone(testRootConfigsPath);
    expect(torrentdone).toBeInstanceOf(Torrentdone);
    expect(typeof torrentdone.TR_APP_VERSION).toEqual('string');
    expect(torrentdone.TR_APP_VERSION).toEqual(version);
    expect(typeof torrentdone.TR_TORRENT_ID).toEqual('number');
    expect(torrentdone.TR_TORRENT_ID).toEqual(555);
    expect(typeof torrentdone.TR_TORRENT_NAME).toEqual('string');
    expect(torrentdone.TR_TORRENT_NAME).toEqual('INSTANCE_TEST.mp4');
    expect(typeof torrentdone.TR_TORRENT_DIR).toEqual('string');
    expect(torrentdone.TR_TORRENT_DIR).toEqual('/mnt/media/download/');
    expect(typeof torrentdone.TR_TORRENT_HASH).toEqual('string');
    expect(torrentdone.TR_TORRENT_HASH).toEqual('540d0ae0eac6cc48e321e54293b19b858db355da');
    expect(typeof torrentdone.TR_TIME_LOCALTIME).toEqual('string');
    expect(torrentdone.TR_TIME_LOCALTIME).toEqual('Fri Nov  4 17:22:09 2022');
    expect(typeof torrentdone.TR_TORRENT_LABELS).toEqual('string');
    expect(torrentdone.TR_TORRENT_LABELS).toEqual('');
    expect(typeof torrentdone.TR_TORRENT_BYTES_DOWNLOADED).toEqual('number');
    expect(torrentdone.TR_TORRENT_BYTES_DOWNLOADED).toEqual(0);
    expect(typeof torrentdone.TR_TORRENT_TRACKERS).toEqual('string');
    expect(torrentdone.TR_TORRENT_TRACKERS).toEqual('');
  });
});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// SERIALS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

describe('torrentdone.ts - Serials single files', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  // 100
  it(`OK - 100 - The.Handmaid's.Tale.S05E03.1080p.rus.LostFilm.TV.mkv`, async () => {
    env.TR_APP_VERSION = version;
    env.TR_TORRENT_ID = '100';
    env.TR_TORRENT_NAME = `The.Handmaid's.Tale.S05E03.1080p.rus.LostFilm.TV.mkv`;
    env.TR_TORRENT_DIR = testMntDownloadsPath;
    env.TR_TORRENT_HASH = '540d0ae0eac6cc48e321e54293b19b858db355da';
    env.TR_TIME_LOCALTIME = 'Fri Nov  4 17:22:09 2022';
    env.TR_TORRENT_LABELS = '';
    env.TR_TORRENT_BYTES_DOWNLOADED = '';
    env.TR_TORRENT_TRACKERS = '';
    //
    const torrentdone: Torrentdone = new Torrentdone(testRootConfigsPath);
    //
    logInfoMock = jest
      .spyOn(torrentdone.logger, 'info')
      .mockImplementation((_level: string | Level, ...args: any[]): any => {
        return args;
      });
    logDebugMock = jest
      .spyOn(torrentdone.logger, 'debug')
      .mockImplementation((_level: string | Level, ...args: any[]): any => {
        return args;
      });
    logErrorMock = jest
      .spyOn(torrentdone.logger, 'error')
      .mockImplementation((_level: string | Level, ...args: any[]): any => {
        return args;
      });
    jest.spyOn(torrentdone.logger, 'trace').mockImplementation();
    //
    jest.spyOn(cproc, 'execSync').mockImplementation(() => {
      copyFileSync(
        normalize(`${testMntDownloadsPath}/The.Handmaid's.Tale.S05E03.1080p.rus.LostFilm.TV.mkv`),
        normalize(
          `${testMntDataPath}/media/TV Shows/The Handmaid's Tale/Season 05/The.Handmaid's.Tale.S05E03.1080p.rus.LostFilm.TV.mkv`
        )
      );
      return `127.0.0.1:9091/transmission/rpc/\nresponded: "success"`;
    });
    //
    expect(torrentdone.TR_APP_VERSION).toEqual(version);
    expect(torrentdone.TR_TORRENT_ID).toEqual(100);
    expect(torrentdone.TR_TORRENT_NAME).toEqual(`The.Handmaid's.Tale.S05E03.1080p.rus.LostFilm.TV.mkv`);
    expect(torrentdone.TR_TORRENT_DIR).toEqual(testMntDownloadsPath);
    expect(torrentdone.TR_TORRENT_HASH).toEqual('540d0ae0eac6cc48e321e54293b19b858db355da');
    expect(torrentdone.TR_TIME_LOCALTIME).toEqual('Fri Nov  4 17:22:09 2022');
    expect(torrentdone.TR_TORRENT_LABELS).toEqual('');
    expect(torrentdone.TR_TORRENT_BYTES_DOWNLOADED).toEqual(0);
    expect(torrentdone.TR_TORRENT_TRACKERS).toEqual('');
    // Run process
    await torrentdone.main();
    // log Info
    expect(logInfoMock).toHaveBeenNthCalledWith(
      1,
      '##############################################################################################'
    );
    expect(logInfoMock).toHaveBeenNthCalledWith(2, `transmission-torrentdone RUN`);
    expect(logInfoMock).toHaveBeenNthCalledWith(3, `TORRENT ID: "100" FINISH: START PROCESS ...`);
    expect(logInfoMock).toHaveBeenNthCalledWith(
      4,
      `==============================================================================================`
    );
    // log Debug
    expect(logDebugMock).toHaveBeenNthCalledWith(1, `Element: file extension: ".mkv"`);
    expect(logDebugMock).toHaveBeenNthCalledWith(
      2,
      `Element: full path: "${testMntDownloadsPath}${normalize('/')}The.Handmaid's.Tale.S05E03.1080p.rus.LostFilm.TV.mkv"`
    );
    expect(logDebugMock).toHaveBeenNthCalledWith(
      3,
      `Check Releaser for: "The.Handmaid's.Tale.S05E03.1080p.rus.LostFilm.TV.mkv"`
    );
    expect(logDebugMock).toHaveBeenNthCalledWith(4, `Releaser regex: "/lostfilm/i"`);
    expect(logDebugMock).toHaveBeenNthCalledWith(5, `RELEASER: lostfilm`);
    expect(logDebugMock).toHaveBeenNthCalledWith(
      6,
      `Check Serial or Film: "The.Handmaid's.Tale.S05E03.1080p.rus.LostFilm.TV.mkv"`
    );
    expect(logDebugMock).toHaveBeenNthCalledWith(7, `File check is regex: "/(s\\d{2}e\\d{2}).+(lostfilm)/i"`);
    expect(logDebugMock).toHaveBeenNthCalledWith(
      8,
      `Extract serial data on regex: "/(.+)\\.?([sS]([0-9]{2}))/i" from file "The.Handmaid's.Tale.S05E03.1080p.rus.LostFilm.TV.mkv"`
    );
    expect(logDebugMock).toHaveBeenNthCalledWith(
      9,
      `Extracted data (lostfilm): name="The.Handmaid's.Tale" dirName="The Handmaid's Tale" season="Season 05"`
    );
    expect(logDebugMock).toHaveBeenNthCalledWith(
      10,
      `Processing serial file: "The.Handmaid's.Tale.S05E03.1080p.rus.LostFilm.TV.mkv"`
    );
    expect(logDebugMock).toHaveBeenNthCalledWith(
      11,
      `Saving path: "${testMntDataPath}${normalize(`/media/TV Shows/The Handmaid's Tale/Season 05`)}"`
    );
    expect(logDebugMock).toHaveBeenNthCalledWith(12, `Saving path does not exist. Create the missing folders.`);
    expect(logDebugMock).toHaveBeenNthCalledWith(13, `Saving path directories is created`);
    expect(logDebugMock).toHaveBeenNthCalledWith(
      14,
      `Move command: "transmission-remote 127.0.0.1:9091 --auth test:testPwd --torrent 100 --move "${testMntDataPath}${normalize(`/media/TV Shows/The Handmaid's Tale/Season 05`)}""`
    );
    expect(logDebugMock).toHaveBeenNthCalledWith(15, `Start moving file...`);
    expect(logDebugMock).toHaveBeenNthCalledWith(
      16,
      `execResult: 127.0.0.1:9091/transmission/rpc/responded: "success"`
    );
    expect(logDebugMock).toHaveBeenNthCalledWith(
      17,
      `File final path: "${testMntDataPath}${normalize(`/media/TV Shows/The Handmaid's Tale/Season 05/The.Handmaid's.Tale.S05E03.1080p.rus.LostFilm.TV.mkv`)}"`
    );
    // Log Error
    expect(logErrorMock).not.toHaveBeenCalled();
  });
  // 101
  it(`OK - 101 - Andor.S01E10.720p.rus.LostFilm.TV.mp4`, async () => {
    env.TR_APP_VERSION = version;
    env.TR_TORRENT_ID = '101';
    env.TR_TORRENT_NAME = `Andor.S01E10.720p.rus.LostFilm.TV.mp4`;
    env.TR_TORRENT_DIR = testMntDownloadsPath;
    env.TR_TORRENT_HASH = '540d0ae0eac6cc48e321e54293b19b858db355db';
    env.TR_TIME_LOCALTIME = 'Fri Nov  4 18:22:09 2022';
    env.TR_TORRENT_LABELS = '';
    env.TR_TORRENT_BYTES_DOWNLOADED = '';
    env.TR_TORRENT_TRACKERS = '';
    //
    const torrentdone: Torrentdone = new Torrentdone(testRootConfigsPath);
    //
    logInfoMock = jest
      .spyOn(torrentdone.logger, 'info')
      .mockImplementation((_level: string | Level, ...args: any[]): any => {
        return args;
      });
    logDebugMock = jest
      .spyOn(torrentdone.logger, 'debug')
      .mockImplementation((_level: string | Level, ...args: any[]): any => {
        return args;
      });
    logErrorMock = jest
      .spyOn(torrentdone.logger, 'error')
      .mockImplementation((_level: string | Level, ...args: any[]): any => {
        return args;
      });
    jest.spyOn(torrentdone.logger, 'trace').mockImplementation();
    //
    jest.spyOn(cproc, 'execSync').mockImplementation(() => {
      copyFileSync(
        normalize(`${testMntDownloadsPath}/Andor.S01E10.720p.rus.LostFilm.TV.mp4`),
        normalize(`${testMntDataPath}/media/TV Shows/Andor/Season 01/Andor.S01E10.720p.rus.LostFilm.TV.mp4`)
      );
      return `127.0.0.1:9091/transmission/rpc/\nresponded: "success"`;
    });
    //
    expect(torrentdone.TR_APP_VERSION).toEqual(version);
    expect(torrentdone.TR_TORRENT_ID).toEqual(101);
    expect(torrentdone.TR_TORRENT_NAME).toEqual(`Andor.S01E10.720p.rus.LostFilm.TV.mp4`);
    expect(torrentdone.TR_TORRENT_DIR).toEqual(testMntDownloadsPath);
    expect(torrentdone.TR_TORRENT_HASH).toEqual('540d0ae0eac6cc48e321e54293b19b858db355db');
    expect(torrentdone.TR_TIME_LOCALTIME).toEqual('Fri Nov  4 18:22:09 2022');
    expect(torrentdone.TR_TORRENT_LABELS).toEqual('');
    expect(torrentdone.TR_TORRENT_BYTES_DOWNLOADED).toEqual(0);
    expect(torrentdone.TR_TORRENT_TRACKERS).toEqual('');
    //
    await torrentdone.main();
    // log Info
    expect(logInfoMock).toHaveBeenNthCalledWith(3, `TORRENT ID: "101" FINISH: START PROCESS ...`);
    // log Error
    expect(logErrorMock).not.toHaveBeenCalled();
  });
  // 102
  it(`OK - 102 - californication.s06e08.hdtv.rus.eng.novafilm.tv.avi`, async () => {
    env.TR_APP_VERSION = version;
    env.TR_TORRENT_ID = '102';
    env.TR_TORRENT_NAME = `californication.s06e08.hdtv.rus.eng.novafilm.tv.avi`;
    env.TR_TORRENT_DIR = testMntDownloadsPath;
    env.TR_TORRENT_HASH = '540d0ae0eac6cc48e321e54293b19b858db355dc';
    env.TR_TIME_LOCALTIME = 'Fri Nov  4 19:22:09 2022';
    env.TR_TORRENT_LABELS = '';
    env.TR_TORRENT_BYTES_DOWNLOADED = '';
    env.TR_TORRENT_TRACKERS = '';
    //
    const torrentdone: Torrentdone = new Torrentdone(testRootConfigsPath);
    //
    logInfoMock = jest
      .spyOn(torrentdone.logger, 'info')
      .mockImplementation((_level: string | Level, ...args: any[]): any => {
        return args;
      });
    logDebugMock = jest
      .spyOn(torrentdone.logger, 'debug')
      .mockImplementation((_level: string | Level, ...args: any[]): any => {
        return args;
      });
    logErrorMock = jest
      .spyOn(torrentdone.logger, 'error')
      .mockImplementation((_level: string | Level, ...args: any[]): any => {
        return args;
      });
    jest.spyOn(torrentdone.logger, 'trace').mockImplementation();
    //
    jest.spyOn(cproc, 'execSync').mockImplementation(() => {
      copyFileSync(
        normalize(`${testMntDownloadsPath}/californication.s06e08.hdtv.rus.eng.novafilm.tv.avi`),
        normalize(
          `${testMntDataPath}/media/TV Shows/Californication/Season 06/californication.s06e08.hdtv.rus.eng.novafilm.tv.avi`
        )
      );
      return `127.0.0.1:9091/transmission/rpc/\nresponded: "success"`;
    });
    //
    expect(torrentdone.TR_APP_VERSION).toEqual(version);
    expect(torrentdone.TR_TORRENT_ID).toEqual(102);
    expect(torrentdone.TR_TORRENT_NAME).toEqual(`californication.s06e08.hdtv.rus.eng.novafilm.tv.avi`);
    expect(torrentdone.TR_TORRENT_DIR).toEqual(testMntDownloadsPath);
    expect(torrentdone.TR_TORRENT_HASH).toEqual('540d0ae0eac6cc48e321e54293b19b858db355dc');
    expect(torrentdone.TR_TIME_LOCALTIME).toEqual('Fri Nov  4 19:22:09 2022');
    expect(torrentdone.TR_TORRENT_LABELS).toEqual('');
    expect(torrentdone.TR_TORRENT_BYTES_DOWNLOADED).toEqual(0);
    expect(torrentdone.TR_TORRENT_TRACKERS).toEqual('');
    //
    await torrentdone.main();
    // log Info
    expect(logInfoMock).toHaveBeenNthCalledWith(3, `TORRENT ID: "102" FINISH: START PROCESS ...`);
    // log Error
    expect(logErrorMock).not.toHaveBeenCalled();
  });
  // 103
  it(`OK - 103 - paradox.s01e04.web-dl.rus.avi`, async () => {
    env.TR_APP_VERSION = version;
    env.TR_TORRENT_ID = '103';
    env.TR_TORRENT_NAME = `paradox.s01e04.web-dl.rus.avi`;
    env.TR_TORRENT_DIR = testMntDownloadsPath;
    env.TR_TORRENT_HASH = '540d0ae0eac6cc48e321e54293b19b858db355dd';
    env.TR_TIME_LOCALTIME = 'Fri Nov  4 20:22:09 2022';
    env.TR_TORRENT_LABELS = '';
    env.TR_TORRENT_BYTES_DOWNLOADED = '';
    env.TR_TORRENT_TRACKERS = '';
    //
    const torrentdone: Torrentdone = new Torrentdone(testRootConfigsPath);
    //
    logInfoMock = jest
      .spyOn(torrentdone.logger, 'info')
      .mockImplementation((_level: string | Level, ...args: any[]): any => {
        return args;
      });
    logDebugMock = jest
      .spyOn(torrentdone.logger, 'debug')
      .mockImplementation((_level: string | Level, ...args: any[]): any => {
        return args;
      });
    logErrorMock = jest
      .spyOn(torrentdone.logger, 'error')
      .mockImplementation((_level: string | Level, ...args: any[]): any => {
        return args;
      });
    jest.spyOn(torrentdone.logger, 'trace').mockImplementation();
    //
    jest.spyOn(cproc, 'execSync').mockImplementation(() => {
      copyFileSync(
        normalize(`${testMntDownloadsPath}/paradox.s01e04.web-dl.rus.avi`),
        normalize(`${testMntDataPath}/media/TV Shows/Paradox/Season 01/paradox.s01e04.web-dl.rus.avi`)
      );
      return `127.0.0.1:9091/transmission/rpc/\nresponded: "success"`;
    });
    //
    expect(torrentdone.TR_APP_VERSION).toEqual(version);
    expect(torrentdone.TR_TORRENT_ID).toEqual(103);
    expect(torrentdone.TR_TORRENT_NAME).toEqual(`paradox.s01e04.web-dl.rus.avi`);
    expect(torrentdone.TR_TORRENT_DIR).toEqual(testMntDownloadsPath);
    expect(torrentdone.TR_TORRENT_HASH).toEqual('540d0ae0eac6cc48e321e54293b19b858db355dd');
    expect(torrentdone.TR_TIME_LOCALTIME).toEqual('Fri Nov  4 20:22:09 2022');
    expect(torrentdone.TR_TORRENT_LABELS).toEqual('');
    expect(torrentdone.TR_TORRENT_BYTES_DOWNLOADED).toEqual(0);
    expect(torrentdone.TR_TORRENT_TRACKERS).toEqual('');
    //
    await torrentdone.main();
    // log Info
    expect(logInfoMock).toHaveBeenNthCalledWith(3, `TORRENT ID: "103" FINISH: START PROCESS ...`);
    // log Error
    expect(logErrorMock).not.toHaveBeenCalled();
  });
  // 104
  it(`OK - 104 - Supernatural.s13e04.WEB-DL.1080p.mkv`, async () => {
    env.TR_APP_VERSION = version;
    env.TR_TORRENT_ID = '104';
    env.TR_TORRENT_NAME = `Supernatural.s13e04.WEB-DL.1080p.mkv`;
    env.TR_TORRENT_DIR = testMntDownloadsPath;
    env.TR_TORRENT_HASH = '540d0ae0eac6cc48e321e54293b19b858db355de';
    env.TR_TIME_LOCALTIME = 'Fri Nov  4 21:22:09 2022';
    env.TR_TORRENT_LABELS = '';
    env.TR_TORRENT_BYTES_DOWNLOADED = '';
    env.TR_TORRENT_TRACKERS = '';
    //
    const torrentdone: Torrentdone = new Torrentdone(testRootConfigsPath);
    //
    logInfoMock = jest
      .spyOn(torrentdone.logger, 'info')
      .mockImplementation((_level: string | Level, ...args: any[]): any => {
        return args;
      });
    logDebugMock = jest
      .spyOn(torrentdone.logger, 'debug')
      .mockImplementation((_level: string | Level, ...args: any[]): any => {
        return args;
      });
    logErrorMock = jest
      .spyOn(torrentdone.logger, 'error')
      .mockImplementation((_level: string | Level, ...args: any[]): any => {
        return args;
      });
    jest.spyOn(torrentdone.logger, 'trace').mockImplementation();
    //
    jest.spyOn(cproc, 'execSync').mockImplementation(() => {
      copyFileSync(
        normalize(`${testMntDownloadsPath}/Supernatural.s13e04.WEB-DL.1080p.mkv`),
        normalize(`${testMntDataPath}/media/TV Shows/Supernatural/Season 13/Supernatural.s13e04.WEB-DL.1080p.mkv`)
      );
      return `127.0.0.1:9091/transmission/rpc/\nresponded: "success"`;
    });
    //
    expect(torrentdone.TR_APP_VERSION).toEqual(version);
    expect(torrentdone.TR_TORRENT_ID).toEqual(104);
    expect(torrentdone.TR_TORRENT_NAME).toEqual(`Supernatural.s13e04.WEB-DL.1080p.mkv`);
    expect(torrentdone.TR_TORRENT_DIR).toEqual(testMntDownloadsPath);
    expect(torrentdone.TR_TORRENT_HASH).toEqual('540d0ae0eac6cc48e321e54293b19b858db355de');
    expect(torrentdone.TR_TIME_LOCALTIME).toEqual('Fri Nov  4 21:22:09 2022');
    expect(torrentdone.TR_TORRENT_LABELS).toEqual('');
    expect(torrentdone.TR_TORRENT_BYTES_DOWNLOADED).toEqual(0);
    expect(torrentdone.TR_TORRENT_TRACKERS).toEqual('');
    //
    await torrentdone.main();
    // log Info
    expect(logInfoMock).toHaveBeenNthCalledWith(3, `TORRENT ID: "104" FINISH: START PROCESS ...`);
    // log Error
    expect(logErrorMock).not.toHaveBeenCalled();
  });
  // 105
  it(`OK - 104 - The Penguin S01E01.1080p.rus.LostFilm.TV.mkv`, async () => {
    env.TR_APP_VERSION = version;
    env.TR_TORRENT_ID = '105';
    env.TR_TORRENT_NAME = `The Penguin S01E01.1080p.rus.LostFilm.TV.mkv`;
    env.TR_TORRENT_DIR = testMntDownloadsPath;
    env.TR_TORRENT_HASH = '540d0ae0eac6cc48e485e54293b19b858db355de';
    env.TR_TIME_LOCALTIME = 'Sat Sep  4 21:22:09 2022';
    env.TR_TORRENT_LABELS = '';
    env.TR_TORRENT_BYTES_DOWNLOADED = '';
    env.TR_TORRENT_TRACKERS = '';
    //
    const torrentdone: Torrentdone = new Torrentdone(testRootConfigsPath);
    //
    logInfoMock = jest
      .spyOn(torrentdone.logger, 'info')
      .mockImplementation((_level: string | Level, ...args: any[]): any => {
        return args;
      });
    logDebugMock = jest
      .spyOn(torrentdone.logger, 'debug')
      .mockImplementation((_level: string | Level, ...args: any[]): any => {
        return args;
      });
    logErrorMock = jest
      .spyOn(torrentdone.logger, 'error')
      .mockImplementation((_level: string | Level, ...args: any[]): any => {
        return args;
      });
    jest.spyOn(torrentdone.logger, 'trace').mockImplementation();
    //
    jest.spyOn(cproc, 'execSync').mockImplementation(() => {
      copyFileSync(
        normalize(`${testMntDownloadsPath}/The Penguin S01E01.1080p.rus.LostFilm.TV.mkv`),
        normalize(
          `${testMntDataPath}/media/TV Shows/The Penguin/Season 01/The Penguin S01E01.1080p.rus.LostFilm.TV.mkv`
        )
      );
      return `127.0.0.1:9091/transmission/rpc/\nresponded: "success"`;
    });
    //
    expect(torrentdone.TR_APP_VERSION).toEqual(version);
    expect(torrentdone.TR_TORRENT_ID).toEqual(105);
    expect(torrentdone.TR_TORRENT_NAME).toEqual(`The Penguin S01E01.1080p.rus.LostFilm.TV.mkv`);
    expect(torrentdone.TR_TORRENT_DIR).toEqual(testMntDownloadsPath);
    expect(torrentdone.TR_TORRENT_HASH).toEqual('540d0ae0eac6cc48e485e54293b19b858db355de');
    expect(torrentdone.TR_TIME_LOCALTIME).toEqual('Sat Sep  4 21:22:09 2022');
    expect(torrentdone.TR_TORRENT_LABELS).toEqual('');
    expect(torrentdone.TR_TORRENT_BYTES_DOWNLOADED).toEqual(0);
    expect(torrentdone.TR_TORRENT_TRACKERS).toEqual('');
    //
    await torrentdone.main();
    // log Info
    expect(logInfoMock).toHaveBeenNthCalledWith(3, `TORRENT ID: "105" FINISH: START PROCESS ...`);
    // log Error
    expect(logErrorMock).not.toHaveBeenCalled();
  });
  // 130 (Is not Serial and Film, but is Lostfilm)
  it(`OK - 130 - The Penguin S01.rus.LostFilm.TV.mkv`, async () => {
    env.TR_APP_VERSION = version;
    env.TR_TORRENT_ID = '130';
    env.TR_TORRENT_NAME = `The Penguin S01.rus.LostFilm.TV.mkv`;
    env.TR_TORRENT_DIR = testMntDownloadsPath;
    env.TR_TORRENT_HASH = '540d0ae0eac6cc48e485e54293b19b858db355de';
    env.TR_TIME_LOCALTIME = 'Sat Sep  4 21:22:09 2022';
    env.TR_TORRENT_LABELS = '';
    env.TR_TORRENT_BYTES_DOWNLOADED = '';
    env.TR_TORRENT_TRACKERS = '';
    //
    const torrentdone: Torrentdone = new Torrentdone(testRootConfigsPath);
    //
    logInfoMock = jest
      .spyOn(torrentdone.logger, 'info')
      .mockImplementation((_level: string | Level, ...args: any[]): any => {
        return args;
      });
    logDebugMock = jest
      .spyOn(torrentdone.logger, 'debug')
      .mockImplementation((_level: string | Level, ...args: any[]): any => {
        return args;
      });
    logErrorMock = jest
      .spyOn(torrentdone.logger, 'error')
      .mockImplementation((_level: string | Level, ...args: any[]): any => {
        return args;
      });
    jest.spyOn(torrentdone.logger, 'trace').mockImplementation();
    //
    jest.spyOn(cproc, 'execSync').mockImplementation(() => {
      copyFileSync(
        normalize(`${testMntDownloadsPath}/The Penguin S01.rus.LostFilm.TV.mkv`),
        normalize(`${testMntDataPath}/media/TV Shows/The Penguin/Season 01/The Penguin S01.rus.LostFilm.TV.mkv`)
      );
      return `127.0.0.1:9091/transmission/rpc/\nresponded: "success"`;
    });
    //
    expect(torrentdone.TR_APP_VERSION).toEqual(version);
    expect(torrentdone.TR_TORRENT_ID).toEqual(130);
    expect(torrentdone.TR_TORRENT_NAME).toEqual(`The Penguin S01.rus.LostFilm.TV.mkv`);
    expect(torrentdone.TR_TORRENT_DIR).toEqual(testMntDownloadsPath);
    expect(torrentdone.TR_TORRENT_HASH).toEqual('540d0ae0eac6cc48e485e54293b19b858db355de');
    expect(torrentdone.TR_TIME_LOCALTIME).toEqual('Sat Sep  4 21:22:09 2022');
    expect(torrentdone.TR_TORRENT_LABELS).toEqual('');
    expect(torrentdone.TR_TORRENT_BYTES_DOWNLOADED).toEqual(0);
    expect(torrentdone.TR_TORRENT_TRACKERS).toEqual('');
    //
    await torrentdone.main();
    // log Info
    expect(logInfoMock).toHaveBeenNthCalledWith(3, `TORRENT ID: "130" FINISH: START PROCESS ...`);
    // File "${file_name}" is not Serial or Film. NO ACTION
    expect(logInfoMock).toHaveBeenNthCalledWith(
      14,
      `File "The Penguin S01.rus.LostFilm.TV.mkv" is not Lostfilm Serial or Lostfilm Film. NO ACTION`
    );
    // log Error
    expect(logErrorMock).not.toHaveBeenCalled();
  });
});

describe('torrentdone.ts - Serials files in directory', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  // 105
  it(`OK - 105 - Obi-Wan Kenobi 1 - LostFilm.TV [1080p]`, async () => {
    env.TR_APP_VERSION = version;
    env.TR_TORRENT_ID = '105';
    env.TR_TORRENT_NAME = `Obi-Wan Kenobi 1 - LostFilm.TV [1080p]`;
    env.TR_TORRENT_DIR = testMntDownloadsPath;
    env.TR_TORRENT_HASH = '65b9eea6e1cc6bb9f0cd2a47751a186f';
    env.TR_TIME_LOCALTIME = 'Fri Nov  4 17:22:09 2024';
    env.TR_TORRENT_LABELS = '';
    env.TR_TORRENT_BYTES_DOWNLOADED = '';
    env.TR_TORRENT_TRACKERS = '';
    //
    const torrentdone: Torrentdone = new Torrentdone(testRootConfigsPath);
    //
    logInfoMock = jest
      .spyOn(torrentdone.logger, 'info')
      .mockImplementation((_level: string | Level, ...args: any[]): any => {
        return args;
      });
    logDebugMock = jest
      .spyOn(torrentdone.logger, 'debug')
      .mockImplementation((_level: string | Level, ...args: any[]): any => {
        return args;
      });
    logErrorMock = jest
      .spyOn(torrentdone.logger, 'error')
      .mockImplementation((_level: string | Level, ...args: any[]): any => {
        return args;
      });
    jest.spyOn(torrentdone.logger, 'trace').mockImplementation();
    //
    expect(torrentdone.TR_APP_VERSION).toEqual(version);
    expect(torrentdone.TR_TORRENT_ID).toEqual(105);
    expect(torrentdone.TR_TORRENT_NAME).toEqual(`Obi-Wan Kenobi 1 - LostFilm.TV [1080p]`);
    expect(torrentdone.TR_TORRENT_DIR).toEqual(testMntDownloadsPath);
    expect(torrentdone.TR_TORRENT_HASH).toEqual('65b9eea6e1cc6bb9f0cd2a47751a186f');
    expect(torrentdone.TR_TIME_LOCALTIME).toEqual('Fri Nov  4 17:22:09 2024');
    expect(torrentdone.TR_TORRENT_LABELS).toEqual('');
    expect(torrentdone.TR_TORRENT_BYTES_DOWNLOADED).toEqual(0);
    expect(torrentdone.TR_TORRENT_TRACKERS).toEqual('');
    //
    await torrentdone.main();
    //
    expect(
      existsSync(
        normalize(
          `${testMntDataPath}/media/TV Shows/Obi-Wan Kenobi/Season 01/Obi-Wan.Kenobi.S01E01.1080p.rus.LostFilm.TV.mkv`
        )
      )
    ).toBe(true);
    // log Info
    expect(logInfoMock).toHaveBeenNthCalledWith(3, `TORRENT ID: "105" FINISH: START PROCESS ...`);
    // log Error
    expect(logErrorMock).not.toHaveBeenCalled();
  });
  // 106
  it(`OK - 106 - Californication.Season 6.HDTVRip.720p.NovaFilm`, async () => {
    if (existsSync(normalize(`${testMntDataPath}/media/TV Shows/Californication`)))
      rmSync(normalize(`${testMntDataPath}/media/TV Shows/Californication`), { recursive: true });
    env.TR_APP_VERSION = version;
    env.TR_TORRENT_ID = '106';
    env.TR_TORRENT_NAME = `Californication.Season 6.HDTVRip.720p.NovaFilm`;
    env.TR_TORRENT_DIR = testMntDownloadsPath;
    env.TR_TORRENT_HASH = 'f0935e4cd5920aa6c7c996a5ee53a70f';
    env.TR_TIME_LOCALTIME = 'Fri Nov  4 18:22:09 2024';
    env.TR_TORRENT_LABELS = '';
    env.TR_TORRENT_BYTES_DOWNLOADED = '';
    env.TR_TORRENT_TRACKERS = '';
    //
    const torrentdone: Torrentdone = new Torrentdone(testRootConfigsPath);
    //
    logInfoMock = jest
      .spyOn(torrentdone.logger, 'info')
      .mockImplementation((_level: string | Level, ...args: any[]): any => {
        return args;
      });
    logDebugMock = jest
      .spyOn(torrentdone.logger, 'debug')
      .mockImplementation((_level: string | Level, ...args: any[]): any => {
        return args;
      });
    logErrorMock = jest
      .spyOn(torrentdone.logger, 'error')
      .mockImplementation((_level: string | Level, ...args: any[]): any => {
        return args;
      });
    jest.spyOn(torrentdone.logger, 'trace').mockImplementation();
    //
    expect(torrentdone.TR_APP_VERSION).toEqual(version);
    expect(torrentdone.TR_TORRENT_ID).toEqual(106);
    expect(torrentdone.TR_TORRENT_NAME).toEqual(`Californication.Season 6.HDTVRip.720p.NovaFilm`);
    expect(torrentdone.TR_TORRENT_DIR).toEqual(testMntDownloadsPath);
    expect(torrentdone.TR_TORRENT_HASH).toEqual('f0935e4cd5920aa6c7c996a5ee53a70f');
    expect(torrentdone.TR_TIME_LOCALTIME).toEqual('Fri Nov  4 18:22:09 2024');
    expect(torrentdone.TR_TORRENT_LABELS).toEqual('');
    expect(torrentdone.TR_TORRENT_BYTES_DOWNLOADED).toEqual(0);
    expect(torrentdone.TR_TORRENT_TRACKERS).toEqual('');
    //
    await torrentdone.main();
    //
    expect(
      existsSync(
        normalize(
          `${testMntDataPath}/media/TV Shows/Californication/Season 06/californication.s06e01.hdtv.720p.rus.eng.novafilm.tv.mkv`
        )
      )
    ).toBe(true);
    expect(
      existsSync(
        normalize(
          `${testMntDataPath}/media/TV Shows/Californication/Season 06/californication.s06e02.hdtv.720p.rus.eng.novafilm.tv.mkv`
        )
      )
    ).toBe(true);
    // 3rd file is part, not copy
    expect(
      existsSync(
        normalize(
          `${testMntDataPath}/media/TV Shows/Californication/Season 06/californication.s06e03.hdtv.720p.rus.eng.novafilm.tv.mkv`
        )
      )
    ).toBe(false);
    // log Info
    expect(logInfoMock).toHaveBeenNthCalledWith(3, `TORRENT ID: "106" FINISH: START PROCESS ...`);
    // log Error
    expect(logErrorMock).not.toHaveBeenCalled();
  });
  // 106
  it(`OK - 110 - The Mentalist`, async () => {
    if (existsSync(normalize(`${testMntDataPath}/media/TV Shows/The Mentalist`)))
      rmSync(normalize(`${testMntDataPath}/media/TV Shows/The Mentalist`), { recursive: true });
    env.TR_APP_VERSION = version;
    env.TR_TORRENT_ID = '110';
    env.TR_TORRENT_NAME = `Менталист`;
    env.TR_TORRENT_DIR = testMntDownloadsPath;
    env.TR_TORRENT_HASH = 'fc14ec2e2a40dbf7e2b4a87aa4f19cc4427a1ee1';
    env.TR_TIME_LOCALTIME = 'Mon Nov 25 21:25:43 2024';
    env.TR_TORRENT_LABELS = '';
    env.TR_TORRENT_BYTES_DOWNLOADED = '';
    env.TR_TORRENT_TRACKERS = '';
    //
    const torrentdone: Torrentdone = new Torrentdone(testRootConfigsPath);
    //
    logInfoMock = jest
      .spyOn(torrentdone.logger, 'info')
      .mockImplementation((_level: string | Level, ...args: any[]): any => {
        return args;
      });
    logDebugMock = jest
      .spyOn(torrentdone.logger, 'debug')
      .mockImplementation((_level: string | Level, ...args: any[]): any => {
        return args;
      });
    logErrorMock = jest
      .spyOn(torrentdone.logger, 'error')
      .mockImplementation((_level: string | Level, ...args: any[]): any => {
        return args;
      });
    jest.spyOn(torrentdone.logger, 'trace').mockImplementation();
    //
    expect(torrentdone.TR_APP_VERSION).toEqual(version);
    expect(torrentdone.TR_TORRENT_ID).toEqual(110);
    expect(torrentdone.TR_TORRENT_NAME).toEqual(`Менталист`);
    expect(torrentdone.TR_TORRENT_DIR).toEqual(testMntDownloadsPath);
    expect(torrentdone.TR_TORRENT_HASH).toEqual('fc14ec2e2a40dbf7e2b4a87aa4f19cc4427a1ee1');
    expect(torrentdone.TR_TIME_LOCALTIME).toEqual('Mon Nov 25 21:25:43 2024');
    expect(torrentdone.TR_TORRENT_LABELS).toEqual('');
    expect(torrentdone.TR_TORRENT_BYTES_DOWNLOADED).toEqual(0);
    expect(torrentdone.TR_TORRENT_TRACKERS).toEqual('');
    //
    await torrentdone.main();
    // log Info
    expect(logInfoMock).toHaveBeenNthCalledWith(7, `NAME:  "Менталист"`);
    expect(logInfoMock).toHaveBeenNthCalledWith(15, `Element: "The.Mentalist.s01e01.BDRip.720p.Rus.Eng.mkv" is a FILE`);
    expect(logInfoMock).toHaveBeenNthCalledWith(
      18,
      `File "The.Mentalist.s01e01.BDRip.720p.Rus.Eng.mkv" copied successfully. => END`
    );
    expect(logInfoMock).toHaveBeenNthCalledWith(
      23,
      `File "The.Mentalist.s01e02.BDRip.720p.Rus.Eng.mkv" copied successfully. => END`
    );
    expect(logInfoMock).toHaveBeenNthCalledWith(
      28,
      `File "The.Mentalist.s02e03.WEB-DL.720p.Rus.Eng.mkv" copied successfully. => END`
    );
    expect(logInfoMock).toHaveBeenNthCalledWith(
      33,
      `File "The.Mentalist.s02e04.WEB-DL.720p.Rus.Eng.mkv" copied successfully. => END`
    );
    expect(logInfoMock).toHaveBeenNthCalledWith(
      38,
      `File "The.Mentalist.s02e05.WEB-DL.720p.Rus.Eng.mkv" copied successfully. => END`
    );
    expect(logInfoMock).toHaveBeenNthCalledWith(40, `TORRENT ID: "110" END PROCESS`);
    // log Debug
    expect(logDebugMock).toHaveBeenNthCalledWith(1, `DIR_FLAG: "true"`);
    expect(logDebugMock).toHaveBeenNthCalledWith(
      3,
      `All elements in dir: "The.Mentalist.s01.BDRip.720p.Rus.Eng,The.Mentalist.s02.WEB-DL.720p.Rus.Eng,The.Mentalist.s01e01.BDRip.720p.Rus.Eng.mkv,The.Mentalist.s01e02.BDRip.720p.Rus.Eng.mkv,The.Mentalist.s02e03.WEB-DL.720p.Rus.Eng.mkv,The.Mentalist.s02e04.WEB-DL.720p.Rus.Eng.mkv,The.Mentalist.s02e05.WEB-DL.720p.Rus.Eng.mkv"`
    );
    //
    expect(
      existsSync(
        normalize(
          `${testMntDataPath}/media/TV Shows/The Mentalist/Season 01/The.Mentalist.s01e01.BDRip.720p.Rus.Eng.mkv`
        )
      )
    ).toBe(true);
    expect(
      existsSync(
        normalize(
          `${testMntDataPath}/media/TV Shows/The Mentalist/Season 01/The.Mentalist.s01e02.BDRip.720p.Rus.Eng.mkv`
        )
      )
    ).toBe(true);
    // log Info
    expect(logInfoMock).toHaveBeenNthCalledWith(3, `TORRENT ID: "110" FINISH: START PROCESS ...`);
    // log Error
    expect(logErrorMock).not.toHaveBeenCalled();
  });
});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// FILMS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

describe('torrentdone.ts - Films single files', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  // 107
  it(`OK - 107 - Аватар 3D (2009).mkv`, async () => {
    env.TR_APP_VERSION = version;
    env.TR_TORRENT_ID = '107';
    env.TR_TORRENT_NAME = `Аватар 3D (2009).mkv`;
    env.TR_TORRENT_DIR = testMntDownloadsPath;
    env.TR_TORRENT_HASH = '524e05dc77239f3a15dab766aaa59a9e432efde7';
    env.TR_TIME_LOCALTIME = 'Fri Nov  7 17:22:09 2022';
    env.TR_TORRENT_LABELS = '';
    env.TR_TORRENT_BYTES_DOWNLOADED = '';
    env.TR_TORRENT_TRACKERS = '';
    //
    const torrentdone: Torrentdone = new Torrentdone(testRootConfigsPath);
    //
    logInfoMock = jest
      .spyOn(torrentdone.logger, 'info')
      .mockImplementation((_level: string | Level, ...args: any[]): any => {
        return args;
      });
    logDebugMock = jest
      .spyOn(torrentdone.logger, 'debug')
      .mockImplementation((_level: string | Level, ...args: any[]): any => {
        return args;
      });
    logErrorMock = jest
      .spyOn(torrentdone.logger, 'error')
      .mockImplementation((_level: string | Level, ...args: any[]): any => {
        return args;
      });
    jest.spyOn(torrentdone.logger, 'trace').mockImplementation();
    //
    jest.spyOn(cproc, 'execSync').mockImplementation(() => {
      copyFileSync(
        normalize(`${testMntDownloadsPath}/Аватар 3D (2009).mkv`),
        normalize(`${testMntDataPath}/media/Movies/3D/2009/Аватар 3D (2009).mkv`)
      );
      return `127.0.0.1:9091/transmission/rpc/\nresponded: "success"`;
    });
    //
    expect(torrentdone.TR_APP_VERSION).toEqual(version);
    expect(torrentdone.TR_TORRENT_ID).toEqual(107);
    expect(torrentdone.TR_TORRENT_NAME).toEqual(`Аватар 3D (2009).mkv`);
    expect(torrentdone.TR_TORRENT_DIR).toEqual(testMntDownloadsPath);
    expect(torrentdone.TR_TORRENT_HASH).toEqual('524e05dc77239f3a15dab766aaa59a9e432efde7');
    expect(torrentdone.TR_TIME_LOCALTIME).toEqual('Fri Nov  7 17:22:09 2022');
    expect(torrentdone.TR_TORRENT_LABELS).toEqual('');
    expect(torrentdone.TR_TORRENT_BYTES_DOWNLOADED).toEqual(0);
    expect(torrentdone.TR_TORRENT_TRACKERS).toEqual('');
    // Run process
    await torrentdone.main();
    // log Info
    expect(logInfoMock).toHaveBeenNthCalledWith(3, `TORRENT ID: "107" FINISH: START PROCESS ...`);
    // log Error
    expect(logErrorMock).not.toHaveBeenCalled();
  });
  // 108
  it(`OK - 108 - Blade Runner 2049 (2017).mkv`, async () => {
    env.TR_APP_VERSION = version;
    env.TR_TORRENT_ID = '108';
    env.TR_TORRENT_NAME = `Blade Runner 2049 (2017).mkv`;
    env.TR_TORRENT_DIR = testMntDownloadsPath;
    env.TR_TORRENT_HASH = '17503a6b2326f09fbc4e3a7c03874c7333002038';
    env.TR_TIME_LOCALTIME = 'Fri Nov  8 17:22:09 2022';
    env.TR_TORRENT_LABELS = '';
    env.TR_TORRENT_BYTES_DOWNLOADED = '';
    env.TR_TORRENT_TRACKERS = '';
    //
    const torrentdone: Torrentdone = new Torrentdone(testRootConfigsPath);
    //
    logInfoMock = jest
      .spyOn(torrentdone.logger, 'info')
      .mockImplementation((_level: string | Level, ...args: any[]): any => {
        return args;
      });
    logDebugMock = jest
      .spyOn(torrentdone.logger, 'debug')
      .mockImplementation((_level: string | Level, ...args: any[]): any => {
        return args;
      });
    logErrorMock = jest
      .spyOn(torrentdone.logger, 'error')
      .mockImplementation((_level: string | Level, ...args: any[]): any => {
        return args;
      });
    jest.spyOn(torrentdone.logger, 'trace').mockImplementation();
    //
    jest.spyOn(cproc, 'execSync').mockImplementation(() => {
      copyFileSync(
        normalize(`${testMntDownloadsPath}/Blade Runner 2049 (2017).mkv`),
        normalize(`${testMntDataPath}/media/Movies/2D/2017/Blade Runner 2049 (2017).mkv`)
      );
      return `127.0.0.1:9091/transmission/rpc/\nresponded: "success"`;
    });
    //
    expect(torrentdone.TR_APP_VERSION).toEqual(version);
    expect(torrentdone.TR_TORRENT_ID).toEqual(108);
    expect(torrentdone.TR_TORRENT_NAME).toEqual(`Blade Runner 2049 (2017).mkv`);
    expect(torrentdone.TR_TORRENT_DIR).toEqual(testMntDownloadsPath);
    expect(torrentdone.TR_TORRENT_HASH).toEqual('17503a6b2326f09fbc4e3a7c03874c7333002038');
    expect(torrentdone.TR_TIME_LOCALTIME).toEqual('Fri Nov  8 17:22:09 2022');
    expect(torrentdone.TR_TORRENT_LABELS).toEqual('');
    expect(torrentdone.TR_TORRENT_BYTES_DOWNLOADED).toEqual(0);
    expect(torrentdone.TR_TORRENT_TRACKERS).toEqual('');
    // Run process
    await torrentdone.main();
    // log Info
    expect(logInfoMock).toHaveBeenNthCalledWith(3, `TORRENT ID: "108" FINISH: START PROCESS ...`);
    // log Error
    expect(logErrorMock).not.toHaveBeenCalled();
  });
  // 109
  it(`OK - 109 - Bullet.Train.1080p.rus.LostFilm.TV.avi`, async () => {
    env.TR_APP_VERSION = version;
    env.TR_TORRENT_ID = '109';
    env.TR_TORRENT_NAME = `Bullet.Train.1080p.rus.LostFilm.TV.avi`;
    env.TR_TORRENT_DIR = testMntDownloadsPath;
    env.TR_TORRENT_HASH = 'a1422e6a168630cdd214ac5e31ca01ae1bee8d92';
    env.TR_TIME_LOCALTIME = 'Fri Nov  9 17:22:09 2022';
    env.TR_TORRENT_LABELS = '';
    env.TR_TORRENT_BYTES_DOWNLOADED = '';
    env.TR_TORRENT_TRACKERS = '';
    //
    const torrentdone: Torrentdone = new Torrentdone(testRootConfigsPath);
    //
    logInfoMock = jest
      .spyOn(torrentdone.logger, 'info')
      .mockImplementation((_level: string | Level, ...args: any[]): any => {
        return args;
      });
    logDebugMock = jest
      .spyOn(torrentdone.logger, 'debug')
      .mockImplementation((_level: string | Level, ...args: any[]): any => {
        return args;
      });
    logErrorMock = jest
      .spyOn(torrentdone.logger, 'error')
      .mockImplementation((_level: string | Level, ...args: any[]): any => {
        return args;
      });
    jest.spyOn(torrentdone.logger, 'trace').mockImplementation();
    //
    jest.spyOn(cproc, 'execSync').mockImplementation(() => {
      copyFileSync(
        normalize(`${testMntDownloadsPath}/Bullet.Train.1080p.rus.LostFilm.TV.avi`),
        normalize(
          `${testMntDataPath}/media/Movies/2D/${new Date().getFullYear()}/Bullet.Train.1080p.rus.LostFilm.TV.avi`
        )
      );
      return `127.0.0.1:9091/transmission/rpc/\nresponded: "success"`;
    });
    //
    expect(torrentdone.TR_APP_VERSION).toEqual(version);
    expect(torrentdone.TR_TORRENT_ID).toEqual(109);
    expect(torrentdone.TR_TORRENT_NAME).toEqual(`Bullet.Train.1080p.rus.LostFilm.TV.avi`);
    expect(torrentdone.TR_TORRENT_DIR).toEqual(testMntDownloadsPath);
    expect(torrentdone.TR_TORRENT_HASH).toEqual('a1422e6a168630cdd214ac5e31ca01ae1bee8d92');
    expect(torrentdone.TR_TIME_LOCALTIME).toEqual('Fri Nov  9 17:22:09 2022');
    expect(torrentdone.TR_TORRENT_LABELS).toEqual('');
    expect(torrentdone.TR_TORRENT_BYTES_DOWNLOADED).toEqual(0);
    expect(torrentdone.TR_TORRENT_TRACKERS).toEqual('');
    // Run process
    await torrentdone.main();
    // log Info
    expect(logInfoMock).toHaveBeenNthCalledWith(3, `TORRENT ID: "109" FINISH: START PROCESS ...`);
    // log Error
    expect(logErrorMock).not.toHaveBeenCalled();
  });
  // 109
  it(`OK - 110 - All.Quiet.on.the.Western.Front.1080p.rus.LostFilm.TV.mkv`, async () => {
    env.TR_APP_VERSION = version;
    env.TR_TORRENT_ID = '110';
    env.TR_TORRENT_NAME = `All.Quiet.on.the.Western.Front.1080p.rus.LostFilm.TV.mkv`;
    env.TR_TORRENT_DIR = testMntDownloadsPath;
    env.TR_TORRENT_HASH = '5e796e48332af4142b10ca0f86e65d9bfdb05884';
    env.TR_TIME_LOCALTIME = 'Fri Nov  10 17:22:09 2022';
    env.TR_TORRENT_LABELS = '';
    env.TR_TORRENT_BYTES_DOWNLOADED = '';
    env.TR_TORRENT_TRACKERS = '';
    //
    const torrentdone: Torrentdone = new Torrentdone(testRootConfigsPath);
    //
    logInfoMock = jest
      .spyOn(torrentdone.logger, 'info')
      .mockImplementation((_level: string | Level, ...args: any[]): any => {
        return args;
      });
    logDebugMock = jest
      .spyOn(torrentdone.logger, 'debug')
      .mockImplementation((_level: string | Level, ...args: any[]): any => {
        return args;
      });
    logErrorMock = jest
      .spyOn(torrentdone.logger, 'error')
      .mockImplementation((_level: string | Level, ...args: any[]): any => {
        return args;
      });
    jest.spyOn(torrentdone.logger, 'trace').mockImplementation();
    //
    jest.spyOn(cproc, 'execSync').mockImplementation(() => {
      copyFileSync(
        normalize(`${testMntDownloadsPath}/All.Quiet.on.the.Western.Front.1080p.rus.LostFilm.TV.mkv`),
        normalize(
          `${testMntDataPath}/media/Movies/2D/${new Date().getFullYear()}/All.Quiet.on.the.Western.Front.1080p.rus.LostFilm.TV.mkv`
        )
      );
      return `127.0.0.1:9091/transmission/rpc/\nresponded: "success"`;
    });
    //
    expect(torrentdone.TR_APP_VERSION).toEqual(version);
    expect(torrentdone.TR_TORRENT_ID).toEqual(110);
    expect(torrentdone.TR_TORRENT_NAME).toEqual(`All.Quiet.on.the.Western.Front.1080p.rus.LostFilm.TV.mkv`);
    expect(torrentdone.TR_TORRENT_DIR).toEqual(testMntDownloadsPath);
    expect(torrentdone.TR_TORRENT_HASH).toEqual('5e796e48332af4142b10ca0f86e65d9bfdb05884');
    expect(torrentdone.TR_TIME_LOCALTIME).toEqual('Fri Nov  10 17:22:09 2022');
    expect(torrentdone.TR_TORRENT_LABELS).toEqual('');
    expect(torrentdone.TR_TORRENT_BYTES_DOWNLOADED).toEqual(0);
    expect(torrentdone.TR_TORRENT_TRACKERS).toEqual('');
    // Run process
    await torrentdone.main();
    // log Info
    expect(logInfoMock).toHaveBeenNthCalledWith(3, `TORRENT ID: "110" FINISH: START PROCESS ...`);
    // log Error
    expect(logErrorMock).not.toHaveBeenCalled();
  });
  // 114
  it(`OK - 114 - Simple_Media_file (2009).novafilm.tv.avi`, async () => {
    env.TR_APP_VERSION = version;
    env.TR_TORRENT_ID = '114';
    env.TR_TORRENT_NAME = `Simple_Media_file (2009).novafilm.tv.avi`;
    env.TR_TORRENT_DIR = testMntDownloadsPath;
    env.TR_TORRENT_HASH = 'e993215bfdbb515f6ea00fafc1918z549119f789';
    env.TR_TIME_LOCALTIME = 'Fri Nov  13 17:22:09 2024';
    env.TR_TORRENT_LABELS = '';
    env.TR_TORRENT_BYTES_DOWNLOADED = '';
    env.TR_TORRENT_TRACKERS = '';
    //
    const torrentdone: Torrentdone = new Torrentdone(testRootConfigsPath);
    //
    logInfoMock = jest
      .spyOn(torrentdone.logger, 'info')
      .mockImplementation((_level: string | Level, ...args: any[]): any => {
        return args;
      });
    logDebugMock = jest
      .spyOn(torrentdone.logger, 'debug')
      .mockImplementation((_level: string | Level, ...args: any[]): any => {
        return args;
      });
    logErrorMock = jest
      .spyOn(torrentdone.logger, 'error')
      .mockImplementation((_level: string | Level, ...args: any[]): any => {
        return args;
      });
    jest.spyOn(torrentdone.logger, 'trace').mockImplementation();
    //
    jest.spyOn(cproc, 'execSync').mockImplementation(() => {
      copyFileSync(
        normalize(`${testMntDownloadsPath}/Simple_Media_file (2009).novafilm.tv.avi`),
        normalize(`${testMntDataPath}/media/Movies/2D/2009/Simple_Media_file (2009).novafilm.tv.avi`)
      );
      return `127.0.0.1:9091/transmission/rpc/\nresponded: "success"`;
    });
    //
    expect(torrentdone.TR_APP_VERSION).toEqual(version);
    expect(torrentdone.TR_TORRENT_ID).toEqual(114);
    expect(torrentdone.TR_TORRENT_NAME).toEqual(`Simple_Media_file (2009).novafilm.tv.avi`);
    expect(torrentdone.TR_TORRENT_DIR).toEqual(testMntDownloadsPath);
    expect(torrentdone.TR_TORRENT_HASH).toEqual('e993215bfdbb515f6ea00fafc1918z549119f789');
    expect(torrentdone.TR_TIME_LOCALTIME).toEqual('Fri Nov  13 17:22:09 2024');
    expect(torrentdone.TR_TORRENT_LABELS).toEqual('');
    expect(torrentdone.TR_TORRENT_BYTES_DOWNLOADED).toEqual(0);
    expect(torrentdone.TR_TORRENT_TRACKERS).toEqual('');
    // Run process
    await torrentdone.main();
    // log Debug
    expect(logDebugMock).toHaveBeenNthCalledWith(5, `RELEASER: novafilm`);
    expect(logDebugMock).toHaveBeenNthCalledWith(6, `Check Serial or Film: "Simple_Media_file (2009).novafilm.tv.avi"`);
    // log Info
    expect(logInfoMock).toHaveBeenNthCalledWith(14, `File "Simple_Media_file (2009).novafilm.tv.avi" is a FILM`);
    expect(logInfoMock).toHaveBeenNthCalledWith(
      16,
      `File "Simple_Media_file (2009).novafilm.tv.avi" moving successfully. => END`
    );
    // log Error
    expect(logErrorMock).not.toHaveBeenCalled();
  });
});

describe('torrentdone.ts - Films files in directory', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  // 111
  it(`OK - 111 - Harry.Potter.Collection`, async () => {
    env.TR_APP_VERSION = version;
    env.TR_TORRENT_ID = '111';
    env.TR_TORRENT_NAME = `Harry.Potter.Collection`;
    env.TR_TORRENT_DIR = testMntDownloadsPath;
    env.TR_TORRENT_HASH = '6216f8a75fd5bb3d5f22b6f9958cdede3fc086c2';
    env.TR_TIME_LOCALTIME = 'Fri Nov  11 17:22:09 2024';
    env.TR_TORRENT_LABELS = '';
    env.TR_TORRENT_BYTES_DOWNLOADED = '';
    env.TR_TORRENT_TRACKERS = '';
    //
    const torrentdone: Torrentdone = new Torrentdone(testRootConfigsPath);
    //
    logInfoMock = jest
      .spyOn(torrentdone.logger, 'info')
      .mockImplementation((_level: string | Level, ...args: any[]): any => {
        return args;
      });
    logDebugMock = jest
      .spyOn(torrentdone.logger, 'debug')
      .mockImplementation((_level: string | Level, ...args: any[]): any => {
        return args;
      });
    logErrorMock = jest
      .spyOn(torrentdone.logger, 'error')
      .mockImplementation((_level: string | Level, ...args: any[]): any => {
        return args;
      });
    jest.spyOn(torrentdone.logger, 'trace').mockImplementation();
    //
    expect(torrentdone.TR_APP_VERSION).toEqual(version);
    expect(torrentdone.TR_TORRENT_ID).toEqual(111);
    expect(torrentdone.TR_TORRENT_NAME).toEqual(`Harry.Potter.Collection`);
    expect(torrentdone.TR_TORRENT_DIR).toEqual(testMntDownloadsPath);
    expect(torrentdone.TR_TORRENT_HASH).toEqual('6216f8a75fd5bb3d5f22b6f9958cdede3fc086c2');
    expect(torrentdone.TR_TIME_LOCALTIME).toEqual('Fri Nov  11 17:22:09 2024');
    expect(torrentdone.TR_TORRENT_LABELS).toEqual('');
    expect(torrentdone.TR_TORRENT_BYTES_DOWNLOADED).toEqual(0);
    expect(torrentdone.TR_TORRENT_TRACKERS).toEqual('');
    //
    await torrentdone.main();
    //
    expect(
      existsSync(
        normalize(
          `${testMntDataPath}/media/Movies/2D/2001/Harry.Potter.and.the.Sorcerer's.Stone.2001.BDRip.1080p.Rus.Eng.mkv`
        )
      )
    ).toBe(true);
    expect(
      existsSync(
        normalize(
          `${testMntDataPath}/media/Movies/2D/2002/Harry.Potter.and.the.Chamber.of.Secrets.2002.BDRip.1080p.Rus.Eng.mkv`
        )
      )
    ).toBe(true);
    expect(
      existsSync(
        normalize(
          `${testMntDataPath}/media/Movies/2D/2010/Harry.Potter.and.the.Deathly.Hallows.Part.1.2010.BDRip.1080p.Rus.Eng.mkv`
        )
      )
    ).toBe(true);
    // log Info
    expect(logInfoMock).toHaveBeenNthCalledWith(3, `TORRENT ID: "111" FINISH: START PROCESS ...`);
    // log Error
    expect(logErrorMock).not.toHaveBeenCalled();
  });
  // 112
  it(`OK - 112 - Властелин Колец`, async () => {
    env.TR_APP_VERSION = version;
    env.TR_TORRENT_ID = '112';
    env.TR_TORRENT_NAME = `Властелин Колец`;
    env.TR_TORRENT_DIR = testMntDownloadsPath;
    env.TR_TORRENT_HASH = '601ca99d55f00a2e8e736676b606a4d31d374fdd';
    env.TR_TIME_LOCALTIME = 'Fri Nov  12 17:22:09 2024';
    env.TR_TORRENT_LABELS = '';
    env.TR_TORRENT_BYTES_DOWNLOADED = '';
    env.TR_TORRENT_TRACKERS = '';
    //
    const torrentdone: Torrentdone = new Torrentdone(testRootConfigsPath);
    //
    logInfoMock = jest
      .spyOn(torrentdone.logger, 'info')
      .mockImplementation((_level: string | Level, ...args: any[]): any => {
        return args;
      });
    logDebugMock = jest
      .spyOn(torrentdone.logger, 'debug')
      .mockImplementation((_level: string | Level, ...args: any[]): any => {
        return args;
      });
    logErrorMock = jest
      .spyOn(torrentdone.logger, 'error')
      .mockImplementation((_level: string | Level, ...args: any[]): any => {
        return args;
      });
    jest.spyOn(torrentdone.logger, 'trace').mockImplementation();
    //
    expect(torrentdone.TR_APP_VERSION).toEqual(version);
    expect(torrentdone.TR_TORRENT_ID).toEqual(112);
    expect(torrentdone.TR_TORRENT_NAME).toEqual(`Властелин Колец`);
    expect(torrentdone.TR_TORRENT_DIR).toEqual(testMntDownloadsPath);
    expect(torrentdone.TR_TORRENT_HASH).toEqual('601ca99d55f00a2e8e736676b606a4d31d374fdd');
    expect(torrentdone.TR_TIME_LOCALTIME).toEqual('Fri Nov  12 17:22:09 2024');
    expect(torrentdone.TR_TORRENT_LABELS).toEqual('');
    expect(torrentdone.TR_TORRENT_BYTES_DOWNLOADED).toEqual(0);
    expect(torrentdone.TR_TORRENT_TRACKERS).toEqual('');
    //
    await torrentdone.main();
    //
    expect(
      existsSync(
        normalize(
          `${testMntDataPath}/media/Movies/2D/2001/01. The Lord of the Rings - The Fellowship of the Ring Extended (2001).mkv`
        )
      )
    ).toBe(true);
    expect(
      existsSync(
        normalize(
          `${testMntDataPath}/media/Movies/2D/2002/02. The Lord of the Rings - The Two Towers Extended (2002).mkv`
        )
      )
    ).toBe(true);
    expect(
      existsSync(
        normalize(
          `${testMntDataPath}/media/Movies/2D/2003/03. The Lord of the Rings - The Return of the King Extended (2003).mkv`
        )
      )
    ).toBe(true);
    // log Info
    expect(logInfoMock).toHaveBeenNthCalledWith(3, `TORRENT ID: "112" FINISH: START PROCESS ...`);
    // log Error
    expect(logErrorMock).not.toHaveBeenCalled();
  });
});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// OTHER FILE
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

describe('torrentdone.ts - Simple files', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  // 113
  it(`OK - 113 - Simple_Media_file.mkv`, async () => {
    env.TR_APP_VERSION = version;
    env.TR_TORRENT_ID = '113';
    env.TR_TORRENT_NAME = `Simple_Media_file.mkv`;
    env.TR_TORRENT_DIR = testMntDownloadsPath;
    env.TR_TORRENT_HASH = 'e993215bfdaa515f6ea00fafc1918f549119f993';
    env.TR_TIME_LOCALTIME = 'Fri Nov  13 17:22:09 2022';
    env.TR_TORRENT_LABELS = '';
    env.TR_TORRENT_BYTES_DOWNLOADED = '';
    env.TR_TORRENT_TRACKERS = '';
    //
    const torrentdone: Torrentdone = new Torrentdone(testRootConfigsPath);
    //
    logInfoMock = jest
      .spyOn(torrentdone.logger, 'info')
      .mockImplementation((_level: string | Level, ...args: any[]): any => {
        return args;
      });
    logDebugMock = jest
      .spyOn(torrentdone.logger, 'debug')
      .mockImplementation((_level: string | Level, ...args: any[]): any => {
        return args;
      });
    logErrorMock = jest
      .spyOn(torrentdone.logger, 'error')
      .mockImplementation((_level: string | Level, ...args: any[]): any => {
        return args;
      });
    jest.spyOn(torrentdone.logger, 'trace').mockImplementation();
    //
    expect(torrentdone.TR_APP_VERSION).toEqual(version);
    expect(torrentdone.TR_TORRENT_ID).toEqual(113);
    expect(torrentdone.TR_TORRENT_NAME).toEqual(`Simple_Media_file.mkv`);
    expect(torrentdone.TR_TORRENT_DIR).toEqual(testMntDownloadsPath);
    expect(torrentdone.TR_TORRENT_HASH).toEqual('e993215bfdaa515f6ea00fafc1918f549119f993');
    expect(torrentdone.TR_TIME_LOCALTIME).toEqual('Fri Nov  13 17:22:09 2022');
    expect(torrentdone.TR_TORRENT_LABELS).toEqual('');
    expect(torrentdone.TR_TORRENT_BYTES_DOWNLOADED).toEqual(0);
    expect(torrentdone.TR_TORRENT_TRACKERS).toEqual('');
    // Run process
    await torrentdone.main();
    // log Debug
    expect(logDebugMock).toHaveBeenNthCalledWith(6, `Base processing`);
    // log Info
    expect(logInfoMock).toHaveBeenNthCalledWith(13, `File "Simple_Media_file.mkv" is not Serial or Film. NO ACTION`);
    expect(logInfoMock).toHaveBeenNthCalledWith(15, `TORRENT ID: "113" END PROCESS`);
    // log Error
    expect(logErrorMock).not.toHaveBeenCalled();
  });
});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// EXTENDED COVERAGE
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

describe('torrentdone.ts - isFileOrDirectoryOrUnknown method', () => {
  const baseFile = normalize(`${testMntDownloadsPath}/Simple_Media_file.mkv`);
  const symlinkFile = normalize(`${testMntDownloadsPath}/Simple_Media_file_symlink.mkv`);
  //
  beforeEach(() => {
    jest.clearAllMocks();
    //
    if (!existsSync(symlinkFile)) {
      symlinkSync(baseFile, symlinkFile);
    }
  });
  afterEach(() => {
    if (existsSync(symlinkFile)) rmSync(symlinkFile);
  });
  // 114
  it(`isFileOrDirectoryOrUnknown - undefined`, async () => {
    //
    env.TR_APP_VERSION = version;
    env.TR_TORRENT_ID = '114';
    env.TR_TORRENT_NAME = `Simple_Media_file_symlink.mkv`;
    env.TR_TORRENT_DIR = testMntDownloadsPath;
    env.TR_TORRENT_HASH = 'e993215bfdaa515f6ea00fafc1918f549119f993';
    env.TR_TIME_LOCALTIME = 'Fri Nov  13 17:22:09 2022';
    env.TR_TORRENT_LABELS = '';
    env.TR_TORRENT_BYTES_DOWNLOADED = '';
    env.TR_TORRENT_TRACKERS = '';
    //
    const torrentdone: Torrentdone = new Torrentdone(testRootConfigsPath);
    //
    logInfoMock = jest
      .spyOn(torrentdone.logger, 'info')
      .mockImplementation((_level: string | Level, ...args: any[]): any => {
        return args;
      });
    logDebugMock = jest
      .spyOn(torrentdone.logger, 'debug')
      .mockImplementation((_level: string | Level, ...args: any[]): any => {
        return args;
      });
    logErrorMock = jest
      .spyOn(torrentdone.logger, 'error')
      .mockImplementation((_level: string | Level, ...args: any[]): any => {
        return args;
      });
    jest.spyOn(torrentdone.logger, 'trace').mockImplementation();
    //
    expect(torrentdone.TR_TORRENT_ID).toEqual(114);
    expect(torrentdone.TR_TORRENT_NAME).toEqual(`Simple_Media_file_symlink.mkv`);
    // Run process
    await torrentdone.main();
    // log Debug
    expect(logDebugMock).toHaveBeenNthCalledWith(
      1,
      `TR_TORRENT_NAME: "Simple_Media_file_symlink.mkv" is neither a file or a directory`
    );
    // log Error
    expect(logErrorMock).not.toHaveBeenCalled();
  });
  // 115
  it(`isFileOrDirectoryOrUnknown - error`, async () => {
    //
    env.TR_APP_VERSION = version;
    env.TR_TORRENT_ID = '115';
    env.TR_TORRENT_NAME = `Simple_Media_file_error.mkv`;
    env.TR_TORRENT_DIR = testMntDownloadsPath;
    env.TR_TORRENT_HASH = 'e993215bfdaa515f6ea00fafc1918f549119f993';
    env.TR_TIME_LOCALTIME = 'Fri Nov  13 17:22:09 2022';
    env.TR_TORRENT_LABELS = '';
    env.TR_TORRENT_BYTES_DOWNLOADED = '';
    env.TR_TORRENT_TRACKERS = '';
    //
    const torrentdone: Torrentdone = new Torrentdone(testRootConfigsPath);
    //
    logInfoMock = jest
      .spyOn(torrentdone.logger, 'info')
      .mockImplementation((_level: string | Level, ...args: any[]): any => {
        return args;
      });
    logDebugMock = jest
      .spyOn(torrentdone.logger, 'debug')
      .mockImplementation((_level: string | Level, ...args: any[]): any => {
        return args;
      });
    logErrorMock = jest
      .spyOn(torrentdone.logger, 'error')
      .mockImplementation((_level: string | Level, ...args: any[]): any => {
        return args;
      });
    jest.spyOn(torrentdone.logger, 'trace').mockImplementation();
    //
    expect(torrentdone.TR_TORRENT_ID).toEqual(115);
    expect(torrentdone.TR_TORRENT_NAME).toEqual(`Simple_Media_file_error.mkv`);
    // Run process
    await torrentdone.main();
    // log Error
    expect(logErrorMock).toHaveBeenNthCalledWith(
      1,
      `ENOENT: no such file or directory, lstat '${normalize(`${testMntDownloadsPath}/Simple_Media_file_error.mkv`)}'`
    );
    expect(logErrorMock).toHaveBeenNthCalledWith(2, `TORRENT ID: "115" ERROR END PROCESS`);
  });
});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// PARANOID COVERAGE
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

describe('torrentdone.ts - All throw errors', () => {
  beforeEach(() => {
    if (existsSync(testMntDataPath)) rmSync(testMntDataPath, { recursive: true });
    jest.clearAllMocks();
  });
  // Execution connect command to a transmission-remote.
  it(`private command throw error`, async () => {
    env.TR_APP_VERSION = version;
    env.TR_TORRENT_ID = '100';
    env.TR_TORRENT_NAME = `The.Handmaid's.Tale.S05E03.1080p.rus.LostFilm.TV.mkv`;
    env.TR_TORRENT_DIR = testMntDownloadsPath;
    env.TR_TORRENT_HASH = '540d0ae0eac6cc48e321e54293b19b858db355da';
    env.TR_TIME_LOCALTIME = 'Fri Nov  4 17:22:09 2022';
    env.TR_TORRENT_LABELS = '';
    env.TR_TORRENT_BYTES_DOWNLOADED = '';
    env.TR_TORRENT_TRACKERS = '';
    //
    const torrentdone: Torrentdone = new Torrentdone(testRootConfigsPath);
    //
    logInfoMock = jest.spyOn(torrentdone.logger, 'info').mockImplementation();
    logDebugMock = jest.spyOn(torrentdone.logger, 'debug').mockImplementation();
    jest.spyOn(torrentdone.logger, 'trace').mockImplementation();
    logErrorMock = jest
      .spyOn(torrentdone.logger, 'error')
      .mockImplementation((_level: string | Level, ...args: any[]): any => {
        return args;
      });
    const execSyncMock = jest.spyOn(cproc, 'execSync').mockImplementation(() => {
      throw new Error('execSync emulate error');
    });
    // Run process
    await torrentdone.main();
    // Log Error
    expect(logErrorMock).toHaveBeenNthCalledWith(1, `execSync emulate error`);
    expect(logErrorMock).toHaveBeenNthCalledWith(2, `TORRENT ID: "100" ERROR END PROCESS`);
    execSyncMock.mockRestore();
  });
  // Foreach directory for DIR type torrent.
  it(`directory foreach throw error`, async () => {
    env.TR_APP_VERSION = version;
    env.TR_TORRENT_ID = '105';
    env.TR_TORRENT_NAME = `Obi-Wan Kenobi 1 - LostFilm.TV [1080p]`;
    env.TR_TORRENT_DIR = testMntDownloadsPath;
    env.TR_TORRENT_HASH = '65b9eea6e1cc6bb9f0cd2a47751a186f';
    env.TR_TIME_LOCALTIME = 'Fri Nov  4 17:22:09 2024';
    env.TR_TORRENT_LABELS = '';
    env.TR_TORRENT_BYTES_DOWNLOADED = '';
    env.TR_TORRENT_TRACKERS = '';
    //
    const torrentdone: Torrentdone = new Torrentdone(testRootConfigsPath);
    //
    logInfoMock = jest.spyOn(torrentdone.logger, 'info').mockImplementation();
    logDebugMock = jest.spyOn(torrentdone.logger, 'debug').mockImplementation();
    jest.spyOn(torrentdone.logger, 'trace').mockImplementation();
    logErrorMock = jest
      .spyOn(torrentdone.logger, 'error')
      .mockImplementation((_level: string | Level, ...args: any[]): any => {
        return args;
      });
    const readdirSyncMock = jest.spyOn(fs, 'readdirSync').mockImplementation(() => {
      throw new Error('readdirSync emulate error');
    });
    // Run process
    await torrentdone.main();
    // Log Error
    expect(logErrorMock).toHaveBeenNthCalledWith(1, `readdirSync emulate error`);
    expect(logErrorMock).toHaveBeenNthCalledWith(2, `TORRENT ID: "105" ERROR END PROCESS`);
    readdirSyncMock.mockRestore();
  });
  // Move file
  it(`move file exec command result throw error`, async () => {
    env.TR_APP_VERSION = version;
    env.TR_TORRENT_ID = '100';
    env.TR_TORRENT_NAME = `The.Handmaid's.Tale.S05E03.1080p.rus.LostFilm.TV.mkv`;
    env.TR_TORRENT_DIR = testMntDownloadsPath;
    env.TR_TORRENT_HASH = '540d0ae0eac6cc48e321e54293b19b858db355da';
    env.TR_TIME_LOCALTIME = 'Fri Nov  4 17:22:09 2022';
    env.TR_TORRENT_LABELS = '';
    env.TR_TORRENT_BYTES_DOWNLOADED = '';
    env.TR_TORRENT_TRACKERS = '';
    //
    const torrentdone: Torrentdone = new Torrentdone(testRootConfigsPath);
    //
    logInfoMock = jest.spyOn(torrentdone.logger, 'info').mockImplementation();
    logDebugMock = jest.spyOn(torrentdone.logger, 'debug').mockImplementation();
    jest.spyOn(torrentdone.logger, 'trace').mockImplementation();
    logErrorMock = jest
      .spyOn(torrentdone.logger, 'error')
      .mockImplementation((_level: string | Level, ...args: any[]): any => {
        return args;
      });
    const execSyncMock = jest.spyOn(cproc, 'execSync').mockImplementation(() => {
      copyFileSync(
        normalize(`${testMntDownloadsPath}/The.Handmaid's.Tale.S05E03.1080p.rus.LostFilm.TV.mkv`),
        normalize(
          `${testMntDataPath}/media/TV Shows/The Handmaid's Tale/Season 05/The.Handmaid's.Tale.S05E03.1080p.rus.LostFilm.TV.mkv`
        )
      );
      return `127.0.0.1:9091/transmission/rpc/\nresponded: "succcess"`;
    });
    // Run process
    await torrentdone.main();
    // Log Error
    expect(logErrorMock).toHaveBeenNthCalledWith(
      1,
      `Failed to move file "The.Handmaid's.Tale.S05E03.1080p.rus.LostFilm.TV.mkv". Reason: Negative result of exec command: 127.0.0.1:9091/transmission/rpc/responded: "succcess"`
    );
    expect(logErrorMock).toHaveBeenNthCalledWith(2, `TORRENT ID: "100" ERROR END PROCESS`);
    execSyncMock.mockRestore();
  });
  it(`move file exists final path throw error`, async () => {
    env.TR_APP_VERSION = version;
    env.TR_TORRENT_ID = '100';
    env.TR_TORRENT_NAME = `The.Handmaid's.Tale.S05E03.1080p.rus.LostFilm.TV.mkv`;
    env.TR_TORRENT_DIR = testMntDownloadsPath;
    env.TR_TORRENT_HASH = '540d0ae0eac6cc48e321e54293b19b858db355da';
    env.TR_TIME_LOCALTIME = 'Fri Nov  4 17:22:09 2022';
    env.TR_TORRENT_LABELS = '';
    env.TR_TORRENT_BYTES_DOWNLOADED = '';
    env.TR_TORRENT_TRACKERS = '';
    //
    const torrentdone: Torrentdone = new Torrentdone(testRootConfigsPath);
    //
    logInfoMock = jest.spyOn(torrentdone.logger, 'info').mockImplementation();
    logDebugMock = jest
      .spyOn(torrentdone.logger, 'debug')
      .mockImplementation((_level: string | Level, ...args: any[]): any => {
        return args;
      });
    jest.spyOn(torrentdone.logger, 'trace').mockImplementation();
    logErrorMock = jest
      .spyOn(torrentdone.logger, 'error')
      .mockImplementation((_level: string | Level, ...args: any[]): any => {
        return args;
      });
    const execSyncMock = jest.spyOn(cproc, 'execSync').mockImplementation(() => {
      copyFileSync(
        normalize(`${testMntDownloadsPath}/The.Handmaid's.Tale.S05E03.1080p.rus.LostFilm.TV.mkv`),
        normalize(
          `${testMntDataPath}/media/TV Shows/The Handmaid's Tale/Season 05/TTTTTThe.Handmaid's.Tale.S05E03.1080p.rus.LostFilm.TV.mkv`
        )
      );
      return `127.0.0.1:9091/transmission/rpc/\nresponded: "success"`;
    });
    // const existsSyncMock = jest.spyOn(fs, 'existsSync').mockReturnValue(false);
    // Run process
    await torrentdone.main();
    // Log Debug
    // expect(logDebugMock).toHaveBeenNthCalledWith(16, 'hello');
    // Log Error
    expect(logErrorMock).toHaveBeenNthCalledWith(
      1,
      `Failed to move file "The.Handmaid's.Tale.S05E03.1080p.rus.LostFilm.TV.mkv". Reason: file not found after move`
    );
    expect(logErrorMock).toHaveBeenNthCalledWith(2, `TORRENT ID: "100" ERROR END PROCESS`);
    execSyncMock.mockRestore();
    // existsSyncMock.mockRestore();
  });
  // Copy file
  it(`copy file throw error`, async () => {
    env.TR_APP_VERSION = version;
    env.TR_TORRENT_ID = '105';
    env.TR_TORRENT_NAME = `Obi-Wan Kenobi 1 - LostFilm.TV [1080p]`;
    env.TR_TORRENT_DIR = testMntDownloadsPath;
    env.TR_TORRENT_HASH = '65b9eea6e1cc6bb9f0cd2a47751a186f';
    env.TR_TIME_LOCALTIME = 'Fri Nov  4 17:22:09 2024';
    env.TR_TORRENT_LABELS = '';
    env.TR_TORRENT_BYTES_DOWNLOADED = '';
    env.TR_TORRENT_TRACKERS = '';
    //
    const torrentdone: Torrentdone = new Torrentdone(testRootConfigsPath);
    //
    logInfoMock = jest.spyOn(torrentdone.logger, 'info').mockImplementation();
    logDebugMock = jest.spyOn(torrentdone.logger, 'debug').mockImplementation();
    jest.spyOn(torrentdone.logger, 'trace').mockImplementation();
    logErrorMock = jest
      .spyOn(torrentdone.logger, 'error')
      .mockImplementation((_level: string | Level, ...args: any[]): any => {
        return args;
      });
    const copyFileSyncMock = jest.spyOn(fs, 'copyFileSync').mockImplementation(() => {
      throw new Error('copyFileSync emulate error');
    });
    // Run process
    await torrentdone.main();
    // Log Error
    expect(logErrorMock).toHaveBeenNthCalledWith(1, `copyFileSync emulate error`);
    expect(logErrorMock).toHaveBeenNthCalledWith(2, `TORRENT ID: "105" ERROR END PROCESS`);
    copyFileSyncMock.mockRestore();
  });
  it(`copy file exists final path throw error`, async () => {
    env.TR_APP_VERSION = version;
    env.TR_TORRENT_ID = '105';
    env.TR_TORRENT_NAME = `Obi-Wan Kenobi 1 - LostFilm.TV [1080p]`;
    env.TR_TORRENT_DIR = testMntDownloadsPath;
    env.TR_TORRENT_HASH = '65b9eea6e1cc6bb9f0cd2a47751a186f';
    env.TR_TIME_LOCALTIME = 'Fri Nov  4 17:22:09 2024';
    env.TR_TORRENT_LABELS = '';
    env.TR_TORRENT_BYTES_DOWNLOADED = '';
    env.TR_TORRENT_TRACKERS = '';
    //
    const torrentdone: Torrentdone = new Torrentdone(testRootConfigsPath);
    //
    logInfoMock = jest.spyOn(torrentdone.logger, 'info').mockImplementation();
    logDebugMock = jest.spyOn(torrentdone.logger, 'debug').mockImplementation();
    jest.spyOn(torrentdone.logger, 'trace').mockImplementation();
    logErrorMock = jest
      .spyOn(torrentdone.logger, 'error')
      .mockImplementation((_level: string | Level, ...args: any[]): any => {
        return args;
      });
    const copyFileSyncMock = jest.spyOn(fs, 'copyFileSync').mockImplementation(() => {
      return;
    });
    // Run process
    await torrentdone.main();
    // Log Error
    expect(logErrorMock).toHaveBeenNthCalledWith(
      1,
      `Error. Failed to copy file "Obi-Wan.Kenobi.S01E01.1080p.rus.LostFilm.TV.mkv"`
    );
    expect(logErrorMock).toHaveBeenNthCalledWith(2, `TORRENT ID: "105" ERROR END PROCESS`);
    copyFileSyncMock.mockRestore();
  });
  // Film process
  it(`film process throw error`, async () => {
    env.TR_APP_VERSION = version;
    env.TR_TORRENT_ID = '107';
    env.TR_TORRENT_NAME = `Аватар 3D (2009).mkv`;
    env.TR_TORRENT_DIR = testMntDownloadsPath;
    env.TR_TORRENT_HASH = '524e05dc77239f3a15dab766aaa59a9e432efde7';
    env.TR_TIME_LOCALTIME = 'Fri Nov  7 17:22:09 2022';
    env.TR_TORRENT_LABELS = '';
    env.TR_TORRENT_BYTES_DOWNLOADED = '';
    env.TR_TORRENT_TRACKERS = '';
    //
    const torrentdone: Torrentdone = new Torrentdone(testRootConfigsPath);
    //
    logInfoMock = jest.spyOn(torrentdone.logger, 'info').mockImplementation();
    logDebugMock = jest.spyOn(torrentdone.logger, 'debug').mockImplementation();
    jest.spyOn(torrentdone.logger, 'trace').mockImplementation();
    logErrorMock = jest
      .spyOn(torrentdone.logger, 'error')
      .mockImplementation((_level: string | Level, ...args: any[]): any => {
        return args;
      });
    //
    const execSyncMock = jest.spyOn(cproc, 'execSync').mockImplementation(() => {
      throw new Error('execSync emulate error');
    });
    // Run process
    await torrentdone.main();
    // log Error
    expect(logErrorMock).toHaveBeenNthCalledWith(1, 'execSync emulate error');
    expect(logErrorMock).toHaveBeenNthCalledWith(2, 'TORRENT ID: "107" ERROR END PROCESS');
    execSyncMock.mockRestore();
  });
  // Saving path prepare
  it(`saving path prepare throw error`, async () => {
    env.TR_APP_VERSION = version;
    env.TR_TORRENT_ID = '107';
    env.TR_TORRENT_NAME = `Аватар 3D (2009).mkv`;
    env.TR_TORRENT_DIR = testMntDownloadsPath;
    env.TR_TORRENT_HASH = '524e05dc77239f3a15dab766aaa59a9e432efde7';
    env.TR_TIME_LOCALTIME = 'Fri Nov  7 17:22:09 2022';
    env.TR_TORRENT_LABELS = '';
    env.TR_TORRENT_BYTES_DOWNLOADED = '';
    env.TR_TORRENT_TRACKERS = '';
    //
    const torrentdone: Torrentdone = new Torrentdone(testRootConfigsPath);
    //
    logInfoMock = jest.spyOn(torrentdone.logger, 'info').mockImplementation();
    logDebugMock = jest.spyOn(torrentdone.logger, 'debug').mockImplementation();
    jest.spyOn(torrentdone.logger, 'trace').mockImplementation();
    logErrorMock = jest
      .spyOn(torrentdone.logger, 'error')
      .mockImplementation((_level: string | Level, ...args: any[]): any => {
        return args;
      });
    //
    const mkdirSyncMock = jest.spyOn(fs, 'mkdirSync').mockImplementation(() => {
      throw new Error('mkdirSync emulate error');
    });
    // Run process
    await torrentdone.main();
    // log Error
    expect(logErrorMock).toHaveBeenNthCalledWith(1, 'mkdirSync emulate error');
    expect(logErrorMock).toHaveBeenNthCalledWith(2, 'TORRENT ID: "107" ERROR END PROCESS');
    mkdirSyncMock.mockRestore();
  });
  it(`saving path exists throw error`, async () => {
    env.TR_APP_VERSION = version;
    env.TR_TORRENT_ID = '107';
    env.TR_TORRENT_NAME = `Аватар 3D (2009).mkv`;
    env.TR_TORRENT_DIR = testMntDownloadsPath;
    env.TR_TORRENT_HASH = '524e05dc77239f3a15dab766aaa59a9e432efde7';
    env.TR_TIME_LOCALTIME = 'Fri Nov  7 17:22:09 2022';
    env.TR_TORRENT_LABELS = '';
    env.TR_TORRENT_BYTES_DOWNLOADED = '';
    env.TR_TORRENT_TRACKERS = '';
    //
    const torrentdone: Torrentdone = new Torrentdone(testRootConfigsPath);
    //
    logInfoMock = jest.spyOn(torrentdone.logger, 'info').mockImplementation();
    logDebugMock = jest.spyOn(torrentdone.logger, 'debug').mockImplementation();
    jest.spyOn(torrentdone.logger, 'trace').mockImplementation();
    logErrorMock = jest
      .spyOn(torrentdone.logger, 'error')
      .mockImplementation((_level: string | Level, ...args: any[]): any => {
        return args;
      });
    //
    const mkdirSyncMock = jest.spyOn(fs, 'mkdirSync').mockImplementation(() => {
      return undefined;
    });
    // Run process
    await torrentdone.main();
    // log Error
    expect(logErrorMock).toHaveBeenNthCalledWith(1, 'Saving path is can not be created');
    expect(logErrorMock).toHaveBeenNthCalledWith(2, 'TORRENT ID: "107" ERROR END PROCESS');
    mkdirSyncMock.mockRestore();
  });
  // Novafilm throw error
  it(`OK - 131 - californication.s06.hdtv.rus.eng.novafilm.tv.avi`, async () => {
    env.TR_APP_VERSION = version;
    env.TR_TORRENT_ID = '131';
    env.TR_TORRENT_NAME = `californication.s06.hdtv.rus.eng.novafilm.tv.avi`;
    env.TR_TORRENT_DIR = testMntDownloadsPath;
    env.TR_TORRENT_HASH = '540d0ae0eac6cc48e485e54293b19b858db355de';
    env.TR_TIME_LOCALTIME = 'Sat Sep  4 21:22:09 2022';
    env.TR_TORRENT_LABELS = '';
    env.TR_TORRENT_BYTES_DOWNLOADED = '';
    env.TR_TORRENT_TRACKERS = '';
    //
    const torrentdone: Torrentdone = new Torrentdone(testRootConfigsPath);
    //
    jest.spyOn(torrentdone.logger, 'info').mockImplementation();
    jest.spyOn(torrentdone.logger, 'debug').mockImplementation();
    jest.spyOn(torrentdone.logger, 'trace').mockImplementation();
    logErrorMock = jest
      .spyOn(torrentdone.logger, 'error')
      .mockImplementation((_level: string | Level, ...args: any[]): any => {
        return args;
      });
    //
    jest.spyOn(cproc, 'execSync').mockImplementation(() => {
      copyFileSync(
        normalize(`${testMntDownloadsPath}/californication.s06.hdtv.rus.eng.novafilm.tv.avi`),
        normalize(
          `${testMntDataPath}/media/Movies/${new Date().getFullYear()}/californication.s06.hdtv.rus.eng.novafilm.tv.avi`
        )
      );
      return `127.0.0.1:9091/transmission/rpc/\nresponded: "success"`;
    });
    //
    expect(torrentdone.TR_APP_VERSION).toEqual(version);
    expect(torrentdone.TR_TORRENT_ID).toEqual(131);
    expect(torrentdone.TR_TORRENT_NAME).toEqual(`californication.s06.hdtv.rus.eng.novafilm.tv.avi`);
    expect(torrentdone.TR_TORRENT_DIR).toEqual(testMntDownloadsPath);
    expect(torrentdone.TR_TORRENT_HASH).toEqual('540d0ae0eac6cc48e485e54293b19b858db355de');
    expect(torrentdone.TR_TIME_LOCALTIME).toEqual('Sat Sep  4 21:22:09 2022');
    expect(torrentdone.TR_TORRENT_LABELS).toEqual('');
    expect(torrentdone.TR_TORRENT_BYTES_DOWNLOADED).toEqual(0);
    expect(torrentdone.TR_TORRENT_TRACKERS).toEqual('');
    //
    await torrentdone.main();
    // log Error
    expect(logErrorMock).toHaveBeenNthCalledWith(
      1,
      `No data extracted for file "californication.s06.hdtv.rus.eng.novafilm.tv.avi"`
    );
  });
});

describe('torrentdone.ts - Second elements', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  // transmission 4.0 environment
  it(`TR_TORRENT_BYTES_DOWNLOADED and TR_TORRENT_TRACKERS`, async () => {
    env.TR_APP_VERSION = version;
    env.TR_TORRENT_ID = '100';
    env.TR_TORRENT_NAME = `The.Handmaid's.Tale.S05E03.1080p.rus.LostFilm.TV.mkv`;
    env.TR_TORRENT_DIR = testMntDownloadsPath;
    env.TR_TORRENT_HASH = '540d0ae0eac6cc48e321e54293b19b858db355da';
    env.TR_TIME_LOCALTIME = 'Fri Nov  4 17:22:09 2022';
    env.TR_TORRENT_LABELS = '';
    env.TR_TORRENT_BYTES_DOWNLOADED = '1024';
    env.TR_TORRENT_TRACKERS = 'https://127.0.0.1:4444/,https://127.0.0.1:4545/';
    //
    const torrentdone: Torrentdone = new Torrentdone(testRootConfigsPath);
    //
    logInfoMock = jest
      .spyOn(torrentdone.logger, 'info')
      .mockImplementation((_level: string | Level, ...args: any[]): any => {
        return args;
      });
    logDebugMock = jest.spyOn(torrentdone.logger, 'debug').mockImplementation();
    logErrorMock = jest.spyOn(torrentdone.logger, 'error').mockImplementation();
    jest.spyOn(torrentdone.logger, 'trace').mockImplementation();
    //
    jest.spyOn(cproc, 'execSync').mockImplementation(() => {
      copyFileSync(
        normalize(`${testMntDownloadsPath}/The.Handmaid's.Tale.S05E03.1080p.rus.LostFilm.TV.mkv`),
        normalize(
          `${testMntDataPath}/media/TV Shows/The Handmaid's Tale/Season 05/The.Handmaid's.Tale.S05E03.1080p.rus.LostFilm.TV.mkv`
        )
      );
      return `127.0.0.1:9091/transmission/rpc/\nresponded: "success"`;
    });
    //
    expect(torrentdone.TR_TORRENT_BYTES_DOWNLOADED).toEqual(1024);
    expect(torrentdone.TR_TORRENT_TRACKERS).toEqual('https://127.0.0.1:4444/,https://127.0.0.1:4545/');
    // Run process
    await torrentdone.main();
    // log Info
    expect(logInfoMock).toHaveBeenNthCalledWith(10, 'BYTES:  "1024"');
    expect(logInfoMock).toHaveBeenNthCalledWith(11, 'TRACKERS:  "https://127.0.0.1:4444/,https://127.0.0.1:4545/"');
    // Log Error
    expect(logErrorMock).not.toHaveBeenCalled();
  });
  // TR_TORRENT_LABELS
  it(`TR_TORRENT_LABELS`, async () => {
    env.TR_APP_VERSION = version;
    env.TR_TORRENT_ID = '100';
    env.TR_TORRENT_NAME = `The.Handmaid's.Tale.S05E03.1080p.rus.LostFilm.TV.mkv`;
    env.TR_TORRENT_DIR = testMntDownloadsPath;
    env.TR_TORRENT_HASH = '540d0ae0eac6cc48e321e54293b19b858db355da';
    env.TR_TIME_LOCALTIME = 'Fri Nov  4 17:22:09 2022';
    env.TR_TORRENT_LABELS = 'foo,bar,baz';
    env.TR_TORRENT_BYTES_DOWNLOADED = '1024';
    env.TR_TORRENT_TRACKERS = 'https://127.0.0.1:4444/,https://127.0.0.1:4545/';
    //
    const torrentdone: Torrentdone = new Torrentdone(testRootConfigsPath);
    //
    logInfoMock = jest
      .spyOn(torrentdone.logger, 'info')
      .mockImplementation((_level: string | Level, ...args: any[]): any => {
        return args;
      });
    logDebugMock = jest.spyOn(torrentdone.logger, 'debug').mockImplementation();
    logErrorMock = jest.spyOn(torrentdone.logger, 'error').mockImplementation();
    jest.spyOn(torrentdone.logger, 'trace').mockImplementation();
    //
    jest.spyOn(cproc, 'execSync').mockImplementation(() => {
      copyFileSync(
        normalize(`${testMntDownloadsPath}/The.Handmaid's.Tale.S05E03.1080p.rus.LostFilm.TV.mkv`),
        normalize(
          `${testMntDataPath}/media/TV Shows/The Handmaid's Tale/Season 05/The.Handmaid's.Tale.S05E03.1080p.rus.LostFilm.TV.mkv`
        )
      );
      return `127.0.0.1:9091/transmission/rpc/\nresponded: "success"`;
    });
    //
    expect(torrentdone.TR_TORRENT_LABELS).toEqual('foo,bar,baz');
    // Run process
    await torrentdone.main();
    // log Info
    expect(logInfoMock).toHaveBeenNthCalledWith(10, 'LABELS:  "foo,bar,baz"');
    // Log Error
    expect(logErrorMock).not.toHaveBeenCalled();
  });
});
