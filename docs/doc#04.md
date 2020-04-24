- [1 日目](https://qiita.com/EBIHARA_kenji/items/25e59f7132b96cb886f3)
- [2 日目](https://qiita.com/EBIHARA_kenji/items/e6da1c3d6d16cf07b60a)
- [3 日目](https://qiita.com/EBIHARA_kenji/items/1a043794014dc2f3a7db)
- 4 日目（この記事）
- [5 日目](https://qiita.com/EBIHARA_kenji/items/6da1cebb65a18279d096)
- [6 日目](https://qiita.com/EBIHARA_kenji/items/26fa0d004cbaeea807e4)
- [7 日目](https://qiita.com/EBIHARA_kenji/items/19b13207b7a8055043c4)
- [8 日目](https://qiita.com/EBIHARA_kenji/items/41552d664e7a72d867e3)

## 概要

前回はごく簡単な React-Redux を使ったアプリを作りました。

今回から、数回に渡ってより実践的なアプリを作ってみましょう。

最終的には、ファイルから非同期でデータの入出力を行うアプリにしますが、その前に

長くなるので、Component は次回にして、その他のモジュールを作成していきます。

## 作成するアプリの仕様

ToDo を管理するアプリを作成します。画面仕様はこんな感じです。

![4.todo_1-1.png](https://qiita-image-store.s3.amazonaws.com/0/263961/04951569-6ac4-7028-6f5a-e2c7dc1915a2.png)

この画面のイベントとしては、下記があります。

- タスク一覧の表示
- タスクの追加
- タスクの完了・未完了の切り替え
- タスクの削除

## プロジェクトの準備

空のディレクトリを作成し、前回作成したチュートリアルのファイルをコピーします。

dist と node_modules は対象外とします。

新しいディレクトリで VSCode を開いて、書きを行います。

- package.json を開いて、プロジェクトの名前を変更します。
- ターミナルで`npm install`を実行して、ライブラリをインストールします。

src ディレクトリ以下の下記ファイルを削除します。ディレクトリは残しておいてください。

```bat
ts
│
├─actions
│      UserActions.ts // 削除
│
├─components
│      CountButton.tsx // 削除
│      TextBox.tsx // 削除
│      UserForm.tsx // 削除
│
├─reducers
│      UserReducer.ts // 削除
│
└─states
        IUser.ts // 削除
```

ライブラリをインストールしておきます。

```bash
$ npm install
# or
$ yarn
```

## 各ファイルの関係

各モジュールの関連は下記のようになります。

![4.todo_2.png](https://qiita-image-store.s3.amazonaws.com/0/263961/ac33cbc9-60b8-68b5-6162-e2504e3c59b5.png)

## 子 State 定義の作成

Redux で管理するデータの定義を作成します。

TODO ですので、id と、タスクの名前、期限、完了したかどうかのフラグを持ちましょう。

タスクは複数管理されるので、その配列を保持するインターフェイスも定義しておきます。

また、ステートの新規作成するときの関数と、その一覧のオブジェクトの初期値も定義しておきます。

ITask.ts を作成します。

```ts:src/states/ITask.ts
/**
 * タスク
 */
export interface ITask {
  /** 完了フラグ */
  complete: boolean;
  /** 期限 */
  deadline: Date;
  /** タスクを一意に判断するID (UUID) */
  id: string;
  /** タスクの名前 */
  taskName: string;
}
/**
 * タスクのリスト
 */
export interface ITaskList {
  /** タスクの一覧 */
  tasks: ITask[];
}
```

統合する State も修正しておきます。

```ts:src/states/IState.ts
import { ITaskList } from './ITask';

export interface IState {
  taskList: ITaskList;
}
```

## State の作成

Reducer を合成、ステートとなるインターフェースの定義、ステートの作成をします。

```ts:src/Store.ts
import { combineReducers, createStore } from 'redux';
import { IState } from './states/IState';
import taskReducer from './reducers/TaskReducer'; // 後からファイルを追加する

// 複数の reducer を束ねる
const combinedReducer = combineReducers<IState>({
  taskList: taskReducer,
  // reducer が増えたら足していく
});

// グローバルオブジェクトとして、store を作成する。
export const store = createStore(combinedReducer); // --(b)

// import store from './Store' とアクセスできるように default として定義する
export default store;
```

combineReducers がエラーになっていますが、新しい Reducer を作成したときに修正することにします。

## Action の作成

画面のイベントをアクションとして作成していきます。

タスクの一覧の取得処理を関数で書いています。これは後ほど、ファイルから非同期で取得するための準備です。

`moment`という日付処理のライブラリを利用しています。下記でインストールします。

```bash
$ npm install --save moment && npm install --save-dev @types/moment
# or
$ yarn add moment && yarn add -D @types/moment
```

```ts:src/action/TaskActions.ts
import moment from 'moment';
import { Dispatch } from 'redux';
import { actionCreatorFactory } from 'typescript-fsa';
import { ITask } from '../states/ITask';

const actionCreator = actionCreatorFactory('task-actions');

/**
 * タスクの一覧を表示する
 * 引数は、タスクオブジェクトの配列
 */
export const showTaskListAction = actionCreator<ITask[]>('show-task-list');

/**
 * タスクを追加する
 * 引数は、追加するタスクオブジェクト
 */
export const addTaskAction = actionCreator<ITask>('add');

/**
 * タスクの完了フラグをトグルする
 * 引数は、タスクID
 */
export const toggleCompleteAction = actionCreator<string>('toggle-complete');

/**
 * タスクを削除する
 * 引数は、タスクID
 */
export const deleteTaskAction = actionCreator<string>('delete');

// 確認のため、ダミーデータをハードコーディングする
const dummyTasks: ITask[] = [
  {
    complete: false,
    deadline: moment().add(1, 'day').toDate(),
    id: '0',
    taskName: 'task01',
  },
  {
    complete: true,
    deadline: moment().add(1, 'day').toDate(),
    id: '1',
    taskName: 'task02',
  },
  {
    complete: false,
    deadline: moment().add(-1, 'day').toDate(),
    id: '2',
    taskName: 'task03',
  },
  {
    complete: true,
    deadline: moment().add(-1, 'day').toDate(),
    id: '3',
    taskName: 'task04',
  },
];

/** タスクの一覧を取得する */
export const getTaskList = (dispatch: Dispatch): void => {
  // 別の回で非同期の処理に変更するため関数としている。
  dispatch(showTaskListAction(dummyTasks));
};
```

## Reducer の作成

作成したアクション毎の Reducer の処理を書いていきます。

```ts:src/reducers/TaskReducer.ts
import { reducerWithInitialState } from 'typescript-fsa-reducers';
import { ITaskList } from '../states/ITask';
import {
  showTaskListAction,
  addTaskAction,
  deleteTaskAction,
  toggleCompleteAction,
} from '../actions/TaskActions';

const initState: ITaskList = {
  tasks: [],
};

const taskReducer = reducerWithInitialState<ITaskList>(initState)
  // タスクリストを表示する
  .case(showTaskListAction, (state, payload) => ({
    ...state, // tasks しか無いので本来は必要ないが、プロパティが増えた場合に必要
    tasks: payload,
  }))
  // タスクを追加する
  .case(addTaskAction, (state, payload) => {
    const taskList = [...state.tasks, payload];
    return {
      ...state,
      tasks: taskList,
    };
  })
  // タスクを削除する
  .case(deleteTaskAction, (state, payload) => {
    const taskList = state.tasks.filter(task => task.id !== payload);
    return {
      ...state,
      tasks: taskList,
    };
  })
  // 完了フラグを反転する
  .case(toggleCompleteAction, (state, payload) => {
    const taskList = [...state.tasks];
    const task = taskList.find(task => task.id === payload);
    // 見つからなければ、何もしない。（現在のステートを返す）
    if (!task) {
      return state;
    }
    task.complete = !task.complete;
    return {
      ...state,
      tasks: taskList,
    };
  })
  .build();

export default taskReducer;
```

## 次回

次回は、 CSS in JavaScript の解説と、Component を作っていきます。
