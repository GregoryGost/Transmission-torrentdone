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
 *
 * ```sh
 * ── Check File or Directory
 *   ├─ IS FILE
 *   | └─ Check file extensions (mkv,avi,mp4)
 *   |   └─ Check Releaser (LostFilm, NovaFilm, etc ...)
 *   |     └─ Check Serial or Film
 *   |       ├─ IS SERIAL => serialProcess()
 *   |       | ├─ If season directory (DIR_FLAG) - copy torrent files
 *   |       | └─ Else simple file - move torrent file
 *   |       └─ IS FILM   => filmProcess()
 *   |         └─ Check 2D or 3D
 *   |           ├─ If directory (DIR_FLAG) - copy torrent files
 *   |           └─ Else simple file - move torrent file
 *   └─ IS DIRECTORY (set DIR_FLAG)
 *     └─ Foreach directory
 *       └─ Repeat until we find the File in the directory (back to IS FILE processing)
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
   * Connect commant for transmission-remote.
   * Example: transmission-remote 127.0.0.1:9091 -n login:password
   */
  private readonly connect: string;
  /**
   * Transmission-daemon version.
   * Example: `3.00`
   */
  public readonly TR_APP_VERSION: string;
  /**
   * Torrent identificator (simple number).
   * Example: `999`
   */
  public readonly TR_TORRENT_ID: number;
  /**
   * Torrent name (like at view in Transmission Remote GUI interface)
   */
  public readonly TR_TORRENT_NAME: string;
  /**
   * Now torrent directory
   * Example: `/mnt/data/downloads`
   */
  public readonly TR_TORRENT_DIR: string;
  /**
   * Now torrent hash
   * Example: `36303f6192ce5c156084d05381a9138083b6180e`
   */
  public readonly TR_TORRENT_HASH: string;
  /**
   * Date and time torrentdone script start
   * Example: `Fri Nov  4 20:23:27 2022`
   */
  public readonly TR_TIME_LOCALTIME: string;
  /**
   * A comma-delimited list of the torrent's labels.
   * Example: `foo,bar,baz` ???
   */
  public readonly TR_TORRENT_LABELS: string;
  /**
   * ONLY FOR TRANSMISSION >= 4.0.0.
   * Number of bytes that were downloaded for this torrent.
   * Example: `123456789` ???
   */
  public readonly TR_TORRENT_BYTES_DOWNLOADED: number | undefined;
  /**
   * A comma-delimited list of the torrent's trackers' announce URLs.
   * Example: `https://foo.com,https://bar.org,https://baz.com` ???
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

  constructor(config: Config, logger: Logger) {
    this.config = config;
    this.logger = logger;
    this.connect = this.connectCommandCreate();
    this.TR_APP_VERSION = this.config.trAppVersion;
    this.TR_TORRENT_ID = this.config.trTorrentId;
    this.TR_TORRENT_NAME = this.config.trTorrentName;
    this.TR_TORRENT_DIR = this.config.trTorrentDir;
    this.TR_TORRENT_HASH = this.config.trTorrentHash;
    this.TR_TIME_LOCALTIME = this.config.trTimeLocaltime;
    this.TR_TORRENT_LABELS = this.config.trTorrentLabels;
    this.TR_TORRENT_BYTES_DOWNLOADED = this.config.trTorrentBytesDownloaded;
    this.TR_TORRENT_TRACKERS = this.config.trTorrentTrackers;
    this.DIR_FLAG = false;
    this.DIR_NAME = undefined;
    this.RELEASER = undefined;
  }

  /**
   * Basic constructor for creating a command to connect to a transmission-remote.
   * Example: `transmission-remote 127.0.0.1:9091 -n login:password`
   * @returns connect command
   */
  private connectCommandCreate(): string {
    return `transmission-remote ${this.config.ipAddress}:${this.config.port} --auth ${this.config.login}:${this.config.password}`;
  }

  /**
   * Create Shell move command transmission-daemon
   * MAN: https://www.mankier.com/1/transmission-remote
   * Example: Remove torrent 1 and 2, and also delete local data for torrent 2
   * `transmission-remote hostname -t 1 --remove -t 2 --remove-and-delete`
   * @param saving_path - saved path media file
   * @returns - command
   */
  private moveCommandCreate(saving_path: string): string {
    return `${this.connect} --torrent ${this.TR_TORRENT_ID} --move "${saving_path}"`;
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
   * /mnt/data/media/serials/$SERIALNAME/Season $SEASON/
   * @param file_name - File name
   * @returns - serial data
   */
  private extractSerialData(file_name: string): SerialDataI {
    const regexExec = this.regexNameSeason.exec(file_name);
    if (regexExec === null) throw new Error(`No data extracted for file "${file_name}"`);
    const name: string = Torrentdone.capitalize(regexExec[1]).replace(/(\.|\s|\_)/g, ' ');
    const season = `Season ${regexExec[3]}`;
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
    const name: string = Torrentdone.capitalize(regexExec[1]).replace(/(\.|\s|\_)/g, ' ');
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
    const name: string = Torrentdone.capitalize(regexExec[1]).replace(/(\.|\s|\_)/g, ' ');
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
   *
   * Plex: Naming and Organizing Your TV Show Files (from Plex)
   * https://support.plex.tv/articles/naming-and-organizing-your-tv-show-files/
   *
   * ```sh
   * /TV Shows
   *    /Doctor Who
   *       /Season 01
   * ```
   *
   * @param file_name - Torrent file name only
   * @param file_path - Torrent file full path
   */
  private async serialProcess(file_name: string, file_path: string, serial_data: SerialDataI): Promise<void> {
    try {
      this.logger.debug(`Processing serial file: "${file_name}"`);
      // Extracting individual data for the releaser (LostFilm, NovaFilm, etc)
      // Preparing the save directory
      const savingPath: string = normalize(
        `${this.config.mediaPath}/${this.config.serialsRootDir}/${serial_data.name}/${serial_data.season}`
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
   *
   * !!! The application does not use the recommended naming from Plex !!!
   *
   * Naming and organizing your Movie files (from Plex)
   * https://support.plex.tv/articles/naming-and-organizing-your-movie-media-files/
   *
   * ```sh
   * /Movies
   *    /Blade Runner (1982)
   *       Blade Runner (1982).mp4
   *    /Batman Begins (2005)
   *       Batman Begins (2005).mp4
   *       Batman Begins (2005).en.srt
   *       poster.jpg
   * ```
   * or
   * ```sh
   * /Movies
   *    Avatar (2009).mkv
   * ```
   *
   * @param file_name - Torrent file name only
   * @param file_path - Torrent file full path
   */
  private async filmProcess(file_name: string, file_path: string, film_data: FilmDataI): Promise<void> {
    try {
      this.logger.debug(`Processing film file: "${file_name}"`);
      // Preparing the save directory
      let savingPath: string = this.config.mediaPath;
      if (film_data.three_d) savingPath += `/${this.config.filmsRootDir}/3D/${film_data.year}`;
      else savingPath += `/${this.config.filmsRootDir}/2D/${film_data.year}`;
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
      let execResult: string = await Torrentdone.command(move_command);
      execResult = execResult.replace(/(\r\n|\n|\r)/gm, '');
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
    this.logger.info(`transmission-torrentdone: 2.0.0`);
    this.logger.info(`TORRENT ID: "${this.TR_TORRENT_ID}" FINISH: START PROCESS ...`);
    this.logger.info('==============================================================================================');
    this.logger.info(`VER:   "Transmission version - ${this.TR_APP_VERSION}"`);
    this.logger.info(`DIR:   "${this.TR_TORRENT_DIR}"`);
    this.logger.info(`NAME:  "${this.TR_TORRENT_NAME}"`);
    this.logger.info(`DTIME: "${this.TR_TIME_LOCALTIME}"`);
    this.logger.info(`HASH:  "${this.TR_TORRENT_HASH}"`);
    if (this.TR_TORRENT_LABELS.length > 0) this.logger.info(`LABELS:  "${this.TR_TORRENT_LABELS}"`);
    if (this.TR_TORRENT_BYTES_DOWNLOADED !== undefined && this.TR_TORRENT_BYTES_DOWNLOADED > 0)
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
   * [Static]
   * Execution connect command to a transmission-remote.
   * @param command - Command to a connect
   * @returns Execution result
   */
  private static async command(command: string): Promise<string> {
    try {
      return execSync(command, { timeout: 2000, encoding: 'utf8' });
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
   * [Static]
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
