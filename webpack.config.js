const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const RemovePlugin = require('remove-files-webpack-plugin');
const BrowserSyncPlugin = require('browser-sync-webpack-plugin');
module.exports = {
  mode: 'production', // Change to 'production' for production build
  entry: path.resolve(__dirname, 'sass', 'styles.sass'), // Update this to the path to your actual Sass file
  output: {
    filename: 'remove-me.js', // This JS file will be removed
    path: path.resolve(__dirname), // Output directory
  },
  resolve: {
    extensions: ['.sass'], // Explicitly set the file extensions to resolve
  },
  module: {
    rules: [
      {
        test: /\.sass$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: [
                  require('@hail2u/css-mqpacker')() // consolidate media queries
                ],
              },
            },
          },
          'sass-loader'
        ],
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'style/styles.css', // Output CSS file
    }),
    new RemovePlugin({
      before: {
        include: [
          './remove-me.js', // Remove this file
        ],
      },
      watch: {
        include: [
          './remove-me.js', // Remove this file during watch
        ],
      },
    }),
    new BrowserSyncPlugin({
      host: 'localhost',
      port: 3000,
      server: { baseDir: ['./'] }
    }),
  ],
};
