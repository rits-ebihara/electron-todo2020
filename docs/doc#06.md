> 以前この記事は ローカルステートについて書いていましたが、
> React Hooks で非常に簡単にかけるようになったため、
> 5 日目にまとめました。
> この文書をリンクしていただいているから、誠に申し訳ございません。

- [1 日目](https://qiita.com/EBIHARA_kenji/items/25e59f7132b96cb886f3)
- [2 日目](https://qiita.com/EBIHARA_kenji/items/e6da1c3d6d16cf07b60a)
- [3 日目](https://qiita.com/EBIHARA_kenji/items/1a043794014dc2f3a7db)
- [4 日目](https://qiita.com/EBIHARA_kenji/items/80adee2214d439209f98)
- [5 日目](https://qiita.com/EBIHARA_kenji/items/6da1cebb65a18279d096)
- 6 日目（この記事）
- [7 日目](https://qiita.com/EBIHARA_kenji/items/19b13207b7a8055043c4)
- [8 日目](https://qiita.com/EBIHARA_kenji/items/41552d664e7a72d867e3)

## 概要

前回までに基本的なアプリの動作ができました。

あとは、データを永続化するために、ローカルファイルにアクセスしたいところですが、その前に Electron のセキュリティについて確認しておきます。

Electron は、Web ブラウザで動作する仕組みで、且つ Node.js の機能を併せ持つことで、ローカルファイルやプロセスへのアクセスができ、一般のネイティブアプリと同等の事ができます。

その一方で、Web ページ内に悪意のあるコードが侵入し実行された場合、File API などを利用して、利用者のデバイスや情報に甚大な被害を与えてしまうことになります。

そのため、Electron では推奨する設定とガイドラインがあり、それに従うことが望ましいです。

> [セキュリティ、ネイティブ機能、あなたの責任 | Electron](https://www.electronjs.org/docs/tutorial/security)

## チェックツール

Electron の公式サイトで紹介されているチェックツールがあるので、これで確認するのが良いでしょう。

[Electronegativity](https://github.com/doyensec/electronegativity)

```bash
>  electronegativity -i ./dist -v
```

## Node.js integration を有効にしない / コンテキストイソレーションを有効にする

レンダープロセスで、Node.js との統合（Node.js の機能を利用すること）を禁止します。

ただし、ビジネスロジックではその必要があるため、唯一 Node.js の機能を実行できる、preload でそれを実装します。

https://www.electronjs.org/docs/api/browser-window より抜粋

> preload String (任意) - 他のスクリプトがページで実行される前にロードされるスクリプトを指定します。 このスクリプトは、Node 統合がオンまたはオフであるかに関係なく常に Node API にアクセスできます。 値は、スクリプトへの絶対ファイルパスにする必要があります。 Node 統合がオフのときでも、プレロードされたスクリプトは、Node のグローバルシンボルをグローバルスコープに再導入できます。

```ts:src/core/main.ts
const win = new BrowserWindow({
  width: 1200,
  height: 600,
  title: 'EIM 申請台帳デザイナ',
  webPreferences: {
    // レンダラープロセスで Node.js 使えないようにする (XSS対策)
    nodeIntegration: false,
    nodeIntegrationInWorker: false,
    // preload で実行するときに、コンテキスト(this == window)を別なものとする
    contextIsolation: true,
    // process や Electron を windowオブジェクト に保存する処理。フルパスの指定が必要
    preload: path.join(__dirname, './preLoad.js'), // preLoad.js にビジネスロジックを記述する
  },
});
```

## preLoad.js の書き方と呼び出し方

preLoad.js での実装は下記のようになります。

```ts
import { contextBridge } from 'electron';

// 第2引数のオブジェクトが、window オブジェクトに、第1引数の名前で作成される
contextBridge.exposeInMainWorld('core', {
  xxxx: () => {
    console.log('preload-xxxx');
  },
});
```

Render プロセスからの呼び出しは下記のようになります。

```ts
window.core.xxx();
```

TypeScript では、window の型に`core`というのもがないのでエラーになりますし、core の型がそもそも必要になります。

ここでは、実際に今回のアプリのビジネスロジックを実装しながら確認したいと思います。

## window.core のインターフェースを定義する

上の`contextBridge.exposeInMainWorld`の第 2 引数に指定するオブジェクトをインターフェースとして定義します。

また、window オブジェクトに、`core`があることを定義します。

```ts:src/core/ICore.ts
import { ITask } from '../states/ITask';

export default interface ICore {
  loadTaskList: () => Promise<ITask[]>;
  saveTask: (task: ITask) => Promise<ITask[]>;
  deleteTask: (taskId: string) => Promise<ITask[]>;
}
// window オブジェクトに、core の定義を追加する。
declare global {
  // eslint-disable-next-line @typescript-eslint/interface-name-prefix
  interface Window {
    core: ICore;
  }
}
```

`window.core`を呼び出す側では、`import './core/ICore';`とすることでアクセスできるようになります。

## Core の実装

処理は `preLoad.ts` に書くよりも、管理しやすいように別ファイルに書きます。

ファイルのアクセスに、 [fs-extra](https://www.npmjs.com/package/fs-extra) を、一意な ID を生成するために [shortid](https://www.npmjs.com/package/shortid)を利用するので、インストールします。

```bash
$ npm install --save fs-extra shorti && npm isntall --save-dev @types/fs-extra @types/shortid
# or
$ yarn add fs-extra shortid && yarn add -D @types/fs-extra @types/shortid
```

```ts:src/core/core.ts
import fs from 'fs-extra';
import os from 'os';
import path from 'path';
import shortid from 'shortid';
import { ITask } from '../states/ITask';
import ICore from './ICore';

// OSごとのユーザーのプロファイルフォルダに保存される
const dataFilePath = path.join(os.homedir(), 'todo.json');

/** 遅延処理確認用：指定ミリ秒 待つ関数 */
const setTimeoutPromise = (count: number): Promise<void> => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, count);
  });
};

// テストのためにJSONの変換処理を別に定義する
export const __private__ = {
  reviver: (key: string, value: unknown): unknown => {
    if (key === 'deadline') {
      return new Date(value as string);
    } else {
      return value;
    }
  },
  replacer: (key: string, value: unknown): unknown => {
    if (key !== 'deadline') {
      return value;
    }
    return new Date(value as string).toISOString();
  },
};

const loadTaskList = async (): Promise<ITask[]> => {
  const exist = await fs.pathExists(dataFilePath); // ...(b)
  if (!exist) {
    // ...(c)
    // データファイルがなけれが、ファイルを作成して、初期データを保存する
    fs.ensureFileSync(dataFilePath);
    await fs.writeJSON(dataFilePath, { data: [] });
  }
  // データファイルを読み込む ...(d)
  const jsonData = (await fs.readJSON(dataFilePath, {
    // 日付型は、数値で格納しているので、日付型に変換する
    reviver: __private__.reviver,
  })) as { data: ITask[] };
  // 早すぎて非同期処理を実感できないので、ちょっと時間がかかる処理のシミュレート
  await setTimeoutPromise(500);
  return jsonData.data;
};

const saveTaskList = async (taskList: ITask[]): Promise<void> => {
  await fs.writeJSON(
    dataFilePath,
    { data: taskList },
    {
      replacer: __private__.replacer,
      spaces: 2,
    },
  );
};

const saveTask = async (task: ITask): Promise<ITask[]> => {
  // 早すぎて非同期処理を実感できないので、ちょっと時間がかかる処理のシミュレート
  await setTimeoutPromise(500);
  const taskList = await loadTaskList();
  const existTask = taskList.find(pTask => pTask.id === task.id);
  if (!task.id || !existTask) {
    task.id = shortid();
    taskList.push(task);
  } else {
    existTask.complete = task.complete;
    existTask.deadline = task.deadline;
    existTask.taskName = task.taskName;
  }
  await saveTaskList(taskList);
  return taskList;
};

const deleteTask = async (id: string): Promise<ITask[]> => {
  // 早すぎて非同期処理を実感できないので、ちょっと時間がかかる処理のシミュレート
  await setTimeoutPromise(500);
  const taskList = await loadTaskList();
  const deletedTaskList = taskList.filter(task => task.id !== id);
  await saveTaskList(deletedTaskList);
  return deletedTaskList;
};

const core: ICore = {
  loadTaskList,
  saveTask,
  deleteTask,
};

export default core;
```

## preLoad の実装

Electron が起動時に読み込む `preLoad.ts` を実装します。

上で作成した、`core`を割り当てるだけですね。

```ts:src/core/preLoad.ts
import { contextBridge } from 'electron';
import core from './core';

contextBridge.exposeInMainWorld('core', core);
```

## Electron 起動時に読み込む

正確には、Window 起動時ですが。

```ts:src/main.ts
// 抜粋
const win = new BrowserWindow({
  width: 1200,
  height: 600,
  webPreferences: {
    nodeIntegration: false,
    nodeIntegrationInWorker: false,
    contextIsolation: true,
    preload: path.join(__dirname, './core/preLoad.js'), // <- 追加
  },
});
```

## TypoeScript でコンパイルされるようにする

このままだと、TypeScript のコンパイル対象になっていないので、`tsconfig.json`に追加します。

また、preLoad で読み込んだファイルは、パスの関係が実行時とずれてしまい、デバックコンソールで map ファイルが取得できなくなってしまうので、inline sourcemap とします。

```json-doc:tsconfig.json
// 変更箇所を抜粋
{
  compilerOptions: {
     // "sourceMap": true,
     // "mapRoot": "./src",
     "inlineSourceMap": true,
     "inlineSources": true,
  },
  "files": [
    "src/main.ts",
    "src/core/preLoad.ts" // <- 追加
  ]
}
```

## ビルドする

```bash
$ npm run build:main
# or
$ yarn build:main
```

`dist`ディレクトリに`core`以下の js ファイルが出力されていれば OK です。

## 次回

ビジネスロジックができたので、呼び出す必要があります。
次回は、非同期の Action にいて説明します。
