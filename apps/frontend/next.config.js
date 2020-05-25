const { parsed: localEnv } = require("dotenv").config();
const webpack = require("webpack");

module.exports = {
  target: "server",
  distDir: "dist",
  webpack(config) {
    config.plugins.push(new webpack.EnvironmentPlugin(localEnv));

    return config;
  }
};
