var config = require("../../live_config.json");
if (process.env.NODE_ENV == "dev") {
    config = require("../../dev_config.json");
}
export default config;
