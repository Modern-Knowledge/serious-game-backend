import mysql, { Connection, ConnectionConfig, MysqlError } from "mysql";

/**
 *
 */
export class DatabaseConnection {
  private static _instance: DatabaseConnection;
  private connection: Connection;

  readonly host: string;
  readonly user: string;
  readonly password: string;
  readonly database: string;

  /**
   * @param host
   * @param user
   * @param password
   * @param database
   */
  private constructor(host: string, user: string, password: string, database: string) {
    this.host = host;
    this.user = user;
    this.password = password;
    this.database = database;

    this.connect();
  }

  /**
   * establish connection to database
   */
  // TODO: error handling
  private connect(): void {
    this.connection = mysql.createConnection({host: this.host, user: this.user, password: this.password, database: this.password});

    this.connection.connect((err: MysqlError) => {
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
    this.connection.end((err: MysqlError) => {
      console.log(err);
    });
  }

  /**
   *
   * @param sql
   */
  public query(sql: string) {
    this.connection.query(sql, (err, result) => {
      console.log(result[0].username);
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
}
