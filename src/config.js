var config;
if (process.env.NODE_ENV == "dev") {
    config = require("../../dev_config.json");
} else {
    config = require("../../live_config.json");

}
export default config;
