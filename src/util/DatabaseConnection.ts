import mysql, { Connection, ConnectionConfig, FieldInfo, MysqlError } from "mysql";

/**
 *
 */
export class DatabaseConnection {
  private static _instance: DatabaseConnection;
  private _connection: Connection;

  readonly _host: string;
  readonly _user: string;
  readonly _password: string;
  readonly _database: string;

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
  // TODO: error handling
  private connect(): void {
    this._connection = mysql.createConnection({host: this._host, user: this._user, password: this._password, database: this._database});

    this._connection.connect((err: MysqlError) => {
      if (err) {
        throw err;
      }
      console.log("Connected to database");
    });
  }

  /**
   *
   */
  // TODO:
  private disconnect(): void {
    this._connection.end((err: MysqlError) => {
      console.log(err);
    });
  }

  /**
   * return instance
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

}
