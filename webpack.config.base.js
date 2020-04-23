const path = require('path');

module.exports = {
  // Electronのレンダラプロセスで動作することを指定する
  target: 'electron-renderer',
  // 起点となるファイル
  entry: './ts/index.tsx',
  // 出力先設定 __dirname は node でのカレントディレクトリのパスが格納される変数
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'index.js',
  },
  // ファイルタイプ毎の処理を記述する
  module: {
    rules: [
      {
        // 正規表現で指定する
        // 拡張子 .ts または .tsx の場合
        test: /\.tsx?$/,
        // ローダーの指定
        // TypeScript をコンパイルする
        use: 'ts-loader',
      },
      {
        // 拡張子 .ts または .tsx の場合
        test: /\.tsx?$/,
        // 事前処理
        enforce: 'pre',
        // TypeScript をコードチェックする
        loader: 'tslint-loader',
        // 定義ファイル
        options: {
          configFile: './tslint.json',
          // airbnb というJavaScriptスタイルガイドに従うには下記が必要
          typeCheck: true,
        },
      },
    ],
  },
  // 処理対象のファイルを記載する
  resolve: {
    extensions: [
      '.ts',
      '.tsx',
      '.js', // node_modulesのライブラリ読み込みに必要
    ],
  },
};
