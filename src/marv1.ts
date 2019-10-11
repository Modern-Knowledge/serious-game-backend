import { User } from "./lib/models/User";

const marv = require("marv/api/promise"); // <-- Promise API
const driver = require("marv-mysql-driver");
import * as path from "path";

async function migration() {
    console.log("marv");
    const directory = path.resolve("migrations");

    const options = {

        table: "migrations",

        connection: {
            host: "172.17.0.3",
            port: 3306,
            database: "serious-game",
            user: "root",
            password: "123456"
        }
    };

    const migrations = await marv.scan(directory);
    await marv.migrate(migrations, driver(options));
}

migration().then(value => {
    "migrated";
});

const u = new User();

export { u };