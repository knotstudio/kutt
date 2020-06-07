const createServer = require("next").default;

const getApp = ({ isDev }) =>
  createServer({
    dir: __dirname,
    dev: isDev
  });

module.exports = { getApp };
