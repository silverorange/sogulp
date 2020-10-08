const paths = require('./paths');
const phplintStream = require('./phplintStream');

module.exports = async function phplint() {
  return phplintStream(paths.php);
};
