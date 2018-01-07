var fs = require('fs');

var STAGING_API = "AIzaSyB_w_sx6mMUQil5nWhn0sd5CjgOtDFGICw";
var STAGING_DATABASE = 'treesradio-live';
var API_KEY_FILE = '.fbaseapi';

module.exports = {
  getWebpackDefine: function(NODE_ENV) {
    var database = process.argv[2] || STAGING_DATABASE;
    var api_key = STAGING_API;
    var using_staging = database === STAGING_DATABASE;

    if (!using_staging && process.env.FBASE_API) { //best for ci
      api_key = process.env.FBASE_API;
    } else if (!using_staging && fs.existsSync(API_KEY_FILE)) { //best for local dev
      api_key = fs.readFileSync(API_KEY_FILE, 'utf8');
    } else if (!using_staging) {
      throw "You're using a custom database ("+database+") but you didn't provide an API key! Please create a file named "+API_KEY_FILE+" that includes your key.";
    }

    return {
      'process.env.NODE_ENV': JSON.stringify(NODE_ENV),
      'process.env.FBASE': JSON.stringify(database),
      'process.env.FBASE_API': JSON.stringify(api_key)
    };
  }
};
