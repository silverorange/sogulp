const fs = require('fs');
const log = require('fancy-log');
const colors = require('ansi-colors');
const paths = require('../lib/paths');
const removeFlags = require('./removeFlags');

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

module.exports = async function clean() {
  log(colors.blue('Removing minified files:'));
  removeMinified(
    null,
    (line) => log(colors.gray('..'), line),
    () => {
      log(colors.blue('Done'));
      log('');
    }
  );

  log(colors.blue('Removing compiled files:'));
  removeCompiled(
    null,
    (line) => log(colors.gray('..'), line),
    () => {
      log(colors.blue('Done'));
      log('');
    }
  );

  log(colors.blue('Removing combined files:'));
  removeCombined(
    null,
    (line) => log(colors.gray('..'), line),
    () => {
      log(colors.blue('Done'));
      log('');
    }
  );

  // delete flag files
  log(colors.blue('Removing flags:'));
  await removeFlags(null, () => {
    log(colors.blue('Done'));
    log('');
  });
};
