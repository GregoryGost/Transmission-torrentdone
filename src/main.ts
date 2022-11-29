#!/usr/bin/node

import 'dotenv/config';
import { Config } from './class/Config.js';
import { Logger } from './class/Logger.js';
import { Torrentdone } from './class/Torrentdone.js';

const config: Config = new Config(
  process.env.TRANSMISSION_LOGIN,
  process.env.TRANSMISSION_PASSWORD,
  process.env.NODE_ENV,
  process.env.STORE_MEDIA_PATH,
  process.env.ALLOWED_MEDIA_EXTENSIONS,
  process.env.TORRENTDONE_LOG_LEVEL,
  process.env.TORRENTDONE_LOG_FILE_PATH,
  process.env.LOG_DATE_FORMAT,
  process.env.TRANSMISSION_IP_ADDRESS,
  process.env.TRANSMISSION_TCP_PORT
);
const logger: Logger = new Logger(config.logLevel, config.logFilePath);
const torrentdone: Torrentdone = new Torrentdone(
  config,
  logger,
  process.env.TR_APP_VERSION,
  process.env.TR_TORRENT_ID,
  process.env.TR_TORRENT_NAME,
  process.env.TR_TORRENT_DIR,
  process.env.TR_TORRENT_HASH,
  process.env.TR_TIME_LOCALTIME,
  process.env.TR_TORRENT_LABELS,
  process.env.TR_TORRENT_BYTES_DOWNLOADED,
  process.env.TR_TORRENT_TRACKERS
);

async function run(): Promise<void> {
  await torrentdone.main();
}

run();
