- [1 日目](https://qiita.com/EBIHARA_kenji/items/25e59f7132b96cb886f3)
- [2 日目](https://qiita.com/EBIHARA_kenji/items/e6da1c3d6d16cf07b60a)
- [3 日目](https://qiita.com/EBIHARA_kenji/items/1a043794014dc2f3a7db)
- [4 日目](https://qiita.com/EBIHARA_kenji/items/80adee2214d439209f98)
- [5 日目](https://qiita.com/EBIHARA_kenji/items/6da1cebb65a18279d096)
- [6 日目](https://qiita.com/EBIHARA_kenji/items/26fa0d004cbaeea807e4)
- 7 日目（この記事）
- [8 日目](https://qiita.com/EBIHARA_kenji/items/41552d664e7a72d867e3)

## 概要

前回までに、ビジネスロジックを記述して、Electron の preload によって読み込まれるところまでを実装しました。

ビジネスロジックは、Action から呼ばれます。Action はビジネスロジックの関数をコールするのですが、非同期のことが多いので、その配慮が必要です。

## ローディングとエラーメッセージのステータス追加

非同期処理では、アクションから結果が変えるまで時間がかかることが多いです。（だからこその非同期処理なのですが。）

処理が終わるまでの間、画面には処理中であることを示す スピナー(ぐるぐるまわるやつ) を表示することにします。

また、非同期処理で失敗した場合のメッセージを表示する必要があります。

これら表示をするためのステータスが必要なので、まずはこれを追加しましょう。

```ts:src/states/ITask.ts
// (略)
/**
 * タスクのリスト
 */
export interface ITaskList {
  /** タスクの一覧 */
  tasks: ITask[];
  /** スキナーの表示 */
  loading: boolean;
  /** 失敗時のメッセージ */
  failedMessage: string;
}
```

reducedr に書いてある初期値の設定も。

```ts:src/reducers/TaskReducer.ts
/**
 * タスクのリストの初期値
 */
const initState: ITaskList = {
  tasks: [],
  loading: false, // <- 追加
  failedMessage: '', // <- 追加
};
// (略)
```

## ローディングのコンポーネントを作成する

スピナーを表示する部品として、コンポーネントを追加します。

```tsx:src/components/Loading.tsx
import React from 'react';
import { keyframes } from 'styled-components';
import { styled } from './FoundationStyles';

interface IProps {
  shown: boolean;
}

const BG = styled.div`
  background: #666;
  height: 100%;
  left: 0;
  opacity: 0.5;
  position: absolute;
  top: 0;
  width: 100%;
`;
const RoundAnimate = keyframes`
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
`;
const SpinnerBox = styled.div`
  align-items: center;
  display: flex;
  height: 100%;
  left: 0;
  position: absolute;
  top: 0;
  width: 100%;
`;
const Spinner = styled.div`
  animation: ${RoundAnimate} 1.1s infinite linear;
  border-bottom: 1.1em solid ${(p): string => p.theme.PRIMARY_1};
  border-left: 1.1em solid ${(p): string => p.theme.PRIMARY_0};
  border-radius: 50%;
  border-right: 1.1em solid ${(p): string => p.theme.PRIMARY_1};
  border-top: 1.1em solid ${(p): string => p.theme.PRIMARY_1};
  font-size: 10px;
  height: 10em;
  margin: 60px auto;
  position: relative;
  transform: translateZ(0);
  width: 10em;
  &:after {
    border-radius: 50%;
    width: 10em;
    height: 10em;
  }
`;

const Loading: React.FC<IProps> = props => {
  if (!props.shown) {
    return null;
  }
  return (
    <div>
      <BG />
      <SpinnerBox>
        <Spinner />
      </SpinnerBox>
    </div>
  );
};

export default Loading;
```

ローディングの表示は、画面全体に半透明なスクリーン(`BG`)を表示、その上にスピナー(`Spinner`)を表示します。

スピナーは、円がグルグル回るアニメーションとしますが、これは GIF アニメーション画像ではなく、CSS の`animation`と`keyframe`を利用して表現しています。

CSS アニメーションについての詳しい解説はこちら。-> https://qiita.com/soarflat/items/4a302e0cafa21477707f

このコンポーネントのプロパティは、表示/非表示を制御する`shown`があります。

これを TaskList コンポーネント内で利用します。

```tsx:src/components/TaskList.tsx
// (略)
import Loading from './Loading'; // <-追加
// (略)
// エラーメッセージ
const errorMessage = useMemo(() => {
  if (!taskList.failedMessage) {
    return null;
  }
  <p>{taskList.failedMessage}</p>;
}, [taskList.failedMessage]);
return (
  <div>
    <Header>TODO</Header>
    <MainContainer>
      <AddTask />
      {errorMessage}
      <TaskList>{taskListElement}</TaskList>
    </MainContainer>
    <Loading shown={taskList.loading} />
  </div>
);
// (略)
```

## アクションの変更

ビジネスロジックで、データの加工を行うので、アクションは大きく変わります。

各ビジネスロジックを呼び出すメソッドを用意する必要があります。

また、アクションは ビジネスロジックでのデータの変更したあとのものを表示するだけなので、追加、削除、状態の変更のアクションは必要なくなります。

アクションは、表示するだけ、と書いたのですが、非同期処理で上で作ったスピナーやエラーメッセージを表示/非表示する必要があります。

`typescript-fsa`では、非同期用のアクションを定義することができ、`actionCreator.async`とするだけで、開始、完了、失敗のアクションが作成できます。

```ts:src/actions/TaskActions.ts
import { actionCreatorFactory } from 'typescript-fsa';
import { ITask } from '../states/ITask';

const actionCreator = actionCreatorFactory('task-actions');

/** タスクの一覧を表示する */
export const showTaskListAction = actionCreator.async<null, ITask[], string>(
  'show-task-list',
);
```

アクションの定義は、上だけでほかは削除します。

これだけで、非同期の開始時 `showTaskListAction.started`、成功時 `showTaskListAction.done`、失敗時 `showTaskListAction.failed` のアクションが生成されます。

`actionCreator.async`のジェネリックの引数は、1 番目がすべてのアクションに追加できる値の型、2 番めが成功したとき、3 番めが失敗したときの型です。

データのロード、追加、削除、状態の変更のそれぞれの関数を同じファイルに書いていきます。

```ts:src/actions/TaskActions.ts
import { Dispatch } from 'redux';
import '../core/ICore';
// (略)

/** タスクの一覧を取得する */
export const getTaskList = async (dispatch: Dispatch): Promise<void> => {
  dispatch(showTaskListAction.started(null)); // --(a)
  const taskList = await window.core.loadTaskList().catch(e => {
    console.error(e);
    dispatch(
      showTaskListAction.failed({
        // --(b)
        error: 'ファイルの読み込みに失敗しました。',
        params: null,
      }),
    );
  });
  if (!taskList) return;
  dispatch(showTaskListAction.done({ result: taskList, params: null })); // --(c)
};

export const addTask = async (
  task: ITask,
  dispatch: Dispatch,
): Promise<void> => {
  dispatch(showTaskListAction.started(null));
  const taskList = await window.core.saveTask(task).catch(e => {
    console.error(e);
    dispatch(
      showTaskListAction.failed({
        error: 'ファイルの書き込みに失敗しました。',
        params: null,
      }),
    );
  });
  if (!taskList) return;
  dispatch(showTaskListAction.done({ result: taskList, params: null }));
};

export const toggleTask = async (
  task: ITask,
  dispatch: Dispatch,
): Promise<void> => {
  dispatch(showTaskListAction.started(null));
  task.complete = !task.complete;
  const taskList = await window.core.saveTask(task).catch(e => {
    console.error(e);
    dispatch(
      showTaskListAction.failed({
        error: 'ファイルの書き込みに失敗しました。',
        params: null,
      }),
    );
  });
  if (!taskList) return;
  dispatch(showTaskListAction.done({ result: taskList, params: null }));
};

export const deleteTask = async (
  taskId: string,
  dispatch: Dispatch,
): Promise<void> => {
  dispatch(showTaskListAction.started(null));
  const taskList = await window.core.deleteTask(taskId).catch(e => {
    console.error(e);
    dispatch(
      showTaskListAction.failed({
        error: 'ファイルの書き込みに失敗しました。',
        params: null,
      }),
    );
  });
  if (!taskList) return;
  dispatch(showTaskListAction.done({ result: taskList, params: null }));
};
```

- (a)...各非同期関数の開始時に、開始アクションを呼んでいます。
- (b)...catch で、失敗したときのアクションを呼んでいます。この場合、戻り値の`taskList`は、undefined となるので、成功アクションが呼ばれないように、その下で判定しています。
- (c)...成功時のアクションを呼んでいます。

## コンポーネントのアクションの呼び出しの変更

追加、削除、ステータス更新のイベントで、上で作成した関数を呼び出すようにします。

```ts:src/components/TaskRow.tsx
// 変更箇所のみ抜粋
import { deleteTask, toggleTask } from '../actions/TaskActions';
//...
// 行をクリックしたときのイベント
const onRowClick = useCallback(() => {
  toggleTask(data, dispatch);
}, [data]);
// 削除ボタンを押した時のイベント
const onDeleteClick = useCallback(
  (e: MouseEvent<HTMLDivElement>) => {
    deleteTask(data.id, dispatch);
    // クリックイベントを親要素の伝播させない
    e.stopPropagation();
  },
  [data.id],
);
```

```ts:src/components/AddTask.ts
// 変更箇所のみ抜粋
import { addTask } from '../actions/TaskActions';
// ...
// 追加ボタンを押した時のイベント
const onClickAddButton = useCallback(() => {
  // 追加アクションを dispatch する
  addTask(
    {
      complete: false,
      deadline,
      taskName,
      id: '',
    },
    dispatch,
  );
}, [deadline, taskName]); // 関数の外の変数を参照しているので、変更を監視する
```

## Redcuer の変更

アクションが変わりましたので、それに合わせて Reducer も修正します。

```ts:src/reducers/TaskReducer.ts
import { reducerWithInitialState } from 'typescript-fsa-reducers';
import { ITaskList } from '../states/ITask';
import { showTaskListAction } from '../actions/TaskActions';

const initState: ITaskList = {
  tasks: [],
  loading: false,
  failedMessage: '',
};

const taskReducer = reducerWithInitialState<ITaskList>(initState)
  // 非同期開始時
  .case(showTaskListAction.started, state => ({
    ...state,
    loading: true,
    failedMessage: '',
  }))
  // 非同期完了時
  .case(showTaskListAction.done, (state, payload) => ({
    ...state, // tasks しか無いので本来は必要ないが、プロパティが増えた場合に必要
    tasks: payload.result,
    loading: false,
    failedMessage: '',
  }))
  // 非同期失敗時
  .case(showTaskListAction.failed, (state, payload) => ({
    ...state,
    loading: false,
    failedMessage: payload.error,
  }))
  .build();

export default taskReducer;
```

## 実行して確認する

ここまでできたら、実行して非同期の動作を確認してみましょう。

```bash
$ npm run build:main && npm run build:render && npm start
# or
$ yarn build:main && yarn build:render && yarn start
```

## 次回

アプリの実装が完了しました。

次回は開発では必須な Jest を使ったテストの実装について書きたいと思います。
