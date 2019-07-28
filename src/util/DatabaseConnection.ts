import mysql, { Connection, MysqlError } from "mysql";
import logger from "./logger";
import { Helper } from "./Helper";
import moment from "moment";

/**
 * handles database connection and database interaction
 */
export class DatabaseConnection {
  private static _instance: DatabaseConnection;
  private _connection: Connection;

  private readonly _host: string;
  private readonly _user: string;
  private readonly _password: string;
  private readonly _database: string;

  /**
   * @param host
   * @param user
   * @param password
   * @param database
   */
  private constructor(host: string, user: string, password: string, database: string) {
    this._host = host;
    this._user = user;
    this._password = password;
    this._database = database;

    this.connect();
  }

  /**
   * establish connection to database
   */
  private connect(): void {
    this._connection = mysql.createConnection({host: this._host, user: this._user, password: this._password, database: this._database});
    this._connection.connect((err: MysqlError) => {
      if (err) {
        logger.error(`${Helper.loggerString(__dirname, DatabaseConnection.name, "connect")} ${err} ${this}`);
        throw err;
      } else {
        logger.info(`${Helper.loggerString(__dirname, DatabaseConnection.name, "connect")} Connected to database! ${this}`);
      }
    });
  }

  /**
   * disconnects from database
   */
  private disconnect(): void {
    this._connection.end((err: MysqlError) => {
      if (err) {
        logger.error(`${Helper.loggerString(__dirname, DatabaseConnection.name, "disconnect")} ${err} ${this}`);
        throw err;
      } else {
        logger.info(`${Helper.loggerString(__dirname, DatabaseConnection.name, "disconnect")} Disconnected from database! ${this}`);
      }
    });
  }

  /**
   * pings server
   */
  public ping(): string {
    this._connection.ping((err: MysqlError) => {
      if (err) {
        logger.error(`${Helper.loggerString(__dirname, DatabaseConnection.name, "ping")} ${err} ${this}`);
        throw err;
      } else {
        logger.info(`${Helper.loggerString(__dirname, DatabaseConnection.name, "ping")} Ping to ${this} was successful!`);
      }
    });

    return `Ping at ${moment().format("LLL")} to ${this} was successful!`;
  }

  /**
   * returns instance
   */
  public static getInstance(): DatabaseConnection {
    if (DatabaseConnection._instance == undefined) {
      DatabaseConnection._instance = new DatabaseConnection(process.env.DB_HOST, process.env.DB_USER, process.env.DB_PASS, process.env.DB_DATABASE);
    }

    return this._instance;
  }

  get connection(): Connection {
    return this._connection;
  }

  public toString(): string {
    return `{host: ${this._host}, database: ${this._database}, user: ${this._user}}`;
  }

}
