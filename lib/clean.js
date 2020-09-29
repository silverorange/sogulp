const fs = require('fs');
const gutil = require('gulp-util');
const paths = require('./paths');
const flags = require('./flags');

function deleteFolderRecursive(path, progress) {
  let files = [];
  if (fs.existsSync(path)) {
    files = fs.readdirSync(path);
    files.forEach((file) => {
      const curPath = `${path}/${file}`;
      if (fs.lstatSync(curPath).isDirectory()) {
        deleteFolderRecursive(curPath, progress);
      } else {
        if (progress) {
          progress(curPath);
        }
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
}

function removeCompiled(error, progress, complete) {
  deleteFolderRecursive(paths.minified, progress);
  if (complete) {
    complete();
  }
}

function removeMinified(error, progress, complete) {
  deleteFolderRecursive(paths.compiled, progress);
  if (complete) {
    complete();
  }
}

function removeCombined(error, progress, complete) {
  // not implemented, need to parse YAML files
  if (complete) {
    complete();
  }
}

module.exports = {
  task: function cleanTask() {
    gutil.log(gutil.colors.blue('Removing minified files:'));
    removeMinified(
      null,
      (line) => gutil.log(gutil.colors.gray('..'), line),
      () => {
        gutil.log(gutil.colors.blue('Done'));
        gutil.log('');
      }
    );

    gutil.log(gutil.colors.blue('Removing compiled files:'));
    removeCompiled(
      null,
      (line) => gutil.log(gutil.colors.gray('..'), line),
      () => {
        gutil.log(gutil.colors.blue('Done'));
        gutil.log('');
      }
    );

    gutil.log(gutil.colors.blue('Removing combined files:'));
    removeCombined(
      null,
      (line) => gutil.log(gutil.colors.gray('..'), line),
      () => {
        gutil.log(gutil.colors.blue('Done'));
        gutil.log('');
      }
    );

    // delete flag files
    gutil.log(gutil.colors.blue('Removing flags:'));
    flags.remove(null, () => {
      gutil.log(gutil.colors.blue('Done'));
      gutil.log('');
    });
  },
};

// }}}
