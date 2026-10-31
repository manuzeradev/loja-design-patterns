type LogLevel = "INFO" | "WARN" | "ERROR";

/** Padrão Singleton: uma única instância de log para toda a aplicação. */
export class Logger {
  private static instance: Logger | undefined;
  private readonly history: string[] = [];

  private constructor() {}

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  info(message: string): void {
    this.write("INFO", message);
  }

  warn(message: string): void {
    this.write("WARN", message);
  }

  error(message: string): void {
    this.write("ERROR", message);
  }

  getHistory(): readonly string[] {
    return this.history;
  }

  private write(level: LogLevel, message: string): void {
    const line = `[${level}] ${message}`;
    this.history.push(line);
    console.log(line);
  }
}