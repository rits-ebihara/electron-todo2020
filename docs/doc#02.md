- [1 日目](https://qiita.com/EBIHARA_kenji/items/25e59f7132b96cb886f3)
- 2 日目（この記事）
- [3 日目](https://qiita.com/EBIHARA_kenji/items/1a043794014dc2f3a7db)
- [4 日目](https://qiita.com/EBIHARA_kenji/items/80adee2214d439209f98)
- [5 日目](https://qiita.com/EBIHARA_kenji/items/6da1cebb65a18279d096)
- [6 日目](https://qiita.com/EBIHARA_kenji/items/26fa0d004cbaeea807e4)
- [7 日目](https://qiita.com/EBIHARA_kenji/items/19b13207b7a8055043c4)
- [8 日目](https://qiita.com/EBIHARA_kenji/items/41552d664e7a72d867e3)

## 概要

前回は、npm プロジェクトと主要なライブラリのインストールを行いました。

今回は、各ツールの定義ファイルの作成と、Electron アプリの最小限の構成で、一応動作するところまで作ります。

## TypeScript コンパイラ・オプションファイルの作成

TypeScript のコンパイル・オプションは多数あるので、コンパイル・コマンドで引数を指定するよりも、ファイルで定義したほうが効率的です。

ファイル名は、`tsconfig.json`とします。

ファイルを一から作ることもできますが、下記コマンドで作成することもでき、オプションがコメントで全て記述されているので、オプションの on/off が楽です。

> 通常 JSON ファイルはコメントの記述はできないのですが、この JSON ファイルは特別なルールが適用されるようです。

```bash
$ npx tsc --init
# or
$ yarn tsc --init
```

いくつかのコメントアウトを外し、下記になるようにしてください。(コメントを付けていないところのみ掲載しています)

また、"include"属性も追加します。これは、コンパイル対象のファイルを指定するものです。

```json:tsconfig.json
{
  "compilerOptions": {
    "target": "es2020", // Webpack で ES5に変換されるのでここでは最新の仕様
    "module": "commonjs",
    "jsx": "react",
    "sourceMap": true,
    "outDir": "./dist", // Webpack で出力先は指定するが、念の為・・・
    "strict": true,
    "esModuleInterop": true,
    "sourceRoot": "./src",
    "forceConsistentCasingInFileNames": true
  },
  // コンパイル対象のファイル
  "files": [
    "src/main.ts" // メインプロセス用
    // レンダープロセスは Webpack でターゲットを指定するので、ここでは不要
  ]
}
```

> パスのワイルドカードについて
>
> - `/**/` サブディレクトリを再帰的にマッチ
> - `*` 0 個以上の文字列にマッチ
> - `?` 1 個の文字列にマッチ

## eslint

> tslint から eslint に移行しました。
> 参考: [脱 TSLint して、ESLint TypeScript Plugin に移行する - Qiita](https://qiita.com/suzuki_sh/items/fe9b60c4f9e1dbc5d903)

eslint は設定したコーディング・ルールに従って、コンパイラが行う構文チェックより厳しいチェックを行います。

例えば、

- 文字列リテラルのシングルクォーテーションの仕様を強制する
- 比較演算子に 2 個のイコールを禁止する(3 個イコールを使用する)
- インターフェースやクラス名をキャメル型に強制する

などがあります。

### インストール

```bash
$ npm install --save-dev eslint
# or
$ yarn add eslint
```

TypeScript 用のプラグインが必要ですが、下記ウィザードでインストールできます。

### 設定ファイルの作成

下記コマンドで、ウィザード形式で設定ファイル(.eslintrc.yml)が作成されます。
ルールは非常に多いので、ここでは Google が提供しているルールセットを利用します。

```bash
$ npx eslint --init
# or
$ yarn eslint --init

# ESLint をどのように利用するか？
? How would you like to use ESLint?
  To check syntax only
  To check syntax and find problems
> To check syntax, find problems, and enforce code style

# モジュールの解決方法はどれを利用するか？
? What type of modules does your project use? (Use arrow keys)
> JavaScript modules (import/export)
  CommonJS (require/exports)
  None of these

# どのフレームワークを使う？
? Which framework does your project use? (Use arrow keys)
> React
  Vue.js
  None of these

# TypeScript は使う？
? Does your project use TypeScript? (y/N) y

# 何でコードを実行する？
? Where does your code run? (スペースキーで選択)
>(*) Browser
 (*) Node

# スタイル定義はどれを使う？
? How would you like to define a style for your project? (Use arrow keys)
> Use a popular style guide # 一般的なスタイルガイド
  Answer questions about your style
  Inspect your JavaScript file(s)

# どのスタイルガイドを利用するか？
? Which style guide do you want to follow?
  Airbnb: https://github.com/airbnb/javascript
  Standard: https://github.com/standard/standard
> Google: https://github.com/google/eslint-config-google

# 設定ファイルのフォーマットはどうする？
? What format do you want your config file to be in?
  JavaScript
> YAML
  JSON

# 必要なライブラリを npm でインストールしていいか？
? Would you like to install them now with npm? (Y/n) y
```

### ルールのカスタマイズ

生成された設定ファイルの　`rules:` に項目を追加することで、カスタマイズできます。

```yaml:.eslintrc.yml
# 追加部分 のみ抜粋
extends:
  - 'plugin:react/recommended'
  - google
  - 'plugin:@typescript-eslint/recommended' # <-- TypeScript推奨ルールを追加
# 以下追加
rules:
  # 関数の複雑さを 10 以下にする
  complexity: ['error', 10]
  # React のプロパティの型チェックを省略する (TypeScript でチェックされるため)
  react/prop-types: off
  # インターフェースの先頭文字を "I" にする
  '@typescript-eslint/interface-name-prefix':
    - error
    - prefixWithI: 'always'
```

> 他のルールは公式サイトを参照して下さい。
> eslint https://eslint.org/docs/rules/
> typescript-eslint https://github.com/typescript-eslint/typescript-eslint/tree/master/packages/eslint-plugin

## prettier の導入と ESLint との統合

prettier は、コードの整形ツールです。
ESLint でも整形のためのチェックはできるのですが、こちらのほうがより強力なため、これを採用します。
ただ、 prettier は整形処理のみでチェックができないので、ESLint でチェックできるようにします。

### インストール

prettier 本体と、ESLint のプラグイン等も合わせてインストールします。

```bash
$ npm install --save-dev prettier eslint-config-prettier eslint-plugin-prettier
# or
$ yarn add -D prettier eslint-config-prettier eslint-plugin-prettier
```

### 設定ファイル

`.prettierrc.yml`ファイルを作成しルールを定義します。

ルールは公式サイトを参照してください。
[Options · Prettier](https://prettier.io/docs/en/options.html)

```yaml:.prettierrc.yml
printWidth: 80 # 行の文字数を"80"文字に制限
tabWidth: 2 # インデント幅をスペース"2"個
semi: true # 文末のセミコロンを強制する
singleQuote: true # 文字列リテラルのシングルクォーテーションとする
quoteProps: as-needed # オブジェクトリテラルのプロパティ名のクォーテーションは"必要なときのみ"とする
jsxSingleQuote: false # JSX のプロパティの値は、ダブルクォーテーションとする
trailingComma: all # オブジェクトリテラルなどの最後のカンマを強制する
bracketSpacing: true # {}のカッコに隣接するスペースをいれる
jsxBracketSameLine: true # JSXの後ろの'>'を同じ行にする
arrowParens: avoid # Arrow関数の引数のカッコは必要な場合のみつける
endOfLine: lf # 改行コードを "lf" にする
```

### ESLint との統合

ESLint に Prettier に統合するため、"eslint-plugin-prettier"が必要です。
また、整形に関する ESLint の定義を無効化するため、"eslint-config-prettier"を利用します。

```yaml:.eslintrc.yml
env:
  browser: true
  es6: true
  node: true
extends:
  - 'plugin:react/recommended'
  - google
  - prettier # 上の定義の整形に関するルールを無効化
globals:
  Atomics: readonly
  SharedArrayBuffer: readonly
parser: '@typescript-eslint/parser'
parserOptions:
  ecmaFeatures:
    jsx: true
  ecmaVersion: 2018
  sourceType: module
plugins:
  - react
  - '@typescript-eslint'
  - prettier # eslint-plugin-prettier の追加
rules:
  # 関数の複雑さを 10 以下にする
  complexity: ['error', 10]
  # React のプロパティの型チェックを省略する (TypeScript でチェックされるため)
  react/prop-types: off
  # インターフェースの先頭文字を "I" にする
  '@typescript-eslint/interface-name-prefix':
    - error
    - prefixWithI: 'always'
  # prettier のチェックでErrorとするための設定。
  prettier/prettier:
    - error
```

## Visual Studio Code でリアルタイムのチェック＆整形

Visual Studio Code の ESLint、Prettier の拡張を入れることで、リアルタムでの構文チェックと自動整形などの機能が利用できます。

- [ESLint - Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
- [Prettier - Code formatter - Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

## webpack の設定

webpack の動作設定を行います。`webpack.config.js` の名前で空ファイルを作成し、下記内容を記述します。

```javascript:webpack.config.js
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  // Electronのレンダラプロセスで動作することを指定する
  target: 'electron-renderer',
  // 起点となるファイル
  entry: './src/index.tsx',
  // webpack watch したときに差分ビルドができる
  cache: true,
  // development は、 source map file を作成、再ビルド時間の短縮などの設定となる
  // production は、コードの圧縮やモジュールの最適化が行われる設定となる
  mode: 'development', // "production" | "development" | "none"
  // ソースマップのタイプ
  devtool: 'source-map',
  // 出力先設定 __dirname は node でのカレントディレクトリのパスが格納される変数
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'bundle.js',
  },
  // ファイルタイプ毎の処理を記述する
  module: {
    rules: [
      {
        // コンパイルの事前に eslint による
        // 拡張子 .ts または .tsx の場合
        test: /\.tsx?$/,
        // 事前処理であることを示す
        enforce: 'pre',
        // TypeScript をコードチェックする
        loader: 'eslint-loader',
      },
      {
        // 正規表現で指定する
        // 拡張子 .ts または .tsx の場合
        test: /\.tsx?$/,
        // ローダーの指定
        // TypeScript をコンパイルする
        use: 'ts-loader',
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
  plugins: [
    // Webpack plugin を利用する
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: './index.html',
    }),
  ],
};
```

> 実際のプロジェクトでは、開発中と本番環境用とで分けることが多いです。
> それについては、別の機会に。

## HTML の作成

UI となる HTML ファイルを作成します。

React では、ほとんどの要素を動的に生成するので、HTML ファイルは非常に簡単なものになります。

ファイル名を`index.html`とします。

```html:index.html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Electronチュートリアル</title>
  </head>
  <body>
    <div id="contents"></div>
  </body>
</html>
```

この HTML には、Webpack でコンパイルした JavaScript を読み込む \<script\> がありません。

Webpack では、コンパイルした JavaScript が大きくなる場合、分割する機能などもあります。
その場合、ファイル名が不特定になります。

そのため、出力した JavaScript ファイル名に合わせて、HTML に動的に埋め込むライブラリ(html-webpack-plugin)を利用します。

インストール

```bash
$ npm install --save-dev html-webpack-plugin
# or
$ yarn add html-webpack-plugin
```

Webpack の設定の追加

```js
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin'); // 追加

module.exports = {
  //...省略
  // 以下を追加
  plugins: [
    // Webpack plugin を利用する
    new HtmlWebpackPlugin({
      filename: 'index.html', // 出力ファイル名
      template: './index.html', // 上で作成したファイルパス
    }),
  ],
};
```

## main.js の作成

Electron は、1 つの main プロセスと 1 つ以上の render 　プロセスの 2 種類のプロセスで動作します。

main プロセスは、Electron 自体と render プロセスの管理を行うものです。Electron アプリを起動したときには、まず main プロセスが動作し、その中で render プロセスを起動する仕組みとなっています。

render プロセスは、ブラウザエンジンを持っていて、ブラウザアプリの動作を担当します。

src/main.ts にメインプロセスのプログラムを書きます。

```javascript:src/main.js
import { app, BrowserWindow } from 'electron';
import path from 'path';

// セキュアな Electron の構成
// 参考: https://qiita.com/pochman/items/64b34e9827866664d436

const createWindow = (): void => {
  // レンダープロセスとなる、ウィンドウオブジェクトを作成する。
  const win = new BrowserWindow({
    width: 1200,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      nodeIntegrationInWorker: false,
      contextIsolation: true,
    },
  });

  // 読み込む index.html。
  // tsc でコンパイルするので、出力先の dist の相対パスで指定する。
  win.loadFile('./index.html');

  // 開発者ツールを起動する
  win.webContents.openDevTools();
};

// Electronの起動準備が終わったら、ウィンドウを作成する。
app.whenReady().then(createWindow);

// すべての ウィンドウ が閉じたときの処理
app.on('window-all-closed', () => {
  // macOS 以外では、メインプロセスを停止する
  // macOS では、ウインドウが閉じてもメインプロセスは停止せず
  // ドックから再度ウインドウが表示されるようにする。
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // macOS では、ウインドウが閉じてもメインプロセスは停止せず
  // ドックから再度ウインドウが表示されるようにする。
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
```

## コンパイル確認用スクリプトの記述

webpack でコンパイルができるか、確認します。

そのために、TypeScript のファイル`src/index.tsx`を１つ作成します。

```tsx:src/index.tsx
import React from 'react';
import ReactDom from 'react-dom';

const container = document.getElementById('contents');

ReactDom.render(<p>こんにちは、世界</p>, container);
```

コード中にいきなり文字列でもなく HTML タグがありますが、これは JSX 記法と言われるもので、DOM Element オブジェクト（正確には、DOM Element をラッピングした React.HTMLElement オブジェクト ）を作成するものです。

> 参考: [JSX の基本 – React 入門 - to-R Media](https://www.to-r.net/media/react-tutorial04/)

TypeScript でこれを利用するためには、`tsconfig.json`で`"jsx": "react"`(React を利用する場合)とし、ソースのファイルの拡張子を`.tsx`とする必要があります。

また、当然この記法は JavaScript としてブラウザが認識してくれないので、JavaScript に変換する必要がありますが、TypeScript コンパイラにはその機能もあるので、別途ツールを用意するなどの必要はありません。

##　コンパイルの確認

下記コマンドを実行して、コンパイルを実行します。

```bash
# メインプロセスのコンパイル
$ npx tsc
# レンダープロセスのコンパイル
$ npx webpack
# or
$ yarn tsc
$ yarn webpack
```

dist ディレクトリが作成されその中に、`index.js`と`index.js.map`ができていれば成功です。

Electron を起動して確認してみましょう。

```bash
$ npx electron ./dist/main.js
# or
$ yarn electron ./dist/main.js
```

”こんにちは、世界”が出てきたら成功です。

![electron_1.png](https://qiita-image-store.s3.amazonaws.com/0/263961/01cc62b7-b489-ac53-26da-060641fed09b.png)

## npm script を利用する

上のコマンドをいちいち打つのが面倒なので、npm script に書きます。
合わせて、ビルドコマンドも書いておきます。

```json:package.json
{
  // 他は略
  "scripts": {
    "start": "electron ./dist/main.js",
    "build:main": "tsc",
    "build:render": "webpack"
  }
}
```

npm script は下記のように実行します。

```bash
$ npm run build:main
# or
$ yarn build:main
```

npm script は、`"コマンド名": "シェルコマンド"`というように書きますが、`node_modules/.bin`にはパスが通った状態で実行するので、それを打たなくても良いです。

また、下記コマンドは規定のコマンド名なので、`run` が必要ないです。

- start
- restart
- stop
- test

```bash
$ npm start
```

> 参考: [npm scripts を使おう - Qiita](https://qiita.com/liply/items/cccc6a7b703c1d3ab04f)

yarn を使う場合は、スクリプト名だけ指定すればいいので、上のことは気にしないでいいです。

## 次回

コンパイルの環境が整いましたので、次回は、React-Redux を使ったフレームワークのコードを書いていきます。
