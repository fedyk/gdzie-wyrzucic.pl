import { config as dotenv } from "dotenv";

dotenv({ path: __dirname + "/../.env" })

interface Config {
  PORT: string | number;
  APP_KEYS: string;
  ELASTICSEARCH_URL: string;
}

if (!process.env.PORT) {
  console.warn("No port config. Set PORT environment variable(default is 3000).");
}

if (!process.env.APP_KEYS) {
  console.error("No keylist config. Set APP_KEYS environment variable. The format is <string_key1>;<string_key2>.");
}

if (!process.env.ELASTICSEARCH_URL) {
  console.error("No ELASTICSEARCH_URL param is passed. Search would not work");
}

export const config: Config = {
  PORT: process.env.PORT || 3000,
  APP_KEYS: process.env.APP_KEYS || "",
  ELASTICSEARCH_URL: process.env.ELASTICSEARCH_URL || ""
};
