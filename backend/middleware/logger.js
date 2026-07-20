/**
 * Logger middleware
 * Logs every incoming request
 */
module.exports = async function logger(req, res) {
  console.log(`[${req.method}] ${req.url}`);

  return true;
};
