- 1 日目（この記事）
- [2 日目](https://qiita.com/EBIHARA_kenji/items/e6da1c3d6d16cf07b60a)
- [3 日目](https://qiita.com/EBIHARA_kenji/items/1a043794014dc2f3a7db)
- [4 日目](https://qiita.com/EBIHARA_kenji/items/80adee2214d439209f98)
- [5 日目](https://qiita.com/EBIHARA_kenji/items/6da1cebb65a18279d096)
- [6 日目](https://qiita.com/EBIHARA_kenji/items/26fa0d004cbaeea807e4)
- [7 日目](https://qiita.com/EBIHARA_kenji/items/19b13207b7a8055043c4)
- [8 日目](https://qiita.com/EBIHARA_kenji/items/41552d664e7a72d867e3)

## 概要

本書は、 Electron を利用したマルチプラットフォーム・デスクトップアプリケーションを、 React-Redux で作成するワークショップです。

言語には、 JavaScript ではなく、 TypeScript を利用します。

これらの技術を組み合わせることで、中～大規模開発においても非常に効率よく設計・実装ができるようになります。

1 日目では、それぞれの技術の概要の説明と、npm / yarn を使ったライブラリの導入まで行います。

## 対象者

- Web 開発の経験があり、ある程度 JavaScript は知っている人。
- Electron を試してみたい人。

## 前提条件

Node.js がコンピューターにインストールされていることが必要です。

執筆時点の Node.js のバージョンの最新版は、 12.16.2 です。ある程度古いものでも大丈夫と思いますが、うまくいかない場合は、このバージョン違いを疑ってみてください。

Node.js のインストールには、各 OS(Windows, macOS, Linux)に node のバージョン管理ツールがあるので、それらを活用するのをお勧めします。

> 参考: [Node.js のバージョンを管理する - Qiita](https://qiita.com/hosoyama-mediba/items/62076628799bddb6ec24)

## 各技術の概要

ワークショップに入る前に、利用するプラットフォーム、ライブラリ、ツール等の説明をします。

参考: [Web アプリケーション開発のツールやライブラリのまとめ - Qiita](https://qiita.com/EBIHARA_kenji/items/3123eadd2dc2eb577bbc)

### Node.js

公式サイト: [Node.js](https://nodejs.org/ja/)

Site: サーバー、デスクトップ上で動作する、 JavaScript 動作環境です。

ブラウザ上で動作するものと異なり、動作しているコンピューター上のファイルやプロセス、デバイスなどへのアクセスが可能でです。

Web サーバーとしても利用されることが多いですが、クライアント PC でのバッチ処理等でも活用できます。

### npm

公式サイト: [npm](https://www.npmjs.com/)

Node Package Manager の略で、主に JavaScript のライブラリを管理するものです。

オープンソースのライブラリを利用するときに、 .js ファイルをダウンロードして自分のディレクトリにコピーするような作業は必要なく、npm のサーバーに多くのライブラリが登録されており、`npm install`のようなコマンドでダウンロードやアンインストール、アップデートなどができます。

最近では JavaScript だけでなく、[normalize-scss - npm](https://www.npmjs.com/package/normalize-scss) のように CSS や HTML といった Web で使うリソースも登録されています。

以下のライブラリも、全て npm でインストールすることができます。

### Yarn

公式サイト: [Yarn](https://classic.yarnpkg.com/ja/)

npm だけでも良いのですが、それを更に便利（早い、コマンドを短縮できる、など）にした yarn を利用することも多いです。

参考: [npm vs yarn どっち使うかの話 - Qiita](https://qiita.com/jigengineer/items/c75ca9b8f0e9ce462e99)

インストールは、公式サイトからインストーラーをダウンロードするか、npm からもインストールできます。グローバル(-g)でインストーするのを忘れないでください。

```bash
> npm install -g yarn
```

以降のパッケージャのコマンドは、npm と yarn を併記します。

### Electron

公式サイト: [Electron | Build cross platform desktop apps with JavaScript, HTML, and CSS.](https://electronjs.org/)

HTML や JavaScript といった Web の技術で、マルチプラットフォームのデスクトップアプリケーションを作成できるフレームワークです。

対応するプラットフォームは、windows, macOS, Linux で、これらのアプリを ほぼ 1 ソースで作成することができます。

JavaScript の実行エンジンには、 Node.js が利用されているため、OS のファイルやプロセスにアクセスでき、C#や Java で作成するアプリと遜色ない機能を持つアプリを作ることができます。

HTML や CSS のレンダリングには、Google Chrome で採用されている Chromium が採用されており、HTML5 や CSS3 の最新の仕様を利用することができる。当然、IE 対応などブラウザ間の差異に悩まされることはありません。

### React

公式サイト: [React - A JavaScript library for building user interfaces](https://reactjs.org/)

React は Facebook 社が開発した、オープンソースの WebUI フレームワークです。

特徴としては、DOM を直接操作するのではなく、JavaScript でコンポーネントと呼ばれるパーツを作って、ページを組み立てます。

コンポーネントには、データを渡すことで動的に振舞いを変えることができます。

AngularJS などと異なり、 React がサポートするのは MV\*(C)で言うところの V（view）の部分だけで、データのバインドは 1 方向です。データの変更にはコーディングが必要になりますが、そのおかげでシンプルな構造を保てます。

> 参考:  
>  [出来る限り短く説明する React.js 入門 - Qiita](https://qiita.com/rgbkids/items/8ec309d1bf5e203d2b19)  
> [React を使うとなぜ jQuery が要らなくなるのか](https://qiita.com/naruto/items/fdb61bc743395f8d8faf)

### Redux

公式サイト: [Read Me - Redux](https://redux.js.org/)

Redux は、データの状態を管理するフレームワークで、MV\*(C)で言うところの M や C の部分を担当します。V には React を使うことが多いですが、別のフレームワークやライブラリも利用できます。

特徴としては、Reducer->Store->View->Reducer という 1 方向のデータの流れを作るもので、これは Flux というアーキテクチャ思考です。

これにより部品ごとにデータとその処理を管理することができ、大規模になってもシンプルな構造が保てます。

詳しい説明は追って行います。

> 参考: [Redux 入門【ダイジェスト版】10 分で理解する Redux の基礎 - Qiita](https://qiita.com/kiita312/items/49a1f03445b19cf407b7)

### TypeScript

公式サイト: [TypeScript - JavaScript that scales.](https://www.typescriptlang.org/)

マイクロソフト社が開発・メンテナンスする、オープンソースのプログラミング言語で、コンパイルすることで、 JavaScript を出力する、いわゆる ALT JavaScript 言語です。

JavaScript（正確には ECMAScript）の完全なスーパーセットで互換性を保ちつつ、C#や Java のような静的型付けとインターフェース、クラス設計、null-safety なコーディングができることがなど特徴です。

これにより、10 万ステップを超えるような大規模な開発でも効率の良い継続開発が可能です。

### webpack

公式サイト: [webpack](https://webpack.js.org/)

webpack は JavaScript が持たないモジュール依存（ある JS ファイルが他の JS ファイルを参照すること）を解決するためのツールです。

各種 loader を利用することで、さまざまな変換や JavaScript への変換ができるようになります。  
上記以外には、 html や JavaScript のミニファイ、sass -> css 変換など、また CSS や 画像ファイル を JavaScript にも変換することができます。

loader 一覧: [Loaders](https://webpack.js.org/loaders/)

## npm プロジェクトの作成

npm コマンドを利用してライブラリの管理を行うには、`package.json`ファイルが必要です。

このファイルが有るディレクトリが npm プロジェクトのディレクトリとなります。

1. 下記コマンドで、`package.json`を作成します。

```bash
$ npm init
# or
$ yarn init
```

とりあえず全て[enter]キーを押して先に勧めます。

> 参考: [初期化処理を行う！npm init の使い方【初心者向け】 | TechAcademy マガジン](https://techacademy.jp/magazine/16151)

2. `package.json`を開き、`main` の値を`main.js`に書き換えます。

   ```json
   {
     "main": "main.js"
   }
   ```

   `main.js`は後に作成する、Electron のメインプロセスの起動ファイル（エントリーポイント）を指定しています。

## 必要なライブラリをインストールする

electron, React, Redux, TypeScript コンパイラなどをインストールします。

ここでは、基本的なライブラリのみをインストールすることにします。
他にも多くのライブラリを利用しますが、必要になるたびにインストールします。

1. 実行時に必要なライブラリをインストールします。下記コマンドを実行します。

```bash
$ npm install --save react react-dom redux react-redux
# or
$ yarn add react react-dom redux react-redux
```

- 各ライブラリの概要:
- react: React 上で説明済み
- react-dom: React のコンポーネントを DOM に紐付けるために必要
- redux: Redux 上で説明済み
- react-redux: React と Redux を連携させるライブラリ

2. 開発時に必要なライブラリをインストールします。

```bash
$ npm install --save-dev electron typescript eslint prettier eslint-config-prettier eslint-plugin-prettier webpack webpack-cli ts-loader
# or
$ yarn add -D electron typescript eslint prettier eslint-config-prettier eslint-plugin-prettier webpack webpack-cli ts-loader
```

- 各ライブラリの概要:
- electron: Electron ライブラリ
- typescript: TypeScript コンパイラ
- webpack: モジュールバンドラ JS が持たないモジュールの依存関係を解決するツール
- ts-loader: webpack の TypeScript 処理オプション・ライブラリ

3. 各ライブラリの TypeScript 用の型定義ファイルをインストールします。

```bash
$ npm install --save-dev @types/react @types/react-dom @types/redux @types/react-redux
# or
$ yarn add -D  @types/react @types/react-dom @types/redux @types/react-redux
```

> electron の型定義は、ライブラリに含んでいるので、別途のインストールは必要ありません。

## npm / yarn で入れたライブラリについて

`npm install`でインストールされたモジュールは、`node_modules`に入ります。

git などのソースコード管理において、そのディレクトリは、大抵、ファイル数が非常に多くサイズも大きくなり、そもそも開発者が修正したりするものではないので、管理対象からこのディレクトリを外します。

従って、複数人で開発する場合や異なる環境で開発する場合、それごとに必要なライブリをインストールする必要がありますが、npm でライブラリを管理している場合、必要なライブラリを下記コマンドで一括インストールする事ができます。

```bash
$ npm install
# or
$ yarn install # `yarn` だけでも可
```

`package.json` ファイルを開いてみてください。`dependencies`と`devDependencies`が追加され、その中に`npm install`で追加したライブラリ名が入っています。

`package.json`があるディレクトリで、`npm install`を実行すると、`dependencies`と`devDependencies`にあるライブラリを一括でインストールすることができるわけです。

`package.json`を git などのソースコード管理ツールに含めることで、環境毎に開発環境を揃えることができます。

## 次回

次は、アプリ開発のための各種定義を作っていきたいと思います。
