const log = require('fancy-log');
const execFile = require('child_process').execFile;

module.exports = {
  task: function classmapTask() {
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
  },
};
