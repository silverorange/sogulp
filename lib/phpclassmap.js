const gutil = require('gulp-util');
const execFile = require('child_process').execFile;

module.exports = {
  task: function classmapTask() {
    return new Promise((resolve, reject) => {
      execFile('composer', ['-q', 'dump-autoload'], (error) => {
        if (error !== null) {
          gutil.log(`exec error: ${error}`);
          reject(error);
        } else {
          resolve();
        }
      });
    });
  },
};
