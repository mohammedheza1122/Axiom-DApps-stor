const path = require('path');
const webpack = require('webpack');
const defaultConfig = require('./node_modules/@wordpress/scripts/config/webpack.config.js');

const env = process.env.NODE_ENV || 'production';

let HEADLINES_APP_URL = '';
let HEADLINES_API_URL = '';
let debug = false; // enables/disables verbose logging for message bus

if (env === 'development') {
  HEADLINES_APP_URL = 'http://local.coschedule.com:4200';
  HEADLINES_API_URL = 'http://localhost:8081';
  debug = true;
} else if (env === 'staging') {
  HEADLINES_APP_URL = 'https://staging-headlines.coschedule.com';
  HEADLINES_API_URL = 'https://staging-headlines-api.coschedule.com';
  debug = true;
} else if (env === 'production') {
  HEADLINES_APP_URL = 'https://headlines.coschedule.com';
  HEADLINES_API_URL = 'https://headlines-api.coschedule.com';
  debug = false;
} else {
  HEADLINES_APP_URL = 'https://headlines.coschedule.com';
  HEADLINES_API_URL = 'https://headlines-api.coschedule.com';
  debug = false;
}

module.exports = {
  ...defaultConfig,
  entry: {
    ...defaultConfig.entry,
    classic: path.resolve(process.cwd(), 'src', 'classicEditor.js'),
  },
  plugins: [
    ...defaultConfig.plugins,
    new webpack.DefinePlugin({
      HEADLINES_APP_URL: JSON.stringify(HEADLINES_APP_URL),
      HEADLINES_API_URL: JSON.stringify(HEADLINES_API_URL),
      DEBUG: JSON.stringify(debug),
    }),
  ],
};
