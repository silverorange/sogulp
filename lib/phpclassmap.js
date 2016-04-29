'use strict';

var gutil = require('gulp-util');
var execFile = require('child_process').execFile;

module.exports = {
  task: function() {
    execFile(
      'composer',
      ['-q', 'dump-autoload'],
      function (error) {
        if (error !== null) {
          gutil.log('exec error: ' + error);
        }
      }
    );
  }
};
