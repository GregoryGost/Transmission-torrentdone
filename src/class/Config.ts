import { normalize, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import nconf from 'nconf';

/**
 * Config class
 * Basic configuration parameters
 */
class Config {
  /**
   * Path to root application dir
   */
  public readonly rootPath: string = normalize(join(dirname(fileURLToPath(import.meta.url)), '../..'));
  /**
   * Nconf implements
   */
  public readonly nconf: typeof nconf = nconf;
  /**
   * Development mode status
   * if development = true
   * Default: development
   */
  public readonly devmode: boolean;
  /**
   * This Application version
   * Read from base file package.json
   */
  public readonly appVersion: string;
  /**
   * Log level.
   * if devmode(true) = `trace`.
   * Variants: (`trace` | `debug` | `info` | `warn` | `error`).
   * Default: `info`
   */
  public readonly logLevel: string;
  /**
   * Date and time format. Used in winston and application.
   * Formatted string accepted by the [fecha](https://github.com/taylorhakes/fecha) module.
   * Default: `DD.MM.YYYY HH:mm:ss`
   */
  public readonly dateFormat: string;
  //
  // TRANSMISSION SETTINGS
  //
  /**
   * Torrent done log file path.
   * Default: `/var/log/transmission/torrentdone.log`
   */
  public readonly logFilePath: string;
  /**
   * Transmission-daemon IP Address.
   * Default: `127.0.0.1` (localhost)
   */
  public readonly ipAddress: string;
  /**
   * Transmission-daemon TCP Port.
   * Default: `9091`
   */
  public readonly port: number;
  /**
   * Transmission-daemon access login
   */
  public readonly login: string | undefined;
  /**
   * Transmission-daemon access password
   */
  public readonly password: string | undefined;
  /**
   * Path to move and copy movie and series files
   */
  public readonly mediaPath: string;
  /**
   * The name of the directory where TV shows will be saved
   */
  public readonly serialsRootDir: string;
  /**
   * The name of the directory where the movies will be saved
   */
  public readonly filmsRootDir: string;
  /**
   * Allowed extensions for media files.
   * Default: `mkv,mp4,avi`
   */
  public readonly allowedMediaExtensions: RegExp;
  /**
   * Transmission-daemon version.
   * Example: `3.00`
   */
  public readonly trAppVersion: string;
  /**
   * Torrent identificator (simple number).
   * Example: `999`
   */
  public readonly trTorrentId: number;
  /**
   * Torrent name (like at view in Transmission Remote GUI interface)
   */
  public readonly trTorrentName: string;
  /**
   * Now torrent directory.
   * Example: `/mnt/data/downloads`
   */
  public readonly trTorrentDir: string;
  /**
   * Now torrent hash.
   * Example: `149f78bfd91fa7e91856b456d6fee59202bfcec0`
   */
  public readonly trTorrentHash: string;
  /**
   * Date and time torrentdone script start.
   * Example: `Fri Nov  4 20:23:27 2022`
   */
  public readonly trTimeLocaltime: string;
  /**
   * A comma-delimited list of the torrent's labels.
   * Example: `foo,bar,baz` ???
   */
  public readonly trTorrentLabels: string;
  /**
   * ONLY FOR TRANSMISSION >= 4.0.0.
   * Number of bytes that were downloaded for this torrent.
   * Example: `123456789` ???
   */
  public readonly trTorrentBytesDownloaded: number;
  /**
   * A comma-delimited list of the torrent's trackers' announce URLs.
   * Example: `https://foo.com,https://bar.org,https://baz.com` ???
   */
  public readonly trTorrentTrackers: string;

  constructor(config_file_path?: string) {
    this.init(config_file_path);
    this.login = this.getParam('login');
    this.password = this.getParam('password');
    this.devmode = this.getParam('node_env') === 'development';
    this.appVersion = this.getParam('version');
    this.logLevel = this.devmode ? 'trace' : this.getParam('log_level');
    this.dateFormat = this.getParam('date_format');
    this.logFilePath = this.getParam('log_file_path');
    this.ipAddress = this.getParam('ip_address');
    this.port = Number(this.getParam('tcp_port'));
    this.allowedMediaExtensions = Config.extensionsRegexTemplate(this.getParam('allowed_media_extensions'));
    this.mediaPath = this.devmode ? normalize(`${this.rootPath}/tests/mnt/data/media`) : this.getParam('media_path');
    this.serialsRootDir = this.getParam('serials_root_dir');
    this.filmsRootDir = this.getParam('films_root_dir');
    // Transmission Environment
    this.trAppVersion = this.getParam('TR_APP_VERSION');
    this.trTorrentId = Number(this.getParam('TR_TORRENT_ID'));
    this.trTorrentName = this.getParam('TR_TORRENT_NAME');
    this.trTorrentDir = this.getParam('TR_TORRENT_DIR');
    this.trTorrentHash = this.getParam('TR_TORRENT_HASH');
    this.trTimeLocaltime = this.getParam('TR_TIME_LOCALTIME');
    this.trTorrentLabels = this.getParam('TR_TORRENT_LABELS');
    this.trTorrentBytesDownloaded = Number(this.getParam('TR_TORRENT_BYTES_DOWNLOADED'));
    this.trTorrentTrackers = this.getParam('TR_TORRENT_TRACKERS');
  }

  private init(config_file_path?: string): void {
    let configFile: string = normalize(`${this.rootPath}/config.json`);
    if (config_file_path !== undefined) configFile = normalize(config_file_path);
    this.nconf.env();
    this.nconf.file('config', configFile);
    this.nconf.file('package', normalize(`${this.rootPath}/package.json`));
    this.nconf.defaults({
      node_env: 'production',
      media_path: '/mnt/data/media',
      serials_root_dir: 'TV Shows',
      films_root_dir: 'Movies',
      log_level: 'info',
      log_file_path: '/var/log/transmission/torrentdone.log',
      date_format: 'DD.MM.YYYY HH:mm:ss',
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
  private check(): void {
    const login: string = this.getParam('login');
    const password: string = this.getParam('password');
    if (login === undefined || password === undefined) {
      throw new Error('Login or password must be filled in config,json file or Environment');
    }
    const trAppVersion: string = this.getParam('TR_APP_VERSION');
    const trTorrentId = Number(this.getParam('TR_TORRENT_ID'));
    const trTorrentName: string = this.getParam('TR_TORRENT_NAME');
    const trTorrentDir: string = this.getParam('TR_TORRENT_DIR');
    const trTorrentHash: string = this.getParam('TR_TORRENT_HASH');
    const trTimeLocaltime: string = this.getParam('TR_TIME_LOCALTIME');
    if (
      trAppVersion === undefined ||
      trTorrentId === NaN ||
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

  private getParam(param_name: string): string {
    // From config file. Example: login | log_level
    let param = this.nconf.get(param_name);
    // Else not found from config file, get from Environment (uppercase).
    // Example: LOGIN | LOG_LEVEL
    if (param === undefined) param = this.nconf.get(param_name.toUpperCase());
    return param;
  }

  private static extensionsRegexTemplate(allowed_media_extensions: string): RegExp {
    const extensionArray: string[] = allowed_media_extensions.split(',');
    let regexString = `\.(`;
    if (extensionArray.length > 1) {
      for (const i in extensionArray) {
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
