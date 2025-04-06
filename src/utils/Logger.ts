import winston from "winston";

class Logger {
  private className: string;
  private logger: winston.Logger;

  constructor(className: string) {
    this.className = className;
    this.logger = winston.createLogger({
      level: "info",
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(
          ({ timestamp, level, message, methodName, data }) => {
            return `${timestamp} [${level}] [${this.className}] -- [${
              methodName ?? ""
            }] -- ${message} -- ${data ?? ""}`;
          }
        )
      ),
      transports: [new winston.transports.Console()],
    });
  }

  public info(message: string, methodName?: string, data?: string): void {
    this.logger.info(message, { methodName, data });
  }

  public warn(message: string, methodName?: string, data?: string): void {
    this.logger.warn(message, { methodName, data });
  }

  public error(message: string, methodName?: string, data?: string): void {
    this.logger.error(message, { methodName, data });
  }

  public debug(message: string, methodName?: string, data?: string): void {
    this.logger.debug(message, { methodName, data });
  }
}

export default Logger;
