import Proxy from "objectum-proxy";
import fs from "fs";
import {fileURLToPath} from "url";
import {dirname} from "path";

const __filename = fileURLToPath (import.meta.url);
const __dirname = dirname (__filename);
const config = JSON.parse (fs.readFileSync ("./config.json", "utf8"));
const proxy = new Proxy ();

proxy.registerAdminMethods (
	proxy.getOfficeMethods ({role: "user", smtp: config.smtp, secret: config.secret, secretKey: config.secretKey})
);
proxy.start ({config, path: "/api", __dirname});
		