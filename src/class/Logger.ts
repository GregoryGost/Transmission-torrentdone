import { createLogger, format, transports, Logger as winstonLogger } from 'winston';

interface NormalizedError {
  err: unknown; // Original error
  isError: boolean; // Is error instance?
  error?: Error; // Error object
  stack?: Error['stack']; // Call stack
  message: string; // Error message
  toString(): string;
}

interface AbstractConfigSetLevels {
  [key: string]: number;
}

interface AbstractConfigSetColors {
  [key: string]: string | string[];
}

interface AbstractConfigOption {
  levels: AbstractConfigSetLevels;
  colors: AbstractConfigSetColors;
}

const addColorsOption: AbstractConfigOption = {
  levels: {
    trace: 4,
    debug: 3,
    info: 2,
    warn: 1,
    error: 0,
  },
  colors: {
    trace: 'gray',
    debug: 'white',
    info: 'green',
    warn: 'yellow',
    error: 'red',
  },
};

class Logger {
  private logger: winstonLogger;
  private transportConsole: transports.ConsoleTransportInstance;
  private transportFile: transports.FileTransportInstance;

  constructor(log_level: string, log_file: string, date_format?: string) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const formatMeta = (meta: any) => {
      // You can format the splat yourself
      const splat = meta[Symbol.for('splat')];
      if (splat[0] !== undefined && splat.length > 0) {
        return splat.length === 1 ? ` - [${JSON.stringify(splat[0])}]` : ` - [${JSON.stringify(splat)}]`;
      }
      return '';
    };
    const formatter = format.combine(
      // format.colorize(),
      format.timestamp({ format: date_format ? date_format : 'DD.MM.YYYY HH:mm:ss' }),
      format.printf(info => {
        const { level, message, timestamp, ...meta } = info;
        return `[${timestamp}] : [${level}] : ${message}` + `${formatMeta(meta)}`;
      })
    );
    this.transportConsole = new transports.Console({
      format: formatter,
    });
    this.transportFile = new transports.File({
      filename: log_file,
      format: formatter,
      // Log files rotate in logrotate.d
      // maxsize: 1024 * 1024, // 1Mb
      // maxFiles: 5,
    });
    this.logger = createLogger({
      level: log_level,
      levels: addColorsOption.levels,
      transports: [this.transportConsole, this.transportFile],
    });
    // addColors(addColorsOption.colors);
  }

  public trace(msg: string, meta?: unknown): void {
    this.logger.log('trace', msg, meta);
  }

  public debug(msg: string, meta?: unknown): void {
    this.logger.debug(msg, meta);
  }

  public info(msg: string, meta?: unknown): void {
    this.logger.info(msg, meta);
  }

  public warn(msg: string, meta?: unknown): void {
    this.logger.warn(msg, meta);
  }

  public error(msg: string, meta?: unknown): void {
    this.logger.error(msg, meta);
  }

  public normalizeError(err: unknown): Readonly<NormalizedError> {
    const result: NormalizedError = {
      err,
      message: '',
      isError: false,
      toString() {
        // for typeof err === string
        return this.message;
      },
    };
    if (err instanceof TypeError) {
      result.error = err;
      result.message = err.message;
      result.stack = err.stack;
      result.isError = true;
      result.toString = () => err.toString();
    } else if (typeof err === 'string') {
      result.error = new Error(err);
      result.message = err;
      result.stack = result.error.stack;
    } else if (err instanceof Error) {
      result.error = err;
      result.message = err.message;
      result.stack = err.stack;
      result.isError = true;
      result.toString = () => err.toString();
    } else {
      // typeof = object, function (any more?)
      this.error(`UNKNOWN ERROR TYPE: ${typeof err}`);
    }
    return result;
  }
}

export { Logger };
