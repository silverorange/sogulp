const gutil = require('gulp-util');
const execFile = require('child_process').execFile;
const q = require('q');

module.exports = {
  task: function classmapTask() {
    const deferred = q.defer();
    execFile(
      'composer',
      ['-q', 'dump-autoload'],
      (error) => {
        if (error !== null) {
          gutil.log(`exec error: ${error}`);
          deferred.reject(error);
        } else {
          deferred.resolve();
        }
      }
    );

    return deferred.promise;
  },
};
