- [1 日目](https://qiita.com/EBIHARA_kenji/items/25e59f7132b96cb886f3)
- [2 日目](https://qiita.com/EBIHARA_kenji/items/e6da1c3d6d16cf07b60a)
- [3 日目](https://qiita.com/EBIHARA_kenji/items/1a043794014dc2f3a7db)
- [4 日目](https://qiita.com/EBIHARA_kenji/items/80adee2214d439209f98)
- 5 日目（この記事）
- [6 日目](https://qiita.com/EBIHARA_kenji/items/26fa0d004cbaeea807e4)
- [7 日目](https://qiita.com/EBIHARA_kenji/items/19b13207b7a8055043c4)
- [8 日目](https://qiita.com/EBIHARA_kenji/items/41552d664e7a72d867e3)

前回は、TODO アプリの Store、Action、Reducer まで作成しました。

今回は、Component を作っていきますが、その前に styled-components の話をします。

## styled-components

### 概要

今回は CSS を使って装飾をするのですが、CSS ファイルを作成するのではなく、SASS などの AltCSS を使うわけでもなく、CSS in JavaScript を使って見たいと思います。

従来の CSS や AltCSS を別ファイルとして管理する場合、定義したクラス名と JavaScript での実装と離れているので、下記のような問題があります。

- どこで何が使われているのかわかりにくい。未使用のものの検出が困難。
- スペルミスした場合に実行時にしかわからない。
- BEM による命名規則では、冗長的で長すぎる。
- BEM の思想はブロック単位に独立していることだが、これがコーディング規約で守られにくい。

CSS in JavaScript を実現するために、 [styled-components](https://www.styled-components.com/) というライブラリを利用します。

これを利用することで、

- Component 単位で定義するので、スタイルの定義と利用箇所が同じファイル内でわかりやすい。
- ビルド時に、未使用のものやスペルミスなどの検出ができる。
- クラス名は、ビルド時に一意なものに自動的に振られるので、命名規則に頭を悩ませなくて良い。
  - 実行時にどのスタイルがあたっているか分かりにくい、という欠点も併せ持ちます。
- Component 単位で定義するので、独立性が保ちやすい。（完全に独立性が保たれるわけではない）

> React は、jQuery などこれまでの「構造（HTML）に後付で処理を追加する」という手法から、「振舞いを持つ構造」 という UI 指向の手法にシフトさせる目的がありました。
> スタイル が、この思想に外れていたのですが、styled-components で 振舞いと装飾を持った構造 で管理することができるようになりました。

### 使用例

```tsx
import Styled from 'styled-component';

const RedBox = Styled.div`
    background-color: red;
    color: white;
`;

export const Component1: React.FC = () => {
    public render() {
        return (
            <RedBox>
                赤いよ
            </RedBox>
        );
    }
}
```

上記のように、`Styled.div` として、バッククオートを続けてその中に CSS を文字列として定義します。

戻り値は、React の Component を拡張したクラスのオブジェクトが返るので、Component の render でそれを タグとして記載することで、実行時には 指定されたスタイルが適用された div 要素が出力されます。

`div` の部分には、 `p` や `input`、`span` など HTML として出力したいタグと同じ名前を指定します。

CSS の記述は、JavaScript としては単純な文字列なので、色を変数として持たせて、それを共有することもできます。

> HTML では インライン スタイル で作成されるような気がしますが、実際には HTML の head に style タグが作成され、その中に記載されます。  
> よって、@media や @keyframe など インライン スタイル で使えないものも、styled-components では利用できます。

### styled-component のインストール

```bash
$ npm install --save styled-components && npm install --save-dev @types/styled-components
# or
$ yarn add styled-components && yarn add -D @types/styled-components
```

`@types/styled-components` を入れると、同時に `@types/react-native` が入ってしまし、これが TypeScript のコンパイルエラーとなってしまいます。

yarn を使っている場合、`.yarnclean` ファイルを作成し、`@types/react-native`を書いて、これを除外するようにします。

> npm の場合のうまいやり方を知りません・・・バッチで削除するしか無い？

```text:.yarnclean
@types/react-native
```

`.yarnclean`があれば、`yarn add`したときに自動的に削除してくれます。明示的に実行するには下記のコマンドを実行します。

```bash
$ yarn autoclean --force
```

## グローバルスタイルとテーマの実装

コンポーネントを作成する前に、ブラウザのデフォルトスタイルのリセットと、html,body 要素へのスタイル、全体の配色を統一するために、テーマの定義を行います。

スタイルのリセットですが、 [reset-css](https://github.com/shannonmoeller/reset-css) という CSS ライブラリを利用します。

```bash
$ npm install --save reset-css
# or
$ yarn add reset-css
```

これでダウンロードできるのは、CSS ファイルなので、通常であれば HTML の head に link タグで記述しないといけないのですが、webpack を利用すると CSS ファイルも JavaScript で import で取り込めてしまいます。

```ts:src/components/FoundationStyles.ts
import 'reset-css/reset.css';

import baseStyled, {
  createGlobalStyle,
  ThemedStyledInterface,
} from 'styled-components';

// グローバル スタイル 定義
// tslint:disable-next-line:no-unused-expression
export const GlobalStyle = createGlobalStyle`
    html, body {
        font-family: "Meiryo UI";
        font-size: 12pt;
        height: 100vh;
        width: 100vw;
    }
    button {
        background-color: #ccc;
        border-radius: 5px;
        border-style: none;
        cursor: pointer;
        padding: .5em;
        transition-property: all;
        transition-duration: .2s;
        &:hover {
            box-shadow: 3px 3px 3px rgba(200,200,200,4);
            transform: translate(-2px, -2px);
        }
        &:active {
            background-color: #cccc00;
        }
    }
    input[type=text] {
        border-radius: 5px;
        border: 1px solid #ddd;
        padding: .5em;
    }
`;

// テーマの設定
// SASS style sheet */
// Palette color codes */
// Palette URL: http://paletton.com/#uid=54r1g0knvBjdsPDiZI7sCwOvApZ */

// Feel free to copy&paste color codes to your application */

// As hex codes */
export const theme = {
  PRIMARY_0: '#723FBD', // MAIN PRIMARY COLOR */
  PRIMARY_1: '#AE8CE2',
  PRIMARY_2: '#8C5FCF',
  PRIMARY_3: '#5A21AF',
  PRIMARY_4: '#410E8D',
  SECONDARY_1_0: '#30B698', // MAIN SECONDARY COLOR (1) */
  SECONDARY_1_1: '#81DFCA',
  SECONDARY_1_2: '#52CAAF',
  SECONDARY_1_3: '#12A785',
  SECONDARY_1_4: '#028568',
  SECONDARY_2_0: '#FF5644', // MAIN SECONDARY COLOR (2) */
  SECONDARY_2_1: '#FF9E94',
  SECONDARY_2_2: '#FF7668',
  SECONDARY_2_3: '#FF311B',
  SECONDARY_2_4: '#CF1603',
  FOREGROUND: '#333',
  FOREGROUND_REVERSE: '#fff',
};

export type Theme = typeof theme;

export const styled = baseStyled as ThemedStyledInterface<Theme>;
```

> 配色パターンは、 http://paletton.com で作成しました。

CSS をインポートするために、 webpack のローダーと config ファイルを修正します。

ローダーには、 `css-loader` と `style-loader` というものを利用します。

```bash
$ npm install --save-dev style-loader css-loader
# or
$ yarn add style-loader css-loader
```

webpack.config.js の、module.rules に下記を追加します。

```js
module.exports = {
  // 省略
  module: {
    rules: [
      // 省略
      {
        test: /\.css$/,
        loaders: ['style-loader', 'css-loader'],
      },
    ],
  },
};
```

## Component の作成

Component は、State と連携させる Container となる TaskList.tsx と、リストの各行の要素を TaskRow.tsx 、新規登録部分の要素を AddTask.tsx として作成します。

また、日付を表示するのに、date 型の値から書式を指定した文字列変換が必要です。

日付や時刻を操作するのに、[moment](https://momentjs.com/) という JavaScript 界隈では非常にメジャーなライブラリがあるので、インストールしておきます。

```bash
$ npm install --save moment && npm install --save-dev @types/moment
# or
$ yarn add moment && yarn add -D @types/moment
```

> moment 公式サイト https://momentjs.com/

### タスクリストのタスクごとの部品を作成する

まずは、タスクリストの各行の component を作ります。

```tsx:src/components/TaskRow.tsx
import moment from 'moment';
import React, { useCallback, useMemo, MouseEvent } from 'react';
import { useDispatch } from 'react-redux';
import { deleteTaskAction, toggleCompleteAction } from '../actions/TaskActions';
import { ITask } from '../states/ITask';
import { styled } from './FoundationStyles';

// #region styled
/**
 * 行の大外枠...(1)
 */
const Task = styled.div<{ expiration: boolean }>`
  align-items: center;
  background-color: ${(p): string =>
    p.expiration ? 'inherit' : p.theme.SECONDARY_2_0};
  border-radius: 5px;
  cursor: pointer;
  border: 1px solid rgb(200, 200, 200);
  display: flex;
  flex-direction: row;
  margin-bottom: 1em;
  padding: 10px;
  transition-duration: 0.2s;
  transition-property: all;
  /* (2) */
  &:hover {
    transform: translate(-5px, -5px);
    box-shadow: 5px 5px 5px rgba(200, 200, 200, 4);
  }
`;
/**
 * タスク完了のチェックアイコン表示 枠
 */
const TaskCheckBox = styled.div`
  align-items: center;
  background-color: #fff;
  border: 2px solid #ccc;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  flex-grow: 0;
  flex-shrink: 0;
  height: 2em;
  width: 2em;
`;
/**
 * タスク完了チェックアイコン
 */
const TaskCheck = styled.p`
  color: ${(p): string => p.theme.SECONDARY_1_3};
  font-size: 150%;
`;
/**
 * タスク名と期日の表示 枠
 */
const TaskBody = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  flex-shrink: 0;
  height: 3em;
  justify-content: space-around;
`;
/**
 * タスク削除アイコン
 */
const TaskRemove = styled.div`
  flex-grow: 0;
  flex-shrink: 0;
`;
/**
 * タスク名
 */
const TaskName = styled.div`
  font-size: 120%;
`;

/**
 * 期日
 */
const Deadline = styled.div``;

// #endregion

const TaskRow: React.FC<{ data: ITask }> = props => {
  const { data } = props;
  const dispatch = useDispatch();
  // 未完了で有効期限を超過していないか
  const expiration = useMemo(() => {
    return new Date() < data.deadline || data.complete;
  }, [data.deadline, data.complete]);
  // 期限の表示書式に合わせた変換
  const deadlineString = useMemo(() => {
    return moment(data.deadline).format('YYYY-MM-DD HH:mm');
  }, [data.deadline]);
  // 行をクリックしたときのイベント
  const onRowClick = useCallback(() => {
    dispatch(toggleCompleteAction(data.id));
  }, [data.id]);
  // 削除ボタンを押した時のイベント
  const onDeleteClick = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      dispatch(deleteTaskAction(data.id));
      // クリックイベントを親要素の伝播させない
      e.stopPropagation();
    },
    [data.id],
  );
  // -----------------
  // レンダリング
  return (
    <Task expiration={expiration} onClick={onRowClick}>
      <TaskCheckBox>
        <TaskCheck>{data.complete ? '✔' : null}</TaskCheck>
      </TaskCheckBox>
      <TaskBody>
        <TaskName>{data.taskName}</TaskName>
        <Deadline>⏰{deadlineString}</Deadline>
      </TaskBody>
      <TaskRemove onClick={onDeleteClick}>❌</TaskRemove>
    </Task>
  );
};

export default TaskRow;
```

- (1)... styled のコンポーネントに引数を付けて、それによって CSS を変化させる場合、引数をジェネリック型で記述し、文字列の中でソースにあるような関数を宣言します。
- (2)... sass 記述の一部が利用できます。

styled-components の記述で長くなっていますが、肝心のコンポーネントの部分は、プロパティとして受けたデータ(ITask 型のオブジェクト)を使った表示のみの記述になっており、シンプルになっています。

日付の表示の変換や、クリックのイベント処理は、`useMemo`や`useCallback`を使って、関数がレンダリングされるごとに新しく作られないようにしています。

このように、Redux のフレームワークを利用することで、表示の部分とデータの更新の部分が分離でき、ソースが管理しやすくなっていることがわかると思います。

### タスク追加部分の部品を作成する

続けて、タスクを追加する component を作ります。

その前に、ここでは日時の入力に、 [react-datepicker](https://github.com/Hacker0x01/react-datepicker) というライブラリを利用しますのでインストールしておきます。

```bash
$ npm install --save react-datepicker && npm install --save-dev @types/react-datepicker
# or
$ yarn add react-datepicker && yarn add -D @types/react-datepicker
```

```tsx:src/components/AddTask.tsx
import moment from 'moment';
import React, { ChangeEvent, useCallback, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css'; // --(a)
import { useDispatch } from 'react-redux';
import styled from 'styled-components';
import { addTaskAction } from '../actions/TaskActions';

// #region styled
const Container = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  margin: 1em 0;
  width: 100%;
`;

const TextBox = styled.input`
  box-sizing: border-box;
  width: 100%;
`;

const TaskNameBox = styled.p`
  flex-grow: 1;
`;

const DeadlineBox = styled.div``;

const AddButton = styled.button`
  background-color: ${(p): string => p.theme.SECONDARY_1_3};
  border-radius: 50%;
  color: white;
  display: block;
  font-size: 150%;
  height: 40px;
  padding: 0;
  width: 40px;
`;

// #endregion
const AddTask: React.FC = () => {
  // Redux の dispatch 関数を取得する --(b)
  const dispatch = useDispatch();
  // タスク名と期限を local state として定義する --(c)
  const [deadline, setDeadline] = useState<Date>(
    moment().add('day', 1).toDate(),
  );
  const [taskName, setTaskName] = useState<string>('');
  // タスク名が変更したとき(タイプしたとき)のイベント
  const onChangeTaskName = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setTaskName(e.currentTarget.value);
  }, []);
  // 期限が変更したとき(タイプしたとき)のイベント
  const onChangeDeadLine = useCallback((date: Date) => {
    setDeadline(date);
  }, []);
  // 追加ボタンを押した時のイベント
  const onClickAddButton = useCallback(() => {
    // 追加アクションを dispatch する
    dispatch(
      addTaskAction({
        complete: false,
        deadline,
        taskName,
        id: '',
      }),
    );
  }, [deadline, taskName]); // 関数の外の変数を参照しているので、変更を監視する
  return (
    <Container>
      <TaskNameBox>
        <label>
          task name
          <TextBox type="text" value={taskName} onChange={onChangeTaskName} />
        </label>
      </TaskNameBox>
      <DeadlineBox>
        <label>
          dead line
          <DatePicker
            selected={deadline}
            showTimeSelect={true}
            dateFormat="yyyy-MM-dd HH:mm"
            onChange={onChangeDeadLine}
          />
        </label>
      </DeadlineBox>
      <AddButton onClick={onClickAddButton}>+</AddButton>
    </Container>
  );
};

export default AddTask;
```

- (a)... react-datepicker のためのスタイルを読み込みます。
- (b)... 追加ボタンをクリックしたときに、Redux の`dispatch`を呼び出す必要がありますが、その関数を取得しています。
- (c)... `useState`を使って、ローカルステート(コンポーネント内で有効なステート)を宣言します。`useState`の戻り値は配列で、1 番目にステートの変数、2 番めにステートを変更するための関数が渡されます。それを配列の分割代入で変数に割り当てます。  
  テキストボックスなどの値として、ステートの変数を、 onChange のイベントで、ステートを変更する関数を呼んでいます。

### タスクリストとタスク追加を表示する画面を作成する

このコンポーネントが、Redux の Store と連携する"Container"となります。

```jsx:src/components/TaskList.tsx
import React, { useMemo, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { IState } from '../states/IState';
import { ITask, ITaskList } from '../states/ITask';
import AddTask from './AddTask';
import { styled } from './FoundationStyles';
import TaskRow from './TaskRow';
import { getTaskList } from '../actions/TaskActions';

// #region styled
const MainContainer = styled.div`
  margin: 10px auto 0 auto;
  max-width: 600px;
  min-width: 300px;
  width: 80%;
`;

const Header = styled.h1`
  background-color: ${(p): string => p.theme.PRIMARY_3};
  color: ${(p): string => p.theme.FOREGROUND_REVERSE};
  font-size: 160%;
  padding: 1em;
  text-align: center;
`;

const TaskList = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 1em;
`;
// #endregion

const createTaskList = (tasks: ITask[]): JSX.Element[] => {
  return tasks
    .sort((a, b) => {
      return a.deadline < b.deadline
        ? -1
        : a.deadline.getTime() === b.deadline.getTime()
        ? 0
        : 1;
    })
    .map(it => {
      return <TaskRow key={it.id} data={it} />;
    });
};

const TaskListContainer: React.FC = () => {
  const dispatch = useDispatch();
  useEffect(() => {
    getTaskList(dispatch);
  }, []); // --(a)
  const taskList = useSelector<IState, ITaskList>(a => a.taskList); // --(b)
  const taskListElement = useMemo(() => {
    return createTaskList(taskList.tasks);
  }, [taskList.tasks]); // --(c)
  return (
    <div>
      <Header>TODO</Header>
      <MainContainer>
        <AddTask />
        <TaskList>{taskListElement}</TaskList>
      </MainContainer>
    </div>
  );
};

export default TaskListContainer;
```

コードの説明です。

- (a)...`useEffect`で定義した関数は、コンポーネントがレンダリングされるたびに実行されます。ただし、2 番めの引数が指定されている場合、その配列のいずれかの値が変更されると、そのときだけ実行する、と言う動作をします。空の配列`[]`を指定すると、初回のみ実行します。  
  ここでは、初回に既存のタスクリストを読み込む処理を呼んでいます。
- (b)...`useSelector`で、Redux の State と連結します。
- (c)...`useMemo`でレンダリングする Element を変数としています。再レンダリングで、`taskList`に変化がない場合、無駄なレンダリングが起こらないようにしています。

## index.tsx の修正

最後に、作成した container (TaskList) を画面に表示するように、index.tsx を修正します。

また、全体のスタイルを割り当てます。

```jsx:src/index.tsx
import React from 'react';
import ReactDom from 'react-dom';
import { Provider } from 'react-redux';
import { ThemeProvider } from 'styled-components';
import { GlobalStyle, theme } from './components/FoundationStyles';
import TaskListContainer from './components/TodoList';
import Store from './Store';

const container = document.getElementById('contents');

ReactDom.render(
  <Provider store={Store}>
    {/* テーマを適用する */}
    <ThemeProvider theme={theme}>
      {/* 全体のスタイルを適用する */}
      <GlobalStyle />
      <TaskListContainer />
    </ThemeProvider>
  </Provider>,
  container,
);
```

> ThemeProvider は、styled-component v テーマを定義して動的に切り替える事ができる仕組みです。
> ここでは、単一のテーマしか用意していないので、`theme={{}}` としています。

## とりあえず動かしてみる

これで、とりあえずビルドして動作するところまでできました。

```bash
$ npm run build:main && npm run build:render && npm start
# or
$ yarn build:main && yarn build:render && yarn start
```

下記のように画面が出たでしょうか？

> 真っ白で何も出ない場合は、開発者ツールのコンソールに下記エラーが出ていないでしょうか？
> `index.js:3 Uncaught ReferenceError: global is not defined`
> この場合、`index.html`に下記を`<head> ~ </head>`内に追加してみてください。
> `<script>window.global = window;</script>`
> 参考: [deep-equal を使うとエラー：Uncaught ReferenceError: global is not defined - サンダーボルト](https://naotech.hatenablog.com/entry/2020/04/03/122406)

![5.todo_2.png](https://qiita-image-store.s3.amazonaws.com/0/263961/cbc7a0ae-9802-5598-5f3d-32b001209aef.png)

タスクのリスト表示、タスクの完了／未完了のトグル、タスクの削除、タスクの追加は、問題なく動作すると思います。

次回は、ローカルファイルからのデータの取得や保存を行いたいところですが、その前に Electron のセキュリティについて説明したいと思います。
