import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, normalize, join } from 'node:path';
import { existsSync } from 'node:fs';
import nconf from 'nconf';

/**
 * Config class
 * Basic configuration parameters
 */
class Config {
  /**
   * Path to root application dir
   */
  private readonly _rootPath: string;
  /**
   * Nconf implements
   */
  private readonly nconf: typeof nconf = nconf;
  /**
   * Development mode status
   * if development = true
   * Default: development
   */
  private readonly _devmode: boolean;
  /**
   * This Application version
   * Read from base file package.json
   */
  private readonly _appVersion: string;
  /**
   * Log level.
   * if devmode(true) = `trace`.
   * Variants: (`trace` | `debug` | `info` | `warn` | `error`).
   * Default: `info`
   */
  private readonly _logLevel: string;
  /**
   * Date and time format. Used in winston and application.
   * Formatted string accepted by the [date-format](https://www.npmjs.com/package/date-format).
   * Default: `dd.MM.yyyy_hh:mm:ss.SSS`
   */
  private readonly _dateFormat: string;
  //
  // TRANSMISSION SETTINGS
  //
  /**
   * Torrent done log file path.
   * Default: `/var/log/transmission/torrentdone.log`
   */
  private readonly _logFilePath: string;
  /**
   * Transmission-daemon IP Address.
   * Default: `127.0.0.1` (localhost)
   */
  private readonly _ipAddress: string;
  /**
   * Transmission-daemon TCP Port.
   * Default: `9091`
   */
  private readonly _port: number;
  /**
   * Transmission-daemon access login
   */
  private readonly _login: string | undefined;
  /**
   * Transmission-daemon access password
   */
  private readonly _password: string | undefined;
  /**
   * Path to move and copy movie and series files
   */
  private readonly _mediaPath: string;
  /**
   * The name of the directory where TV shows will be saved
   */
  private readonly _serialsRootDir: string;
  /**
   * The name of the directory where the movies will be saved
   */
  private readonly _filmsRootDir: string;
  /**
   * Allowed extensions for media files.
   * Default: `mkv,mp4,avi`
   */
  private readonly _allowedMediaExtensions: RegExp;
  /**
   * Transmission-daemon version.
   * Example: `3.00`
   */
  private readonly _trAppVersion: string;
  /**
   * Torrent identificator (simple number).
   * Example: `999`
   */
  private readonly _trTorrentId: number;
  /**
   * Torrent name (like at view in Transmission Remote GUI interface)
   */
  private readonly _trTorrentName: string;
  /**
   * Now torrent directory.
   * Example: `/mnt/data/downloads`
   */
  private readonly _trTorrentDir: string;
  /**
   * Now torrent hash.
   * Example: `149f78bfd91fa7e91856b456d6fee59202bfcec0`
   */
  private readonly _trTorrentHash: string;
  /**
   * Date and time torrentdone script start.
   * Example: `Fri Nov  4 20:23:27 2022`
   */
  private readonly _trTimeLocaltime: string;
  /**
   * A comma-delimited list of the torrent's labels.
   * Example: `foo,bar,baz` ???
   */
  private readonly _trTorrentLabels: string;
  /**
   * ONLY FOR TRANSMISSION >= 4.0.0.
   * Number of bytes that were downloaded for this torrent.
   * Example: `123456789` ???
   */
  private readonly _trTorrentBytesDownloaded: number;
  /**
   * A comma-delimited list of the torrent's trackers' announce URLs.
   * Example: `https://foo.com,https://bar.org,https://baz.com` ???
   */
  private readonly _trTorrentTrackers: string;

  constructor(root_path?: string) {
    this._rootPath = root_path ?? Config.getRootDir();
    this.init();
    this._login = this.getParam('login');
    this._password = this.getParam('password');
    this._devmode = this.getParam('node_env') === 'development';
    this._appVersion = this.getParam('version');
    this._logLevel = this._devmode ? 'trace' : this.getParam('log_level');
    this._dateFormat = this.getParam('date_format');
    this._logFilePath = this.getParam('log_file_path');
    // Application parameters
    this._ipAddress = this.getParam('ip_address');
    this._port = Number(this.getParam('tcp_port'));
    this._allowedMediaExtensions = Config.extensionsRegexTemplate(this.getParam('allowed_media_extensions'));
    this._mediaPath = this._devmode ? normalize(`${this._rootPath}/mnt/data/media`) : this.getParam('media_path');
    this._serialsRootDir = this.getParam('serials_root_dir');
    this._filmsRootDir = this.getParam('films_root_dir');
    // Transmission Environment
    this._trAppVersion = this.getParam('TR_APP_VERSION');
    this._trTorrentId = Number(this.getParam('TR_TORRENT_ID'));
    this._trTorrentName = this.getParam('TR_TORRENT_NAME');
    this._trTorrentDir = this.getParam('TR_TORRENT_DIR');
    this._trTorrentHash = this.getParam('TR_TORRENT_HASH');
    this._trTimeLocaltime = this.getParam('TR_TIME_LOCALTIME');
    this._trTorrentLabels = this.getParam('TR_TORRENT_LABELS');
    this._trTorrentBytesDownloaded = Number(this.getParam('TR_TORRENT_BYTES_DOWNLOADED'));
    this._trTorrentTrackers = this.getParam('TR_TORRENT_TRACKERS');
  }

  get rootPath(): string {
    return this._rootPath;
  }

  get devmode(): boolean {
    return this._devmode;
  }

  get appVersion(): string {
    return this._appVersion;
  }

  get logLevel(): string {
    return this._logLevel;
  }

  get dateFormat(): string {
    return this._dateFormat;
  }

  get logFilePath(): string {
    return this._logFilePath;
  }

  get ipAddress(): string {
    return this._ipAddress;
  }

  get port(): number {
    return this._port;
  }

  get login(): string | undefined {
    return this._login;
  }

  get password(): string | undefined {
    return this._password;
  }

  get mediaPath(): string {
    return this._mediaPath;
  }

  get serialsRootDir(): string {
    return this._serialsRootDir;
  }

  get filmsRootDir(): string {
    return this._filmsRootDir;
  }

  get allowedMediaExtensions(): RegExp {
    return this._allowedMediaExtensions;
  }

  get trAppVersion(): string {
    return this._trAppVersion;
  }

  get trTorrentId(): number {
    return this._trTorrentId;
  }

  get trTorrentName(): string {
    return this._trTorrentName;
  }

  get trTorrentDir(): string {
    return this._trTorrentDir;
  }

  get trTorrentHash(): string {
    return this._trTorrentHash;
  }

  get trTimeLocaltime(): string {
    return this._trTimeLocaltime;
  }

  get trTorrentLabels(): string {
    return this._trTorrentLabels;
  }

  get trTorrentBytesDownloaded(): number {
    return this._trTorrentBytesDownloaded;
  }

  get trTorrentTrackers(): string {
    return this._trTorrentTrackers;
  }

  private init(): void {
    const configFile: string = normalize(`${this._rootPath}/config.json`);
    this.nconf.env();
    this.nconf.file('config', configFile);
    this.nconf.file('package', normalize(`${this._rootPath}/package.json`));
    this.nconf.defaults({
      node_env: 'production',
      media_path: '/mnt/data/media',
      serials_root_dir: 'TV Shows',
      films_root_dir: 'Movies',
      log_level: 'info',
      log_file_path: '/var/log/transmission/torrentdone.log',
      date_format: 'dd.MM.yyyy_hh:mm:ss.SSS', // https://www.npmjs.com/package/date-format
      ip_address: '127.0.0.1',
      tcp_port: '9091',
      allowed_media_extensions: 'mkv,mp4,avi',
    });
    this.nconf.load();
    this.check();
  }

  /**
   * Check login or password not found.
   * Check transmission-daemon variables/parameters for start work
   * variables pass to Environment
   * transmission-daemon passes 7 variables to script / 9 for transmission-daemon 4.X.X
   * [More info](https://github.com/transmission/transmission/blob/4.0.0-beta.1/docs/Scripts.md)
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
   * !!! The hashed password from the transmission settings file is not suitable for requests via transmission-remote
   */
  check(): void {
    const login: string = this.getParam('login');
    const password: string = this.getParam('password');
    if (login === undefined || login === '' || password === undefined || password === '') {
      throw new Error('Login or password must be filled in config.json file or Environment');
    }
    const trAppVersion: string = this.getParam('TR_APP_VERSION');
    const trTorrentId = Number(this.getParam('TR_TORRENT_ID'));
    const trTorrentName: string = this.getParam('TR_TORRENT_NAME');
    const trTorrentDir: string = this.getParam('TR_TORRENT_DIR');
    const trTorrentHash: string = this.getParam('TR_TORRENT_HASH');
    const trTimeLocaltime: string = this.getParam('TR_TIME_LOCALTIME');
    if (
      trAppVersion === undefined ||
      Number.isNaN(trTorrentId) ||
      trTorrentDir === undefined ||
      trTorrentName === undefined ||
      trTorrentHash === undefined ||
      trTimeLocaltime === undefined
    ) {
      throw new Error(
        `One or more parameters do not match the requirements: TR_APP_VERSION - "${trAppVersion}", TR_TORRENT_ID - "${trTorrentId}", TR_TORRENT_DIR - "${trTorrentDir}", TR_TORRENT_NAME - "${trTorrentName}", TR_TORRENT_HASH - "${trTorrentHash}", TR_TIME_LOCALTIME - "${trTimeLocaltime}"`
      );
    }
  }

  /**
   * Determining the Project Root Path
   * @returns {string} application root path
   */
  private static getRootDir(): string {
    const filename: string = fileURLToPath(pathToFileURL(__filename).toString());
    const dir = dirname(filename);
    let currentDir: string = dir;
    while (!existsSync(join(currentDir, 'package.json'))) {
      currentDir = join(currentDir, '..');
    }
    return normalize(currentDir);
  }

  /**
   * Get parameter value
   * @param {string} param_name - config parameters name
   * @returns {string} parameter value
   */
  private getParam(param_name: string): string {
    // From config file. Example: login | log_level
    let param = this.nconf.get(param_name);
    // Else not found from config file, get from Environment (uppercase).
    // Example: LOGIN | LOG_LEVEL
    if (param === undefined) param = this.nconf.get(param_name.toUpperCase());
    return param;
  }

  /**
   * Format allowed media extensions list string to regexp
   * @param {string} allowed_media_extensions - allowed media extensions list
   * @returns {RegExp} formated list
   */
  private static extensionsRegexTemplate(allowed_media_extensions: string): RegExp {
    const extensionArray: string[] = allowed_media_extensions.split(',');
    let regexString = `.(`;
    if (extensionArray.length > 1) {
      for (let i = 0; i < extensionArray.length; i++) {
        if (Number(i) === 0) regexString += `${extensionArray[i]}|`;
        else if (Number(i) === extensionArray.length - 1) regexString += `|${extensionArray[i]}`;
        else regexString += extensionArray[i];
      }
    } else {
      regexString += extensionArray[0];
    }
    regexString += `)`;
    return new RegExp(regexString, 'i');
  }
}

export { Config };
