const gulp = require('gulp');
const log = require('fancy-log');
const colors = require('ansi-colors');
const gulpSpawn = require('gulp-spawn');
const Stream = require('stream');

function spawn() {
  return gulpSpawn({
    cmd: 'php',
    args: ['-l'],
  });
}

function filter(error, err) {
  return new Stream.PassThrough({
    objectMode: true,
    transform: function transform(file, unused, done) {
      if (file.isNull()) {
        this.push(file);
        done();
        return;
      }

      if (file.isBuffer()) {
        // remove whitespace
        const filename = file.path.substr(file.base.length + 1);
        let contents = file.contents.toString().replace(/(^\s+|\s+$)/g, '');

        // exclude valid files from output
        if (
          !/^No syntax errors detected in Standard input code/.test(contents)
        ) {
          // remove stdin filename
          contents = contents.replace(
            /in Standard input code on line/,
            'on line'
          );

          // remove unnecessary line
          contents = contents.replace(
            /\s+Errors parsing Standard input code$/g,
            ''
          );

          if (err) {
            err(filename, contents);
          }
        }
      }

      this.push(file);
      done();
    },
  });
}

module.exports = function phplintStream(streamedPaths) {
  return gulp
    .src(streamedPaths, { cwdbase: true, buffer: true })
    .pipe(spawn())
    .pipe(
      filter(null, (filename, contents) => {
        log(colors.red('[PHP]'), filename, '->', contents);
      })
    );
};
