import { config as dotenvConfig } from "dotenv";

dotenvConfig()

interface Config {
  PORT: string | number;
  APP_KEYS: string;
  ELASTIC_SEARCH: string;
}

if (!process.env.PORT) {
  console.warn("No port config. Set PORT environment variable(default is 3000).");
}

if (!process.env.APP_KEYS) {
  console.error("No keylist config. Set APP_KEYS environment variable. The format is <string_key1>;<string_key2>.");
}

if (!process.env.ELASTIC_SEARCH) {
  console.error("No ELASTIC_SEARCH param is passed. Search would not work");
}

export const config: Config = {
  PORT: process.env.PORT || 3000,
  APP_KEYS: process.env.APP_KEYS || "",
  ELASTIC_SEARCH: process.env.ELASTIC_SEARCH
};
