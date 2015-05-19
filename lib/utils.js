'use strict';

var fs = require('fs');
var flags = require('./flags');
var symlinks = require('./symlinks');

module.exports {
	deleteIfExists: function (path) {
		if (fs.existsSync(path)) {
			fs.unlinkSync(path);
		}
	}
};
