#!/usr/bin/node

import { Config } from './class/Config.js';
import { Logger } from './class/Logger.js';
import { Torrentdone } from './class/Torrentdone.js';

const config: Config = new Config();
const logger: Logger = new Logger(config.logLevel, config.logFilePath, config.dateFormat);
const torrentdone: Torrentdone = new Torrentdone(config, logger);

async function run(): Promise<void> {
  await torrentdone.main();
}

run();
