const fs = require('fs');

module.exports = function deleteIfExists(path) {
  if (fs.existsSync(path)) {
    fs.unlinkSync(path);
  }
};
