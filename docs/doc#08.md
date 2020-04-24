## 概要

今回は、作成した Web アプリケーションのテストの実装について、書いていきます。

実装とともにテストも書いていくのが理想ですが、実装方法がわからないとテストも書けないので、最後にテストを説明します。

> テストを書くのが面倒だって？
> [エンジニアとしてこの先生きのこるために - Speaker Deck](https://speakerdeck.com/rtechkouhou/enziniatositekofalsexian-sheng-kifalsekorutameni?slide=9)

## ツール

JavaScript でい 2020 年で一番スタンダードなのが jest だと思います。

![testing experience ranking](https://2019.stateofjs.com/images/captures/testing_experience_ranking.png)

![jest experience](https://2019.stateofjs.com/images/captures/jest_experience.png)

[Jest · 🃏 快適な JavaScript のテスト](https://jestjs.io/ja/)

Jest は、モックが作りやすい、テストの実行、アサート、カバレッジがパッケージングされていて利用にの開始に手間取らない、といった特徴があります。

## インストールする

いつもの通り、npm / yarn でインストールします。

テストは、やはり TypeScript で書いて、それをコンパイルなしに実行できます。そのためのライブラリ`ts-jest`を入れます。

```bash
$ npm install --save-dev jest @types/jest ts-jest
# or
$ yarn add -D jest @types/jest ts-jest
```

## 設定ファイルを作る

テストを書く前に、Jest の設定をします。

定義ファイルの作成に、init コマンドが使えます。

```bash
$ yarn jest --init

The following questions will help Jest to create a suitable configuration for your project

√ Would you like to use Jest when running "test" script in "package.json"? ... yes
√ Choose the test environment that will be used for testing » jsdom (browser-like)
√ Do you want Jest to add coverage reports? ... yes
√ Automatically clear mock calls and instances between every test? ... yes

Done in 30.62s.
```

これで、`package.json`の`script`に`test`が追加され、`jest.config.js`が追加されます。

`ts-jest`の設定も必要です。`preset`に下記設定を追記します。

```js:jest.config.js
  preset: 'ts-jest',
```

## テストの書き方

ビジネスロジックのテストが書きやすいので、まずはそれから書いていきます。

`__tests__/core/core.test.ts` ファイルを作成します。

ディレクトリ名を `__tests__`、ファイル名に`.test.ts`とするのが慣習なので、それに習います。

```ts:__tests__/core/core.test.ts
describe('loadTaskList', () => {
  test('success', () => {
    expect('test').toBe('jest'); // エラーになるはず
  });
});
```

これは意味のないテストですが、学習に役立ちます。

`test` がテストの単位、`describe` はテストをグルーピングするものです。

`expect`が検証（アサート）になります。`toBe`は、同じであることを期待しています。なので、この結果は NG になると思います。

テストを実行します。

```bash
$ npm test
# or
$ yarn test

 FAIL  __tests__/core/core.test.ts
  loadTaskList
    × success (8ms)

  ● loadTaskList › success

    expect(received).toBe(expected) // Object.is equality

    Expected: "jest"
    Received: "test"

      3 | describe('loadTaskList', () => {
      4 |   test('success', () => {
    > 5 |     expect('test').toBe('jest'); // エラーになるはず
        |                    ^
      6 |   });
      7 | });
      8 |

      at Object.test (__tests__/core/core.test.ts:5:20)

Test Suites: 1 failed, 1 total
Tests:       1 failed, 1 total
Snapshots:   0 total
Time:        5.316s
```

この通り、エラーになりました。結果も見やすいと思います。

もっと詳しいチュートリアルはこちらを参考にしてください。

> [jest でユニットテスト基礎 - Qiita](https://qiita.com/jintz/items/61af86a12b53b24ef121)

では、いきなりですが、本格的に書いていきます。

## ビジネスロジックのテストを書く

まずは、`core.loadTaskList`の関数のテストコードを書きます。

他のものもそうですが、ここではテストコードの一部を掲載しています。

すべてのテストは、Github のリポジトリを確認してください。

```ts:__tests__/core/core.test.ts
import fs from 'fs-extra';
import { mocked } from 'ts-jest';
import target from '../../src/core/core';
import { ITask } from '../../src/states/ITask';
import path from 'path';

jest.mock('fs-extra'); // --(a)

jest.mock('os', () => ({
  homedir: (): string => '/home', // --(b)
  platform: jest.fn(), // 無いとエラーになる・・・
}));

const testTaskList: ITask[] = [
  {
    complete: false,
    deadline: new Date('2020-04-24T15:02:00.000Z'),
    id: 'x001',
    taskName: 'name001',
  },
  {
    complete: false,
    deadline: new Date('2020-04-25T12:02:00.000Z'),
    id: 'x002',
    taskName: 'name002',
  },
];

// プライベート関数のテスト
describe('__private__', () => {
  test('reviver', () => {
    const key1 = 'deadline';
    const value = '2020-04-25T01:02:00.000Z';
    const result1 = __private__.reviver(key1, value);
    expect(result1).toEqual(new Date(2020, 3, 25, 10, 2, 0));
    const key2 = 'other';
    const result2 = __private__.reviver(key2, value);
    expect(result2).toEqual(value);
  });
});

describe('loadTaskList', () => {
  // ファイルパスがテストを実行するOSによって異なるので、ここで作成する
  const dataFilePath = path.join('/home', 'todo.json');
  // ファイルが存在しているときのテスト
  test('success - exist data file', async () => {
    // --(c)
    // ファイルが存在する前提
    mocked(fs.pathExists).mockResolvedValue(true as never); // --(d)
    // ファイルから読み込まれるデータの設定
    mocked(fs.readJSON).mockResolvedValue({ data: testTaskList } as never);
    // 実行
    const taskList = await target.loadTaskList();
    // ファイルの新規作成の処理が実行され”ない”ことを確認する
    expect(fs.ensureFileSync).not.toBeCalled(); // --(e)
    expect(fs.writeJSON).not.toBeCalled();
    // 期待された値が返されたか確認する
    expect(taskList).toEqual(testTaskList);
  });
  // ファイルが存在しないときのテスト
  test('success - not exist data file', async () => {
    // ファイルが存在しない前提
    mocked(fs.pathExists).mockResolvedValue(false as never);
    // ファイルから読み込まれるデータの設定
    mocked(fs.readJSON).mockResolvedValue({ data: [] } as never);
    // 実行
    const taskList = await target.loadTaskList();
    // ファイルを作成する処理が実行されることを確認する。
    expect(fs.ensureFileSync).toBeCalledWith(dataFilePath); // --(f)
    expect(fs.writeJSON).toBeCalledWith(dataFilePath, { data: [] });
    // 期待された値が返されたか確認する
    expect(taskList).toEqual([]);
  });
});
```

- (a)...外部のライブラリをモック化しています。ファイルを扱う部分は、実際にファイルを捜査するのでは、繰り返しや他の環境でのテストができなくなります。  
  `jest.mock`を使うと、ライブラリの関数をすべて自動的にモックにします。  
  モック化した関数は、テスト中に任意の値を返すように定義することもできます。
- (b)...外部ライブラリで特定の関数が任意の値を返すようにしています。自動モックでは戻り地が undefined になるので、コード中で任意の値を返す必要がある場合、モックをマニュアルで指定することもできます。
- (c)...非同期関数を扱うのですが、テストのメソッドに、`async`をつけて、非同期関数を呼び出すときに、`await`をつけるだけで、同期関数と同じ用にテストが書けます。
- (d)...`fs.pathExists`は、(a)でモック関数になっています。この関数はファイルの有無を boolean で返すものですが、その値によりテスト対象の処理の中で分岐しているのでモックで任意の値を返して、テストが網羅するようにします。  
  ここでは"true"が返されたとき、次のテストは"false"が返されたときのそれぞれの確認をしています。
- (e)...ここでは、`todo.json`ファイルが有ることが前提のテストなので、新規作成の処理が動作していないことを確認しています。そのために、`fs.ensureFileSync`や`fs.writeJSON`がコールさていないことを確認しています。  
  このように、値の確認だけでなく、関数が実行されたか否かの確認もできます。検証対象の関数は、モック化されている必要があります。
- (f)...ここでは、`todo.json`ファイルが無いこと前提のテストなので、(d)とは逆にそれぞれの関数が呼ばれることを確認しています。さらに、正しい引数で呼ばれているかも確認しています。

## Action のテスト

Redux のテストは、それぞれ役割が分かれており、それぞれのテストが非常に簡単です。

Action は、'actionCreator'で作成されたものはテストを作成する必要はないでしょう。

非同期の処理の関数を書いていくことになります。

```ts:__tests__/action/TaskActions.test.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import { getTaskList, showTaskListAction } from '../../src/actions/TaskActions';
import { ITask } from '../../src/states/ITask';

const dispatch = jest.fn(); // --(a)

const loadTaskList = jest.fn(); // --(b)

// window オブジェクトのモック化
(global as any).window = {
  core: {
    loadTaskList,
  },
};

const testTaskList: ITask[] = [
  {
    complete: false,
    deadline: new Date('2020-04-24T15:02:00.000Z'),
    id: 'x001',
    taskName: 'name001',
  },
  {
    complete: false,
    deadline: new Date('2020-04-25T12:02:00.000Z'),
    id: 'x002',
    taskName: 'name002',
  },
];

describe('getTaskList', () => {
  test('success', async () => {
    // モックの作成
    loadTaskList.mockResolvedValueOnce(testTaskList);
    // 期待値の作成
    const action = showTaskListAction.done({
      result: testTaskList,
      params: null,
    });
    // テスト実行
    await getTaskList(dispatch);
    // 検証
    expect(dispatch).toBeCalledWith(action);
  });
  test('failed', async () => {
    // モックの作成
    loadTaskList.mockRejectedValueOnce(new Error()); // --(c)
    // 期待値の作成
    const action = showTaskListAction.failed({
      error: 'ファイルの読み込みに失敗しました。',
      params: null,
    });
    // テスト実行
    await getTaskList(dispatch);
    // 検証
    expect(dispatch).toBeCalledWith(action);
  });
});
```

- (a)...引数として渡す`dispatch`関数をモックとして定義することで、`dispatch`が関数の中でコールされることを確認できます。
- (b)...検査対象の関数の中で呼ばれる、core の関数をモック化します。
- (c)...非同期関数が失敗(Reject を返す)するようになります。これで、`catch`の処理が実行され、その検証ができます。

## Reducer のテスト

Reducer は、現在の State と Action を引数に渡して、戻り値の State が期待値かどうかを確認します。

```ts:__tests__/reducers/TaskReducer.test.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import reducer from '../../src/reducers/TaskReducer';
import { ITaskList } from '../../src/states/ITask';

describe('TaskReducer', () => {
  // 非同期開始時
  test('showTaskListAction: STARTED', () => {
    const beforState: ITaskList = {
      failedMessage: 'befor',
      loading: false,
      tasks: [],
    };
    const afterState = reducer(beforState, {
      type: 'task-actions/show-task-list_STARTED',
    } as any);
    expect(afterState).toEqual({
      failedMessage: '',
      loading: true,
      tasks: [],
    });
  });
});
```

## Component のテスト
