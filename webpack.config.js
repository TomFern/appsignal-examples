const webpack = require("webpack");
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { AppsignalPlugin } = require("@appsignal/webpack");
const Dotenv = require("dotenv-webpack");

require("dotenv").config();

const config = {
  entry: "./src/index.js",
  output: {
    path: path.resolve(__dirname, "public"),
    filename: "bundle.js"
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: "babel-loader",
        exclude: /node_modules/
      }
    ]
  },
  plugins: [
    new Dotenv(),
    new HtmlWebpackPlugin(),
    new AppsignalPlugin({
      apiKey: process.env["APPSIGNAL_PUSH_API_KEY"],
      release: process.env["APPSIGNAL_REVISION_SHA"],
      appName: process.env["APPSIGNAL_APP_NAME"],
      environment: process.env["APPSIGNAL_ENVIRONMENT"],
      urlRoot: process.env["APPSIGNAL_URL_ROOT"]
    })
  ],
  devtool: "source-map"
};

module.exports = config;
