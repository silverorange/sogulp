const fs = require('fs/promises');

module.exports = async function deleteIfExists(path) {
  if (await fs.exists(path)) {
    await fs.unlink(path);
  }
};
