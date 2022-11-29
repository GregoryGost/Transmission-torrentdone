import { normalize, extname, basename, dirname } from 'node:path';
import { lstatSync, Stats, readdirSync, existsSync, mkdirSync, copyFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { Config } from './Config.js';
import { Logger } from './Logger.js';

/**
 * Base serial prepared data
 * Example name: **Paradox**
 * Example season: **Season_01**
 */
interface SerialDataI {
  name: string;
  season: string;
}

/**
 * Base film prepared data
 * Example name: **Avatar**
 * Example year: **2022**
 */
interface FilmDataI {
  year: string;
  three_d: boolean;
}

/**
 * Torrent Done class
 *
 * Tested on:
 * Debian GNU/Linux 11.5 (bullseye)
 * transmission-daemon 3.00 (14714)
 *
 * Example naming serials: (match regex_ser)
 *   File: The.Mandalorian.S02E08.1080p.rus.LostFilm.TV.mkv
 * Example naming films: (match regex_film -> regex_3d)
 *   File: Some Name (2022).mkv
 *
 * Algorithm:
 * ```shell
 * ── Check File or Directory
 *   ├─ IS FILE
 *   | └─ Check file is Serial or Film
 *   |   ├─ IS SERIAL => serialprocess()
 *   |   └─ IS FILM
 *   |     └─ Check 2D or 3D
 *   |       ├─ IS 2D => filmprocess()
 *   |       └─ IS 3D => filmprocess()
 *   ├─ IS DIRECTORY
 *     └─ Check torrent is Serial or Film (we cannot influence the name of the file in the directory)
 *       ├─ IS SERIAL => serialprocess()
 *       └─ IS FILM
 *         └─ Check 2D or 3D
 *           ├─ IS 2D => filmprocess()
 *           └─ IS 3D => filmprocess()
 * ```
 */
class Torrentdone {
  /**
   * Config instance object
   */
  private readonly config: Config;
  /**
   * Logger instance object
   */
  private readonly logger: Logger;
  /**
   * Transmission-daemon version.
   * Example: 3.00
   */
  public readonly TR_APP_VERSION: string;
  /**
   * Torrent identificator (simple number).
   * Example: 999
   */
  public readonly TR_TORRENT_ID: string;
  /**
   * Torrent name (like at view in Transmission Remote GUI interface)
   */
  public readonly TR_TORRENT_NAME: string;
  /**
   * Now torrent directory
   * Example: /mnt/data/downloads
   */
  public readonly TR_TORRENT_DIR: string;
  /**
   * Now torrent hash
   * Example: 36303f6192ce5c156084d05381a9138083b6180e
   */
  public readonly TR_TORRENT_HASH: string;
  /**
   * Date and time torrentdone script start
   * Example: Fri Nov  4 20:23:27 2022
   */
  public readonly TR_TIME_LOCALTIME: string;
  /**
   * A comma-delimited list of the torrent's labels
   * Example: TODO ???
   */
  public readonly TR_TORRENT_LABELS: string;
  /**
   * ONLY FOR TRANSMISSION >= 4.0.0
   * Number of bytes that were downloaded for this torrent
   * Example: TODO ???
   */
  public readonly TR_TORRENT_BYTES_DOWNLOADED: string | undefined;
  /**
   * A comma-delimited list of the torrent's trackers' announce URLs
   * Example: TODO ???
   */
  public readonly TR_TORRENT_TRACKERS: string | undefined;
  /**
   * Directory flag for move or copy files.
   * If directory, moving file does not work. Need usage only copy.
   */
  private DIR_FLAG: boolean;
  /**
   * For releaser name parameter
   */
  private RELEASER: string | undefined;
  /**
   * If torrent is dir, save torrent name to DIR_NAME
   */
  private DIR_NAME: string | undefined;
  /**
   * Regular Expressions for serial/tvshow definition
   */
  private readonly regexSerial_Base: RegExp = /(serial|season|s[0-9]{2}e[0-9]{2})/i;
  private readonly regexFilm_Base: RegExp = /[.(_\-\s](19|20)[0-9]{2}[.)_\-\s]/i;
  private readonly regexSerial_Lostfilm: RegExp = /(s[0-9]{2}e[0-9]{2}).+(lostfilm\.tv)/i;
  private readonly regexSerial_Novafilm: RegExp = /(s[0-9]{2}e[0-9]{2}).+(novafilm\.tv)/i;
  private readonly regexFilm_Releaser: RegExp = /^((?!s[0-9]{2}e[0-9]{2}).)*$/i;
  private readonly regexNameSeason: RegExp = /(.+)\.(s([0-9]{2}))/i;
  private readonly regexNameYear: RegExp = /^(.+)\s{0,1}([.(_\-\s]((19|20)[0-9]{2})[.)_\-\s]).+$/i;

  constructor(
    config: Config,
    logger: Logger,
    tr_app_version?: string,
    tr_torrent_id?: string,
    tr_torrent_name?: string,
    tr_torrent_dir?: string,
    tr_torrent_hash?: string,
    tr_time_localtime?: string,
    tr_torrent_labels?: string,
    tr_torrent_bytes_downloaded?: string,
    tr_torrent_trackers?: string
  ) {
    this.config = config;
    this.logger = logger;
    this.TR_APP_VERSION = tr_app_version !== undefined ? tr_app_version : '';
    this.TR_TORRENT_ID = tr_torrent_id !== undefined ? tr_torrent_id : '';
    this.TR_TORRENT_NAME = tr_torrent_name !== undefined ? tr_torrent_name : '';
    this.TR_TORRENT_DIR = tr_torrent_dir !== undefined ? tr_torrent_dir : '';
    this.TR_TORRENT_HASH = tr_torrent_hash !== undefined ? tr_torrent_hash : '';
    this.TR_TIME_LOCALTIME = tr_time_localtime !== undefined ? tr_time_localtime : '';
    this.TR_TORRENT_LABELS = tr_torrent_labels !== undefined ? tr_torrent_labels : '';
    this.TR_TORRENT_BYTES_DOWNLOADED = tr_torrent_bytes_downloaded;
    this.TR_TORRENT_TRACKERS = tr_torrent_trackers;
    this.DIR_FLAG = false;
    this.DIR_NAME = undefined;
    this.RELEASER = undefined;
    this.checkVariable();
  }

  /**
   * Check transmission-daemon variables/parameters for start work
   * variables pass to Environment
   * transmission-daemon passes 7 variables to script / 9 for transmission-daemon 4.X.X
   * More info: <https://github.com/transmission/transmission/blob/4.0.0-beta.1/docs/Scripts.md>
   *
   * ```sh
   * TR_APP_VERSION: '3.00',
   * TR_TIME_LOCALTIME: 'Sun Nov  6 04:31:04 2022',
   * TR_TORRENT_DIR: '/mnt/data/download',
   * TR_TORRENT_HASH: '9ef9e27600d656140ba016aa81460fe2e518cbda',
   * TR_TORRENT_ID: '3',
   * TR_TORRENT_NAME: 'Some file name',
   * TR_TORRENT_LABELS: ''
   * ```
   * New for transmission 4.0 `TR_TORRENT_BYTES_DOWNLOADED` and `TR_TORRENT_TRACKERS`
   *
   * ```sh
   * TR_APP_VERSION: '4.0.0',
   * TR_TIME_LOCALTIME: 'Sun Nov  6 04:31:04 2022',
   * TR_TORRENT_BYTES_DOWNLOADED: '5456454',
   * TR_TORRENT_DIR: '/mnt/data/download',
   * TR_TORRENT_HASH: '9ef9e27600d656140ba016aa81460fe2e518cbda',
   * TR_TORRENT_ID: '3',
   * TR_TORRENT_LABELS: '',
   * TR_TORRENT_NAME: 'Some file name',
   * TR_TORRENT_TRACKERS: ''
   * ```
   *
   */
  private checkVariable(): void {
    if (
      this.TR_APP_VERSION.length < 1 ||
      this.TR_TIME_LOCALTIME.length < 1 ||
      this.TR_TORRENT_DIR.length < 1 ||
      this.TR_TORRENT_ID.length < 1 ||
      this.TR_TORRENT_NAME.length < 1 ||
      this.TR_TORRENT_HASH.length < 1
    )
      throw new Error(
        `One or more parameters do not match the requirements: TR_APP_VERSION - "${this.TR_APP_VERSION}", TR_TIME_LOCALTIME - "${this.TR_TIME_LOCALTIME}", TR_TORRENT_ID - "${this.TR_TORRENT_ID}", TR_TORRENT_DIR - "${this.TR_TORRENT_DIR}", TR_TORRENT_NAME - "${this.TR_TORRENT_NAME}", TR_TORRENT_HASH - "${this.TR_TORRENT_HASH}"`
      );
  }

  /**
   * Create Shell move command transmission-daemon
   * MAN: https://www.mankier.com/1/transmission-remote
   * Example: transmission-remote ipAddress:port -n login:password -t ID --move /mnt/data/media/etc
   * @param saving_path - saved path media file
   * @returns - command
   */
  private moveCommandCreate(saving_path: string): string {
    const bin = 'transmission-remote';
    const target = `${this.config.ipAddress}:${this.config.port}`;
    const auth = `${this.config.login}:${this.config.password}`;
    const command = `${bin} ${target} -n ${auth} -t ${this.TR_TORRENT_ID} --move ${saving_path}`;
    return command;
  }

  /**
   * (Base processing)
   * Check torrent file is Serial or a Film
   * Example Serial:
   * - Supernatural.s13e04.WEB-DL.1080p.mkv
   * - paradox.s01e04.web-dl.rus.avi
   * Example Film:
   * - Blade Runner (2019).mkv
   * - Avatar 3D (2009).mkv
   * @param file_name - Torrent file name only
   * @param file_path - Torrent file full path
   * @returns (boolean | undefined) - true: file is Serial, false: file is Film / undefined - not Serial, not Film
   */
  private async checkSerialOrFilm(file_name: string, file_path: string): Promise<void> {
    try {
      this.logger.debug(`RELEASER: ${this.RELEASER}`);
      this.logger.debug(`Base processing`);
      this.logger.debug(`Check Serial or Film: "${file_name}"`);
      if (this.regexSerial_Base.test(file_name)) {
        // Is Serial
        this.logger.info(`File "${file_name}" is a SERIAL`);
        this.logger.debug(`File check is regex: "${this.regexSerial_Base}"`);
        const serialData: SerialDataI = this.extractSerialData(file_name);
        await this.serialProcess(file_name, file_path, serialData);
      } else if (this.regexFilm_Base.test(file_name)) {
        // Is Film
        this.logger.info(`File "${file_name}" is a FILM`);
        this.logger.debug(`File check is regex: "${this.regexFilm_Base}"`);
        const filmData: FilmDataI = this.extractFilmData(file_name);
        await this.filmProcess(file_name, file_path, filmData);
      } else {
        // Is not Serial and Film
        this.logger.info(`File "${file_name}" is not Serial or Film. NO ACTION`);
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Check torrent file is Serial or a Film for LostFilm individual
   * @param file_name - Torrent file name only
   * @param file_path - Torrent file full path
   */
  private async checkSerialOrFilm_Lostfilm(file_name: string, file_path: string) {
    try {
      this.logger.debug(`RELEASER: ${this.RELEASER}`);
      this.logger.debug(`Check Serial or Film: "${file_name}"`);
      if (this.regexSerial_Lostfilm.test(file_name)) {
        // Is Serial
        this.logger.info(`File "${file_name}" is a SERIAL`);
        this.logger.debug(`File check is regex: "${this.regexSerial_Lostfilm}"`);
        // Basic Serial Data
        const serialData: SerialDataI = this.extractSerialData(file_name);
        await this.serialProcess(file_name, file_path, serialData);
      } else if (this.regexFilm_Releaser.test(file_name)) {
        // Is Film
        this.logger.info(`File "${file_name}" is a FILM`);
        this.logger.debug(`File check is regex: "${this.regexFilm_Releaser}"`);
        const filmData: FilmDataI = this.extractFilmData_Lostfilm(file_name);
        await this.filmProcess(file_name, file_path, filmData);
      } else {
        // Is not Serial and Film, but is Lostfilm
        this.logger.info(`File "${file_name}" is not Serial or Film. NO ACTION`);
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Check torrent file is Serial or a Film for NovaFilm individual
   * @param file_name - Torrent file name only
   * @param file_path - Torrent file full path
   */
  private async checkSerialOrFilm_Novafilm(file_name: string, file_path: string) {
    try {
      this.logger.debug(`RELEASER: ${this.RELEASER}`);
      this.logger.debug(`Check Serial or Film: "${file_name}"`);
      if (this.regexSerial_Novafilm.test(file_name)) {
        // Is Serial
        this.logger.info(`File "${file_name}" is a SERIAL`);
        this.logger.debug(`File check is regex: "${this.regexSerial_Novafilm}"`);
        // Basic Serial Data
        const serialData: SerialDataI = this.extractSerialData(file_name);
        await this.serialProcess(file_name, file_path, serialData);
      } else if (this.regexFilm_Releaser.test(file_name)) {
        // Is Film
        this.logger.info(`File "${file_name}" is a FILM`);
        this.logger.debug(`File check is regex: "${this.regexFilm_Releaser}"`);
        // Basic Film Data
        const filmData: FilmDataI = this.extractFilmData(file_name);
        await this.filmProcess(file_name, file_path, filmData);
      } else {
        // Is not Serial and Film, but is Lostfilm
        this.logger.info(`File "${file_name}" is not Serial or Film. NO ACTION`);
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Extract data for serials
   * /mnt/data/media/serials/$SERIALNAME/Season_$SEASON/
   * @param file_name - File name
   * @returns - serial data
   */
  private extractSerialData(file_name: string): SerialDataI {
    const regexExec = this.regexNameSeason.exec(file_name);
    if (regexExec === null) throw new Error(`No data extracted for file "${file_name}"`);
    const name: string = Torrentdone.capitalize(regexExec[1]).replace(/(\.|\s)/g, '_');
    const season = `Season_${regexExec[3]}`;
    const data: SerialDataI = {
      name: name,
      season: season,
    };
    this.logger.debug(`Extracted data (${this.RELEASER}): name="${data.name}" season="${data.season}"`);
    this.logger.debug(`Extracted serial data regex: "${this.regexNameSeason}"`);
    return data;
  }

  /**
   * Extract data for films download
   * /mnt/data/media/films/2D/$YEAR/
   * /mnt/data/media/films/3D/$YEAR/
   * @param file_name - File name
   * @returns - film data
   */
  private extractFilmData(file_name: string): FilmDataI {
    const regexExec = this.regexNameYear.exec(file_name);
    if (regexExec === null) throw new Error(`No data extracted for file "${file_name}"`);
    const name: string = Torrentdone.capitalize(regexExec[1]).replace(/(\.|\s)/g, '_');
    const year = regexExec[3];
    const regexThreeD = /\_3D\_/i;
    const data: FilmDataI = {
      year: year,
      three_d: regexThreeD.test(name),
    };
    this.logger.debug(
      `Extracted data (${this.RELEASER}): name="${name}" year="${data.year}" three_d="${data.three_d}"`
    );
    this.logger.debug(`Extracted film data regex: "${this.regexNameYear}"`);
    return data;
  }

  /**
   * Extract data for films download from LostFilm releaser
   * 1. No variant extract film year from video file. Get always now year (why not?)
   * 2. Only 2D (or not?)
   * Example file: All.Quiet.on.the.Western.Front.1080p.rus.LostFilm.TV.mkv
   * Example file: Bullet.Train.1080p.rus.LostFilm.TV.avi
   * /mnt/data/media/films/2D/$YEAR/
   * @param file_name - File name
   * @returns - film data
   */
  private extractFilmData_Lostfilm(file_name: string): FilmDataI {
    const regexNameYearLostfilm = /^(.+).+(1080|720).+(lostfilm).+$/i;
    const regexExec = regexNameYearLostfilm.exec(file_name);
    if (regexExec === null) throw new Error(`No data extracted for file "${file_name}"`);
    const name: string = Torrentdone.capitalize(regexExec[1]).replace(/(\.|\s)/g, '_');
    const year = new Date().getFullYear().toString();
    const data: FilmDataI = {
      year: year,
      three_d: false,
    };
    this.logger.debug(`Extracted data (${this.RELEASER}): name="${name}" year="${data.year}" only 2D`);
    return data;
  }

  /**
   * Create the missing folders for saving torrent file
   * @param saving_path - check full saving path
   */
  private async savingPathPrepare(saving_path: string): Promise<void> {
    try {
      // Exists path ?
      if (existsSync(saving_path)) {
        this.logger.debug(`Saving path is exists`);
      } else {
        this.logger.debug(`Saving path does not exist. Create the missing folders.`);
        mkdirSync(saving_path, { recursive: true });
        if (!existsSync(saving_path)) {
          throw new Error('Saving path is can not be created');
        } else {
          this.logger.debug(`Saving path directories is created`);
        }
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Serial/TVmovie file processing
   * @param file_name - Torrent file name only
   * @param file_path - Torrent file full path
   */
  private async serialProcess(file_name: string, file_path: string, serial_data: SerialDataI): Promise<void> {
    try {
      this.logger.debug(`Processing serial file: "${file_name}"`);
      // Extracting individual data for the releaser (LostFilm, NovaFilm, etc)
      // Preparing the save directory
      const savingPath: string = normalize(
        this.config.mediaPath + `/serials/${serial_data.name}/${serial_data.season}`
      );
      this.logger.debug(`Saving path: "${savingPath}"`);
      await this.savingPathPrepare(savingPath);
      // Move if file / Copy if file into directory
      if (this.DIR_FLAG) {
        // Copy
        this.logger.info(`COPY file "${file_name}" to saving path "${savingPath}"`);
        await this.copyFile(file_name, file_path, savingPath);
      } else {
        // Move
        this.logger.info(`MOVE file "${file_name}" to saving path "${savingPath}"`);
        const moveCommand: string = this.moveCommandCreate(savingPath);
        this.logger.debug(`Move command: "${moveCommand}"`);
        await this.transmissionMoveFile(moveCommand, file_name, savingPath);
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Film/Movie file processing
   * @param file_name - Torrent file name only
   * @param file_path - Torrent file full path
   */
  private async filmProcess(file_name: string, file_path: string, film_data: FilmDataI): Promise<void> {
    try {
      this.logger.debug(`Processing film file: "${file_name}"`);
      // Preparing the save directory
      let savingPath: string = this.config.mediaPath;
      if (film_data.three_d) savingPath += `/films/3D/${film_data.year}`;
      else savingPath += `/films/2D/${film_data.year}`;
      savingPath = normalize(savingPath);
      this.logger.debug(`Saving path: "${savingPath}"`);
      await this.savingPathPrepare(savingPath);
      // Move if file / Copy if file into directory
      if (this.DIR_FLAG) {
        // Copy
        this.logger.info(`COPY file "${file_name}" to saving path "${savingPath}"`);
        await this.copyFile(file_name, file_path, savingPath);
      } else {
        // Move
        this.logger.info(`MOVE file "${file_name}" to saving path "${savingPath}"`);
        const moveCommand: string = this.moveCommandCreate(savingPath);
        this.logger.debug(`Move command: "${moveCommand}"`);
        await this.transmissionMoveFile(moveCommand, file_name, savingPath);
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Final file copy. Applies to a directory.
   * @param file_name - Torrent file name only
   * @param file_path - Torrent file full path
   * @param saving_path - Target saving path (final dir!)
   */
  private async copyFile(file_name: string, file_path: string, saving_path: string): Promise<void> {
    try {
      this.logger.debug(`Start copying file...`);
      const finalPath: string = normalize(`${saving_path}/${file_name}`);
      copyFileSync(file_path, finalPath);
      if (!existsSync(finalPath)) {
        throw new Error(`Error. Failed to copy file "${file_name}"`);
      } else {
        this.logger.info(`File "${file_name}" copied successfully. => END`);
        this.logger.debug(`File final path: "${finalPath}"`);
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Performing a file move.
   * Moving a file is done by the standard transmission command i.e. giveaway will continue from the new placement.
   * @param move_command - Prepared shell command for transmission-remote
   * @param file_name - Base name of the file being moved
   * @param saving_path - Full path to move the file
   */
  private async transmissionMoveFile(move_command: string, file_name: string, saving_path: string): Promise<void> {
    try {
      this.logger.debug(`Start moving file...`);
      const finalPath: string = normalize(`${saving_path}/${file_name}`);
      const regexSuccess = /success/i;
      const execResult: string = execSync(move_command, { timeout: 2000, encoding: 'utf8' }).replace(
        /(\r\n|\n|\r)/gm,
        ''
      );
      // 127.0.0.1:9091/transmission/rpc/ responded: "success"
      this.logger.debug(`execResult: ${execResult}`);
      if (!regexSuccess.test(execResult)) {
        throw new Error(
          `Error. Failed to move file "${file_name}". Reason: Negative result of exec command: ${execResult}`
        );
      }
      if (!existsSync(finalPath)) {
        throw new Error(`Error. Failed to move file "${file_name}". Reason: file not found after move`);
      } else {
        this.logger.info(`File "${file_name}" moving successfully. => END`);
        this.logger.debug(`File final path: "${finalPath}"`);
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Displaying information about the downloaded torrent
   */
  private startInfo(): void {
    this.logger.info('##############################################################################################');
    this.logger.info(`TORRENT ID: "${this.TR_TORRENT_ID}" FINISH: START PROCESS ...`);
    this.logger.info('==============================================================================================');
    this.logger.info(`VER:   "Transmission version - ${this.TR_APP_VERSION}"`);
    this.logger.info(`DIR:   "${this.TR_TORRENT_DIR}"`);
    this.logger.info(`NAME:  "${this.TR_TORRENT_NAME}"`);
    this.logger.info(`DTIME: "${this.TR_TIME_LOCALTIME}"`);
    this.logger.info(`HASH:  "${this.TR_TORRENT_HASH}"`);
    if (this.TR_TORRENT_LABELS.length > 0) this.logger.info(`LABELS:  "${this.TR_TORRENT_LABELS}"`);
    if (this.TR_TORRENT_BYTES_DOWNLOADED !== undefined && this.TR_TORRENT_BYTES_DOWNLOADED.length > 0)
      this.logger.info(`BYTES:  "${this.TR_TORRENT_BYTES_DOWNLOADED}"`);
    if (this.TR_TORRENT_TRACKERS !== undefined && this.TR_TORRENT_TRACKERS.length > 0)
      this.logger.info(`TRACKERS:  "${this.TR_TORRENT_TRACKERS}"`);
    this.logger.info('==============================================================================================');
  }

  /**
   * Terminating delimiter output
   */
  private endInfo(error_flag = false): void {
    this.logger.info('==============================================================================================');
    if (error_flag) this.logger.error(`TORRENT ID: "${this.TR_TORRENT_ID}" ERROR END PROCESS`);
    else this.logger.info(`TORRENT ID: "${this.TR_TORRENT_ID}" END PROCESS`);
    this.logger.info(
      '##############################################################################################\n'
    );
  }

  /**
   * Check Releaser for torrent file
   * LostFilm, NovaFilm, etc
   * @param file_name - Torrent file name only
   * @param file_path - Torrent file full path
   */
  private async checkReleaser(file_name: string, file_path: string): Promise<void> {
    try {
      this.logger.debug(`Check Releaser for: "${file_name}"`);
      // Releaser processing
      const lostfilm = new RegExp('lostfilm', 'i');
      const novafilm = new RegExp('novafilm', 'i');
      //
      if (lostfilm.test(file_name)) {
        // Is LostFilm file (serial or film)
        this.logger.info(`Releaser found: "LostFilm"`);
        this.logger.debug(`Releaser regex: "${lostfilm}"`);
        this.RELEASER = 'lostfilm';
        await this.checkSerialOrFilm_Lostfilm(file_name, file_path);
      } else if (novafilm.test(file_name)) {
        // Is NovaFilm file (serial or film)
        this.logger.info(`Releaser found: "NovaFilm"`);
        this.logger.debug(`Releaser regex: "${novafilm}"`);
        this.RELEASER = 'novafilm';
        await this.checkSerialOrFilm_Novafilm(file_name, file_path);
      } else {
        // No releaser base processing
        this.logger.debug(`Releaser not found`);
        await this.checkSerialOrFilm(file_name, file_path);
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * If torrent Directory, foreach files and check only media file
   * mkv, avi, mp4
   * @param dir - Directory path
   */
  private async directoryForeach(dir: string): Promise<void> {
    try {
      this.logger.info(`Directory process: "${dir}"`);
      const elementsList: string[] = readdirSync(dir);
      this.logger.debug(`All elements in dir: "${elementsList}"`);
      for (const element of elementsList) {
        const elementPath: string = normalize(`${this.TR_TORRENT_DIR}/${this.TR_TORRENT_NAME}/${element}`);
        await this.checkFileOrDirectory(elementPath);
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * [Static]
   * Check torrent is file or directory
   * @param path - torrent path
   * @returns (boolean | undefined) - true: torrent is File, false: torrent is Directory / undefined - not File, not Directory
   */
  private static async isFileOrDirectoryOrUnknown(path: string): Promise<boolean | undefined> {
    try {
      const stat: Stats = lstatSync(path);
      const isFile: boolean = stat.isFile();
      const isDirectory: boolean = stat.isDirectory();
      if (isFile) return true;
      if (isDirectory) return false;
      return undefined;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Check torrent is File or is Directory or Unknown type
   * @param element_path - torrent path
   */
  private async checkFileOrDirectory(element_path: string): Promise<void> {
    try {
      // File or Dir or Unknown
      const fileOrDir: boolean | undefined = await Torrentdone.isFileOrDirectoryOrUnknown(element_path);
      this.logger.info('================================');
      if (fileOrDir === true) {
        // Is File
        const fileExtension: string = extname(element_path);
        const fileName: string = basename(element_path, fileExtension);
        this.logger.info(`Element: "${fileName + fileExtension}" is a FILE`);
        this.logger.debug(`Element: file extension: "${fileExtension}"`);
        // Only not parted files
        if (this.config.allowedMediaExtensions.test(fileExtension)) {
          // if (fileExtension === '.avi' || fileExtension === '.mp4' || fileExtension === '.mkv') {
          this.logger.debug(`Element: full path: "${element_path}"`);
          // => 1. Check Releaser
          await this.checkReleaser(fileName + fileExtension, element_path);
        } else {
          this.logger.debug(
            `Element: file extension "${fileExtension}" does not match allowed extensions regex: "${this.config.allowedMediaExtensions}"`
          );
          this.logger.info(`Element does not match allowed extensions. NO ACTION`);
        }
      } else if (fileOrDir === false) {
        // Is Directory
        this.DIR_FLAG = true;
        this.DIR_NAME = this.TR_TORRENT_NAME;
        const dirName: string = dirname(element_path);
        this.logger.info(`Element: "${dirName}" is a DIRECTORY`);
        this.logger.debug(`DIR_FLAG: "${this.DIR_FLAG}"`);
        this.logger.debug(`Element: full path: "${element_path}"`);
        // FOREACH directory. Check into files.
        await this.directoryForeach(element_path);
      } else {
        // Unknown type: no next action
        this.logger.debug(`TR_TORRENT_NAME: "${this.TR_TORRENT_NAME}" is neither a file or a directory`);
        this.logger.debug(`Element: full path: "${element_path}"`);
        this.logger.info(`Element is not File or Directory. NO ACTION`);
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Main torrent done process
   */
  public async main(): Promise<void> {
    try {
      this.startInfo();
      const torrentPath: string = normalize(`${this.TR_TORRENT_DIR}/${this.TR_TORRENT_NAME}`);
      await this.checkFileOrDirectory(torrentPath);
      this.endInfo();
    } catch (error) {
      if (this.config.devmode) this.logger.trace(error.message, error.stack);
      else this.logger.error(error.message);
      this.endInfo(true);
    }
  }

  /**
   * Utility function. Capitalize first char in text
   * Example: paradox => Paradox
   * @param text - string
   * @returns - capitalized string
   */
  private static capitalize(text: string): string {
    return text[0].toUpperCase() + text.slice(1);
  }
}

export { Torrentdone };
