'use strict';

var gutil = require('gulp-util');
var execFile = require('child_process').execFile;
var q = require('q');

module.exports = {
  task: function() {
    var deferred = q.defer();
    execFile(
      'composer',
      ['-q', 'dump-autoload'],
      function (error) {
        if (error !== null) {
          gutil.log('exec error: ' + error);
          deferred.reject(error);
        } else {
          deferred.resolve();
        }
      }
    );

    return deferred.promise;
  }
};
