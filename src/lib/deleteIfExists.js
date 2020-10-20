const { constants: fsConstants, promises: fs } = require('fs');

module.exports = async function deleteIfExists(path) {
  try {
    // eslint-disable-next-line no-bitwise
    await fs.access(path, fsConstants.R_OK | fsConstants.W_OK);
    await fs.unlink(path);
  } catch (e) {
    // Ignore file that does not exist or can not be deleted.
  }
};
