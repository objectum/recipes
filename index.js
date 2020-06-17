import Proxy from "objectum-proxy";
import fs from "fs";
import {fileURLToPath} from "url";
import {dirname} from "path";

const __filename = fileURLToPath (import.meta.url);
const __dirname = dirname (__filename);
const config = JSON.parse (fs.readFileSync ("./config.json", "utf8"));
const proxy = new Proxy ();

proxy.registerAdminMethods (
	proxy.getOfficeMethods ({role: "user", smtp: config.smtp, secret: "secret01", secretKey: "6LffszoUAAAAACm8E2qHoQFgGU4kuw0Ynypi9tkE"})
);
proxy.start ({config, path: "/api", __dirname});
		