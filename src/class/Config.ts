/**
 * Config class
 * Basic configuration parameters
 */
class Config {
  /**
   * Path to root application dir
   */
  public readonly rootPath: string = process.cwd();
  /**
   * Development mode status
   * if development = true
   * Default: development
   */
  public readonly devmode: boolean;
  /**
   * Log level
   * if devmode(true) = trace
   * trace | debug | info | warn | error
   * Default: info
   */
  public readonly logLevel: string;
  /**
   * Log date and time format (winston)
   * Default DD.MM.YYYY HH:mm:ss
   */
  public readonly logDateFormat: string;
  //
  // TRANSMISSION SETTINGS
  //
  /**
   * Torrent done log file path
   * Default: /var/log/transmission/torrentdone.log
   */
  public readonly logFilePath: string;
  /**
   * Transmission-daemon IP Address
   * Default: 127.0.0.1 (localhost)
   */
  public readonly ipAddress: string;
  /**
   * Transmission-daemon TCP Port
   * Default: 9091
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
   * Allowed extensions for media files
   * Default: mkv, mp4, avi
   */
  public readonly allowedMediaExtensions: RegExp;

  constructor(
    login: string | undefined,
    password: string | undefined,
    node_env = 'production',
    media_path = '/mnt/data/media',
    allowed_media_extensions = 'mkv,mp4,avi',
    log_level = 'info',
    log_file_path = '/var/log/transmission/torrentdone.log',
    log_date_format = 'DD.MM.YYYY HH:mm:ss',
    ip_address = '127.0.0.1',
    tcp_port = '9091'
  ) {
    Config.check(login, password);
    this.devmode = node_env === 'development';
    this.logLevel = this.devmode ? 'trace' : log_level;
    this.logDateFormat = log_date_format;
    this.logFilePath = log_file_path;
    this.ipAddress = ip_address;
    this.port = Number(tcp_port);
    this.login = login;
    this.password = password;
    this.mediaPath = this.devmode ? this.rootPath + '/tests/mnt/data/media' : media_path;
    this.allowedMediaExtensions = Config.extensionsRegexTemplate(allowed_media_extensions);
  }

  private static check(login: string | undefined, password: string | undefined): void {
    if (login === undefined || password === undefined) {
      throw new Error('Login or password must be filled (Environment)');
    }
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
