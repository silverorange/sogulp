const log = require('fancy-log');
const childProcess = require('child_process');

const { execFile } = childProcess;

module.exports = function phpclassmap() {
  return new Promise((resolve, reject) => {
    execFile('composer', ['-q', 'dump-autoload'], (error) => {
      if (error !== null) {
        log(`exec error: ${error}`);
        reject(error);
      } else {
        resolve();
      }
    });
  });
};
