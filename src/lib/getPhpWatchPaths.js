const { constants: fsConstants, promises: fs } = require('fs');
const path = require('path');
const paths = require('./paths');

/**
 * @param {string[]} pathsToTest
 */
async function getExistingPaths(pathsToTest) {
  const exists = await Promise.all(
    pathsToTest.map(async (pathToTest) => {
      try {
        // eslint-disable-next-line no-bitwise
        await fs.access(pathToTest, fsConstants.R_OK | fsConstants.X_OK);
        return true;
      } catch (e) {
        return false;
      }
    })
  );

  return pathsToTest.filter((_, index) => exists[index]);
}

/**
 * @param {string[]} pathsToTest
 */
async function getSymlinkPaths(pathsToTest) {
  const stats = await Promise.all(pathsToTest.map(fs.lstat));
  return pathsToTest.filter((_, index) => stats[index].isSymbolicLink());
}

/**
 * Chokidar can't glob symlink directories properly so explicitly list
 * each directory instead.
 */
module.exports = async function getPhpWatchPaths() {
  const vendorPaths = await getExistingPaths(paths.vendors);
  const symlinkPaths = [].concat(
    ...(await Promise.all(
      vendorPaths.map(async (vendorPath) =>
        getSymlinkPaths(
          (await fs.readdir(vendorPath)).map((dir) =>
            path.join(vendorPath, dir)
          )
        )
      )
    ))
  );

  return [...paths.php, ...symlinkPaths];
};
