const gulp = require('gulp');
const log = require('fancy-log');
const colors = require('ansi-colors');
const gulpSpawn = require('gulp-spawn');
const Stream = require('stream');
const paths = require('./paths');

function spawn() {
  return gulpSpawn({
    cmd: 'php',
    args: ['-l'],
  });
}

function filter(error, err) {
  const filteredStream = new Stream.PassThrough({ objectMode: true });

  function transform(file, unused, done) {
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
      if (!/^No syntax errors detected in -/.test(contents)) {
        // remove stdin filename
        contents = contents.replace(/in - on line/, 'on line');

        // remove unnecessary line
        contents = contents.replace(/\s+Errors parsing -$/g, '');

        if (err) {
          err(filename, contents);
        }
      }
    }

    this.push(file);
    done();
  }

  filteredStream._transform = transform; // eslint-disable-line no-underscore-dangle

  return filteredStream;
}

function stream(streamedPaths) {
  return gulp
    .src(streamedPaths, { cwdbase: true, buffer: true })
    .pipe(spawn())
    .pipe(
      filter(null, (filename, contents) => {
        log(colors.red('[PHP]'), filename, '->', contents);
      })
    );
}

module.exports = {
  task: function phplintTask() {
    return stream(paths.php);
  },
  stream,
};
