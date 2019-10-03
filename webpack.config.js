const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { AppsignalPlugin } = require("@appsignal/webpack")

const config = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: 'babel-loader',
        exclude: /node_modules/
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin(),
    new AppsignalPlugin({
      apiKey: "<YOUR PUSH API KEY>",
      release: "<GIT COMMIT SHA>",
      appName: "<APP NAME ON APPSIGNAL.COM>",
      environment: "<CURRENT ENVIRONMENT>",
      urlRoot: "<HOST THAT JS FILE WILL BE SERVED FROM>"
    })
  ],
  devtool: "source-map"
}

module.exports = config;
