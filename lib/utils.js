'use strict';

var fs = require('fs');

module.exports = {
  deleteIfExists: function (path) {
    if (fs.existsSync(path)) {
      fs.unlinkSync(path);
    }
  }
};
