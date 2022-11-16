import { normalize } from 'node:path';
import { rmSync, existsSync } from 'node:fs';
import 'dotenv/config';
import { Config } from '../src/class/Config';
import { Logger } from '../src/class/Logger';
import { Torrentdone } from '../src/class/Torrentdone';

const root: string = process.cwd();
const logFilePath = './logs/torrentdone.log';
const testMntDataPath = normalize(root + '/tests/mnt/data');
const version = '3.00';

const config: Config = new Config(process.env.LOGIN, process.env.PASSWORD, 'development', testMntDataPath);
const logger: Logger = new Logger(config.logLevel, logFilePath);

// Basically, logs are added to the file and target directories. Remove before testing.
if (existsSync(logFilePath)) rmSync(logFilePath);
if (existsSync(testMntDataPath)) rmSync(testMntDataPath, { recursive: true });

describe('Passed tests', () => {
  // Class instance
  test('Torrentdone class instance and init params', () => {
    // Create Torrentdone class instance
    const file = 'INSTANCE_TEST.mp4';
    const torrentdone: Torrentdone = new Torrentdone(
      config,
      logger,
      version,
      '555',
      file,
      '/mnt/media/download/',
      '540d0ae0eac6cc48e321e54293b19b858db355da',
      'Fri Nov  4 17:22:09 2022',
      ''
    );
    expect(torrentdone).toBeInstanceOf(Torrentdone);
    expect(typeof torrentdone.TR_APP_VERSION).toEqual('string');
    expect(torrentdone.TR_APP_VERSION).toEqual(version);
    expect(typeof torrentdone.TR_TORRENT_ID).toEqual('string');
    expect(torrentdone.TR_TORRENT_ID).toEqual('555');
    expect(typeof torrentdone.TR_TORRENT_NAME).toEqual('string');
    expect(torrentdone.TR_TORRENT_NAME).toEqual(file);
    expect(typeof torrentdone.TR_TORRENT_DIR).toEqual('string');
    expect(torrentdone.TR_TORRENT_DIR).toEqual('/mnt/media/download/');
    expect(typeof torrentdone.TR_TORRENT_HASH).toEqual('string');
    expect(torrentdone.TR_TORRENT_HASH).toEqual('540d0ae0eac6cc48e321e54293b19b858db355da');
    expect(typeof torrentdone.TR_TIME_LOCALTIME).toEqual('string');
    expect(torrentdone.TR_TIME_LOCALTIME).toEqual('Fri Nov  4 17:22:09 2022');
  });
  // Single - Serial
  test('Torrents Single Serials files finished', async () => {
    const serialsNames = [
      `The.Handmaid's.Tale.S05E03.1080p.rus.LostFilm.TV.mkv`, // lostfilm mkv
      `Andor.S01E10.720p.rus.LostFilm.TV.mp4`, // lostfilm mp4
      `californication.s06e08.hdtv.rus.eng.novafilm.tv.avi`, // novafilm avi
      `paradox.s01e04.web-dl.rus.avi`, // simple serial avi
      `Supernatural.s13e04.WEB-DL.1080p.mkv`, // simple serial mkv
    ];
    let num = 100;
    for (const tr_torrent_name of serialsNames) {
      const torrentdone: Torrentdone = new Torrentdone(
        config,
        logger,
        version,
        String(num),
        tr_torrent_name,
        normalize(`${config.rootPath}/tests/mnt/downloads`),
        '540d0ae0eac6cc48e321e54293b19b858db355da',
        'Fri Nov  4 17:22:09 2022',
        ''
      );
      expect(torrentdone.TR_TORRENT_NAME).toEqual(tr_torrent_name);
      await torrentdone.main();
      num++;
    }
  });
  // Single - Film
  test('Torrents Single Films files finished', async () => {
    const filmsNames = [
      `Аватар 3D (2009).mkv`, // manual name mkv
      `Blade Runner 2049 (2017).mkv`, // Manual name number include mkv
      `All.Quiet.on.the.Western.Front.1080p.rus.LostFilm.TV.mkv`, // lostfilm mkv
      `Bullet.Train.1080p.rus.LostFilm.TV.avi`, // lostfilm avi
    ];
    let num = 200;
    for (const tr_torrent_name of filmsNames) {
      const torrentdone: Torrentdone = new Torrentdone(
        config,
        logger,
        version,
        String(num),
        tr_torrent_name,
        normalize(`${config.rootPath}/tests/mnt/downloads`),
        '540d0ae0eac6cc48e321e54293b19b858db355da',
        'Fri Nov  4 17:22:09 2022',
        ''
      );
      expect(torrentdone.TR_TORRENT_NAME).toEqual(tr_torrent_name);
      await torrentdone.main();
      num++;
    }
  });
  // Dir - Serial
  test('Torrents Directory Serials finished', async () => {
    const serialsDirNames = [
      `Obi-Wan Kenobi 1 - LostFilm.TV [1080p]`,
      `Californication.Season 6.HDTVRip.720p.NovaFilm`,
    ];
    let num = 300;
    for (const tr_torrent_name of serialsDirNames) {
      const torrentdone = new Torrentdone(
        config,
        logger,
        version,
        String(num),
        tr_torrent_name,
        normalize(`${config.rootPath}/tests/mnt/downloads`),
        'c11a9854aedf68e72b0d54a67fe0e34ec861cc6d',
        'Sat Nov  5 03:21:17 2022',
        ''
      );
      expect(torrentdone.TR_TORRENT_NAME).toEqual(tr_torrent_name);
      await torrentdone.main();
      num++;
    }
  });
  // Dir - Film
  test('Torrents Directory Films finished', async () => {
    const filmsDirNames = [`Властелин Колец`, `Harry.Potter.Collection`];
    let num = 400;
    for (const tr_torrent_name of filmsDirNames) {
      const torrentdone = new Torrentdone(
        config,
        logger,
        version,
        String(num),
        tr_torrent_name,
        normalize(`${config.rootPath}/tests/mnt/downloads`),
        'c11a9854aedf68e72b0d54a67fe0e34ec861cc6d',
        'Sat Nov  5 03:21:17 2022',
        ''
      );
      expect(torrentdone.TR_TORRENT_NAME).toEqual(tr_torrent_name);
      await torrentdone.main();
      num++;
    }
  });
});

describe('Errors and missing matches', () => {
  test('Torrents simple and error files finished', async () => {
    const filesNames = [
      'Simple_Media_file.mkv', // Simple file
      `Error_Test_File.mkv`, // Error test
    ];
    let num = 500;
    for (const tr_torrent_name of filesNames) {
      const torrentdone: Torrentdone = new Torrentdone(
        config,
        logger,
        version,
        String(num),
        tr_torrent_name,
        normalize(`${config.rootPath}/tests/mnt/downloads`),
        '540d0ae0eac6cc48e321e54293b19b858db355da',
        'Fri Nov  4 17:22:09 2022',
        ''
      );
      expect(torrentdone.TR_TORRENT_NAME).toEqual(tr_torrent_name);
      await torrentdone.main();
      num++;
    }
  });
});
