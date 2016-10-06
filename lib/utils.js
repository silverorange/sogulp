const fs = require('fs');

module.exports = {
  deleteIfExists: function deleteIfExists(path) {
    if (fs.existsSync(path)) {
      fs.unlinkSync(path);
    }
  },
};
