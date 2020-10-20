const fancyLog = require('fancy-log');

module.exports = function log(...message) {
  return async () => fancyLog(...message);
};
