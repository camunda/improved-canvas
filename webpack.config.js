const path = require('path');

module.exports = {
  mode: 'development',
  entry: './app.js',
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: 'app.js',
  },
  module: {
    rules: [
      {
        test: /\.bpmn$/i,
        use: 'raw-loader',
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [ 'babel-loader' ],
      },
      {
        test: /\.css$/i,
        use: [ 'style-loader', 'css-loader' ],
      }
    ]
  }
};