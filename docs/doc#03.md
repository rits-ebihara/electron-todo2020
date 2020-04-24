- [1 日目](https://qiita.com/EBIHARA_kenji/items/25e59f7132b96cb886f3)
- [2 日目](https://qiita.com/EBIHARA_kenji/items/e6da1c3d6d16cf07b60a)
- 3 日目（この記事）
- [4 日目](https://qiita.com/EBIHARA_kenji/items/80adee2214d439209f98)
- [5 日目](https://qiita.com/EBIHARA_kenji/items/6da1cebb65a18279d096)
- [6 日目](https://qiita.com/EBIHARA_kenji/items/26fa0d004cbaeea807e4)
- [7 日目](https://qiita.com/EBIHARA_kenji/items/19b13207b7a8055043c4)
- [8 日目](https://qiita.com/EBIHARA_kenji/items/41552d664e7a72d867e3)

## 概要

前回までに、 webpack を使った TypeScript のビルドと Electron の起動ができるようになりました。

今回は、 React-Redux を使った Skeleton コード的なものを書いていきます。React の基本的な書き方と Redux のデータフローを実感するために、簡単な下記のような画面を作成します。

- テキストボックスに値を入れると、その下に同じものを表示する
- 訪問 ボタンを押すとカウンターをカウントアップする。

![2020-04-21_15h34_13.gif](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/263961/46e415af-8cdc-2c5b-e5a3-a543da868786.gif)

実装に入る前に、Redux について説明しておきます。

## Redux のデータフロー

> 参考: [Redux 入門【ダイジェスト版】10 分で理解する Redux の基礎](https://qiita.com/kiita312/items/49a1f03445b19cf407b7)

Redux はデータとその流れを制御するフレームワークです。

Redux には、いくつかのモジュールに分かれていて、それをカスタマイズしていくことになります。

![react-redux.png](https://qiita-image-store.s3.amazonaws.com/0/263961/1eb8412d-88b0-2b9b-46fc-d4c5c7b6689d.png)

- view
  UI をレンダリングするモジュールで、Redux には含まれません。React が担当します。

  React で記述して、Redux での Store 情報をもとに動的に WebUI をレンダリングします。

  Component とは、 React で書かれた Web のパーツです。Component は、他の Component を参照することもできます。

  Container とは、 React-Redux で store の child_state に連携された Component のことです。アプリ内に複数設けることもできます。UI のトップレベルの Component となります。

  Container はネストできますが、値は必ず store から引き渡されるため、 Container 間のデータの受け渡しはできません。

- action
  view で操作等のイベントで、 stroe のデータを更新する必要がある場合、その更新に必要なデータを格納したオブジェクトです。

- action creator
  action を生成して返すための関数です。引数によって、アクションの値を変えたり、アクションの種類を変えたりします。

  ファイルからデータを取得したり、web api から値を取得する場合など、非同期処理が必要になる場合には、 action creator でその対応をします。（一般的には・・・ケース・バイ・ケースもあり得る）

- reducer
  view から action を送られ、その内容に応じて store の情報を更新するモジュールです。

- store
  データ(state)を保持するモジュール。シングルトン・オブジェクトとなります。

- state
  データそのものです。これもシングルトンのオブジェクトですが、複数の state (ここでは child_state と呼びます) を束ねたものにする場合が多いです。

## ディレクトリ構成

Redux に合わせてファイルの配置を下記のようにします。

```
src
├─ actions            // Redux の Action のディレクトリ
│   └─ UserActions.ts
├─ components         // コンポーネント(React)ファイルのディレクトリ
│   ├─ CountButton.tsx
│   ├─ TextBox.tsx
│   └─ UserForm.tsx
├─ reducers           // Redux の Reducer のディレクトリ
│   └─ UserReducers.ts
├─ states             // Redux の State のインターフェース定義
│   ├─ IUser.ts
│   └─ IState.ts      // 全ステートをバンドルしたインターフェース
├─ index.tsx          // レンダープロセス(Webアプリ)の起点
├─ Store.ts           // ストアの定義
└─ main.ts            // メインプロセスの起点

```

## child_state の作成

`ts/states`ディレクトリを作成し、`IUser.ts`ファイルを作成して、child_state となるデータの構造体をインターフェースとして定義します。

今回は非常に簡単なモデルにします。

また、Redux ではステートの初期値が必要になるので、それもここで宣言しておきます。

```ts:src/states/IUser.ts
/**
 * ユーザー定義
 */
export default interface IUser {
  /** 名前 */
  name: string;
  /** カウント */
  count: number;
}
```

## component の作成

画面に表示するための部品となる、コンポーネントを作成します。

入力支援の効果が体験したいたできれば、コピペではなくタイプして入力してください。

新しい仕様である、React Hooks で書きます。詳しくは公式サイトを確認してください。
[フックの導入 – React](https://ja.reactjs.org/docs/hooks-intro.html)

### ラベル付きテキストボックスの作成

まずは、汎用的なラベル付きのテキストボックスのコンポーネントを作成します。
`src/components`ディレクトリに`TextBox.tsx`ファイルを作成します。

```tsx:src/components/TextBox.tsx
import React, { useMemo, useCallback } from 'react'; // --(a);

// 親コンポーネントから渡されるプロパティを定義する // --(b)
interface IProps {
  /** ラベル文字列 */
  label: string;
  /** テキストボックスのタイプ */
  type: 'text' | `password`;
  /** テキストボックスに表示する値 */
  value: string;
  /** 値の確定時にその値を親プロパティが取得するためにコールバック関数を提供する */
  onChangeText: (value: string) => void;
}

/**
 * ラベル付きのテキストボックスを提供する
 */
const TextBox: React.FC<IProps> = props => {
  // -(c)
  // ラベルコンポーネントをメモ化して毎回判定しないようにする
  const label = useMemo(() => {
    // -(d)
    // ラベルが設定されていない場合は、 label を出力しない
    return !!props.label ? <label>{props.label}</label> : null;
  }, [props.label]);
  const onValueChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      // --(e)
      const value = e.currentTarget.value;
      props.onChangeText(value);
    },
    [props.onChangeText],
  );
  return (
    <span>
      {label /* --(f) */}
      <input
        name="username"
        type={props.type /* --(g)*/}
        value={props.value /* --(h) */}
        onChange={onValueChange}
      />
    </span>
  );
};

export default TextBox; // 他のファイルから参照できるようにする。
```

コードの説明です。

- (a): react ライブラリの参照宣言です。
- (b): このコンポーネントの公開プロパティです。これを利用する親コンポーネントから渡される値の定義を宣言します。
- (c): 関数としてコンポーネントを定義します。ジェネリック型引数はプロパティの型を示し、関数の引数（ここでは`props`）がプロパティになります。
- (d): 動的なエレメントを変数に割当てます。`label`オブジェクトは、`JSX.Element | null`という複合型になります。`useMemo`を使うことで、再レンダリング時にこの処理が必要なときのみ処理するようにしています。(後述)
- (e): `<input>`の onChange イベントにわたす関数を定義しています。useCallback を使うことで、再レンダリング時に関数が必要なときのみ更新するようにしています。(後述)
- (f): (d)で変数にセットしたエレメントをここに展開します。`label`が`null`の場合は、何も出力されません。動的な項目は、{}でくくります。
- (g): HTML の input を定義します。属性は "" でくくるが、動的な値の場合は、{} でくくります。  
  ほとんどの HTML の属性が利用できますが、class など、JavaScript の予約語となっているものは利用できないので、className と属性名が変わるものもあります。
- (h): input の value は、外部から渡された value プロパティを参照しています。それは親のコンポーネントから渡されるものです。そのため、テキストボックスの入力値で、親のプロパティの値を更新しないと、値の変更がされず、値が入力できません。  
   Redux を利用する場合、reducer を通して stroe を更新し、その変更をコンポーネントで受ける事となります。  
   イベントハンドラの引数は、イベントが発火された DOM Element となります。

### 訪問ボタンの作成

上のテキストボックス同じように作ります。

こちらは、動的な要素や関数を置き換える必要がないので、テキストボックスよりシンプルです。

```tsx:src/components/CountButton.tsx
import React from 'react';

interface IProps {
  count: number;
  label: string;
  onClick: () => void;
}

const CountButton: React.FC<IProps> = props => {
  return (
    <>
      <button onClick={props.onClick}>{props.label}</button>
      <span style={{ marginLeft: '1em' }}>{props.count}</span>
    </>
  );
};

export default CountButton;
```

`<> </>`は、[フラグメント](https://ja.reactjs.org/docs/fragments.html)というものです。

### ユーザー名入力画面の作成

`UserForm.tsx`ファイルを作成します。

このコンポーネントは、後ほど react-redux で　 store と連携させます。

そうすることで、store が変更したときに、このコンポーネントのプロパティの変更と再レンダリングを自動化します。

```jsx:src/components/UserForm.tsx
import React, { useCallback } from 'react';
import IUser from '../states/IUser';
import CountButton from './CountButton';
import TextBox from './TextBox';

// プロパティの型に IUser が指定していますが、これは後で書き換えます。
const UserForm: React.FC<IUser> = props => {
  const { name, count } = props;
  const onNameChange = useCallback((value: string) => {
    // --(a)
    // 名前を変更したとき(タイプするたび)のイベント
    // 後で実装
  }, []); // [] は初回のみという意味
  const onCountClick = useCallback(() => {
    // --(a)
    // 訪問ボタンを押したときのイベント
    // 後で実装
  }, []);
  return (
    <div>
      <p>
        <TextBox value={name} label="ユーザー名" onChangeText={onNameChange} />
        {/*--(b)*/}
      </p>
      <p>
        <CountButton count={count} label="訪問" onClick={onCountClick} />
        {/*--(b)*/}
      </p>
    </div>
  );
};

export default UserForm;
```

コードの説明です。

- (a): テキストが変更されたとき、ボタンを押したときのコールバック関数を定義します。action を store の dispatch で reducer に送るコードを書きますが、まだそれらを定義していないので、後から書きます。
- (b): 上で作ったコンポーネントを利用します。このように、作成したコンポーネントを HTML 要素のように利用することができます。

## action と action creator の作成

テキストボックスの内容を変更されたときのアクションを作っていきます。

`src/actions`ディレクトリに、`UserActions.ts`ファイルを作成します。

TypeScript ではアクションの型定義が必要で、記述が冗長的になりがちですが、[typescript-fsa](https://github.com/aikoven/typescript-fsa)を使うことで、非常にライトに記述することができます。

```bash
$ npm install --save typescript-fsa
# or
$ yarn add typescript-fsa
```

```ts:src/actions/UserActions.ts
import { actionCreatorFactory } from 'typescript-fsa';
import IUser from '../states/IUser';

// action creator を作成する
// 引数は、アクションのグループごとに一意
// ファイル単位で、1つの creator があれば良い
const actionCreator = actionCreatorFactory('user-action');

// アクションの定義
// 引数は（同じ creator から生成される）アクションごとに一意
export const changeUserAction = actionCreator<Partial<IUser>>('change-user');
```

`actionCreator`のジェネリックの引数\<\>には、アクションで渡す型を宣言します。
Action を生成するときには、この型の引数のオブジェクトを渡し、Reducer ではそれがそのまま取得できます。

`Partial<IUser>`というのは、TypeScript の機能で、IUser のプロパティがすべて任意になった型に変換します。
なので、ここでアクションとして渡す値は、IUser のプロパティの一部、ということになります。

## reducer を作成する

Reducer は、view から action を渡され(dispatch され)て、store の値を変更します。

これも、TypeScript では入ってくる Action の型が様々で、その定義が難しいのですが、[typescript-fsa-reducers](https://github.com/dphilipson/typescript-fsa-reducers)を利用すると、シンプルに書けます。

`src/reducers`ディレクトリに、`UserReducer.ts`を作成します。

```ts:src/reducers/UserReducer.ts
import { reducerWithInitialState } from 'typescript-fsa-reducers';
import { changeUserAction } from '../actions/UserActions';
import IUser from '../states/IUser';

// Stateの初期値
const initUser: IUser = {
  count: 0,
  name: '',
};

const userReducer = reducerWithInitialState<IUser>(initUser)
  // Action ごとに`.case`をメソッドチェーンでつなぐ
  // 1番目の引数は、アクション、2番めが処理の関数
  // 処理の関数の引数は、1番目が変更前の State、2番めが Action の値
  // 必ず、Stateと同じ型(ここでは、IUser)のオブジェクトを return する必要がある。
  // payload はここでは、Actionで指定した`Partial<IUser>`の型のオブジェクト。
  .case(changeUserAction, (state, payload) => ({
    ...state,
    ...payload,
  }))
  // 上は、下記と同じ意味
  // const user = Object.assign({}, state, payload);
  // return user;
  .build();

export default userReducer;
```

新しいライブラリが登場しています。オブジェクトのクローンを行うものです。

```bash
$ npm install --save clone && npm install --save-dev @types/clone
```

各`.case()`では、State の内容を変更して返す必要がありますが、引数の state の値を直接変えても、child_state が変更されたとみなされないため、view に変更通知が行きません。

```ts
// 悪い例
.case(changeUserAction, (state, payload) => {
  state.name = payload.name
  return state;
};
```

オブジェクトの複製を行い、別オブジェクトとして return する必要があります。

## store を作成する

state を束ねる store を作ります。（名前が似ているので、混同しないでください）

意外なこと？に、store は、reducer を参照して作ります。

まずは、複数あるの child_state を束ねるインターフェースを定義します。
ここでは 1 つなので本来は不要ですが、複数ある場合が多いと思いますので、ここでは作っておきます。

```ts:states/IState.ts
import IUser from './IUser';

export interface IState {
  user: IUser;
  // state が増えたら ここに追加する。
}
```

store は src ディレクトリの直下に`Store.ts`ファイルを作ることとします。

```ts:src/store.ts
import { combineReducers, createStore } from 'redux';
import { IState } from './states/IState';
import userReducer from './reducers/UserReducer';

// 複数の reducer を束ねる
const combinedReducer = combineReducers<IState>({
  // --(a)
  user: userReducer,
  // reducer が増えたら足していく
});

// グローバルオブジェクトとして、store を作成する。
export const store = createStore(combinedReducer); // --(b)

// import store from './Store' とアクセスできるように default として定義する
export default store;
```

- (a): 本来　 reducer はシングルトンのオブジェクトですが、アプリの規模によっては複数に分けて管理したいです。そのため、分けた reducer をこの関数で１つに束ねることができます。  
  ジェネリック引数には、上で定義した複数の State を束ねた IState の型を割り当てるようにします。  
  関数の引数には、そのデータ型と同じメンバー名を持つようにし、それぞれの state に対応する reducer 関数を割り当てます。
- (b): store を作成します。引数には、reducer を１つに束ねた CombineReducer のオブジェクトを渡します。

## store と component を連結させる

一通りのものが揃いましたが、まだ react と redux の連結ができていません。component でその設定をします。

すべてのコンポーネントで連携する必要はありません。先に述べた、container となるコンポーネントを redux と連携します。

UserForm.tsx

```jsx
import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { changeUserAction } from '../actions/UserActions';
import { IState } from '../states/IState';
import IUser from '../states/IUser';
import CountButton from './CountButton';
import TextBox from './TextBox';

// データは、Storeから渡されるので、プロパティは必要ありません。
const UserForm: React.FC = () => {
  // useSelector でステートの変更を受け取れます。
  const { name, count } = useSelector<IState, IUser>(a => a.user); // -- (a)
  const dispatch = useDispatch(); // -- (b)
  const onNameChange = useCallback((value: string) => {
    // 名前を変更したとき(タイプするたび)のイベント
    dispatch(changeUserAction({ name: value }));
  }, []); // [] は初回のみという意味
  const onCountClick = useCallback(() => {
    // 訪問ボタンを押したときのイベント
    dispatch(changeUserAction({ count: count + 1 }));
    // 関数外の変数は、関数が(再)定義されたときのものに固定化されるので、
    // 関数外の変数を使用するときには、下記のように第2引数の配列にそれを指定して、
    // それが変更されたときに再定義されるようにする
  }, [count]);
  return (
    <div>
      <p>
        <TextBox value={name} label="ユーザー名" onChangeText={onNameChange} />
      </p>
      <p>
        <CountButton count={count} label="訪問" onClick={onCountClick} />
      </p>
    </div>
  );
};

export default UserForm;
```

コードの説明をします。

- (a): `useSelector`を利用することで、state からこのコンポーネントのプロパティな値（child_state）を取り出すことができます。Store の連結はこれだけです。これだけで Store が変更したときに、再レンダリングされる仕組みはフレームワークが行うので、意識する必要はないです。
- (b): `useDispatch`を利用することで、Action を Reducer に送信する`dispatch`関数を取得することができます。

## HTML へのレンダリング

最後に、`index.tsx`を変更します。
container component を HTML の element に渡します。

redux container を割り当てるには、redux が用意している Provider component 経由で行います。

index.tsx

```jsx
import React from 'react';
import ReactDom from 'react-dom';
import { Provider } from 'react-redux'; // 追加
import UserForm from './components/UserForm'; // 追加
import Store from './Store'; // 追加

const container = document.getElementById('contents');
ReactDom.render(
  // 変更 -->
  <Provider store={Store}>
    <UserForm />
  </Provider>,
  // <-- 変更
  container,
);
```

## ビルドして動作確認する。

下記コマンドでビルドします。

> ビルドとアプリの起動については、２日目の記事をご確認ください。

```bash
$ npm run build:render
# or
$ yarn build:render
```

エラーなくビルドが終わったら、アプリを起動してみます。

```bash
$ npm start
```

このページの先頭に貼ってあった画像のような動作になりましたか？

## React Hooks の useXXX について

### React Hooks とは

React Hooks とは、React の Component をクラスではなく、関数で記述することができ、React の機能をフックと言われる関数を使って実装する事ができるものです。

### Hooks の種類

フックの関数は慣習で、`useXXXX` のような名前がつけられています。

主なフックには、下記があります。

- useState  
  (ローカル)ステートを宣言する
- useEffect()  
  副作用フック。レンダリング時に(第 2 日引数の条件の指定がなければ)毎回実行される。
  クラスでの componentDidMount や componentWillUnmount のようなライフサイクルの分かりとなるもの。非同期に実行される。
- useLayoutEffect()
  useEffect と基本的に同じ。ただし、同期的に処理される。useEffect を優先的に使用し、非同期処理のために問題がある場合に利用するのが良い。
- useContext()  
  React Context の機能を利用しやすくするためのフック。
- useCallback()
  関数をメモ化するためのフック
- useMemo()
  値やオブジェクトをメモ化するためのフック。
- useRef()
  子コンポーネントをオブジェクトとして参照するためのフック。

自作の Hooks を作成することもできる。

> 詳細はこちらの公式ドキュメントを参照のこと
> [フックの導入 – React](https://ja.reactjs.org/docs/hooks-intro.html)

下記は、Redux を利用するときに追加されるフックです。(React-Redux のライブラリで導入される)

- useSelector()
  Redux のストアから値を取得するためのフック。これを利用することで、`mapStateToProps`や`connect`を使用して連携する必要はなくなる。
- useDispatch()
  ストアオブジェクトを参照しなくても、`dispatch`を取得するためのフック。
- useStore()
  ストアを参照するためのフック。通常は使用する必要はない。積極的に使用しないようにする。

> 詳細はこちらを参照のこと。
> [Hooks · React Redux](https://react-redux.js.org/api/hooks)

## Hooks を利用するための注意点

コンポーネント関数のトップのみで使用する。`if`や`for`の中で宣言しない。  
また、コンポーネント関数の外部で宣言しない。(カスタム Hooks は例外)

## React Hooks の例

```tsx
import React, { useCallback, useState, useEffect, useMemo } from 'react';

interface IProps {
  name: string;
  date: Date;
}

const HelloReact: React.FC<IProps> = props => {
  // useState を使うことで、簡単に state の定義ができる。引数は初期値を指定する。
  // useState の戻り値は配列で、1番目にステートの変数、2番めに変更するためのメソッドとなる。
  // それを配列の分割代入の機能を使って変数に割り当てている。
  // 複数回使用できるので、複雑なオブジェクトにする必要はない。
  const [greeting, setGreeting] = useState<string>('');
  const [count, setCount] = useState<number>(0);

  // 第2引数の値が変更されるたびに実行する処理
  // 初回のみ実行したい場合は、第2引数に `[]`を指定する。
  // この例では、props.date が変更されるたびに実行する。
  // この例の処理では、ステートの変更を行っているが、これであれば下にある useMemo でもよい。
  // 例えば、WebAPIからデータを取得するなどの処理をここに書く。
  useEffect(() => {
    const g = props.date.getHours() < 12 ? 'おはよう' : 'こんにちは';
    setGreeting(g);
  }, [props.date]);

  // useMemo でメモ化することで、必要なときだけ処理を行うことができる。
  // (もっともこの程度であればメモ化する必要はないが・・・)
  // 第2引数は、useEffect と同じで、この値に変更があった場合に処理
  const greetingMemo = useMemo(() => {
    return props.date.getHours() < 12 ? 'おはよう' : 'こんにちは';
  }, [props.date]);

  // useCallback でイベントハンドラの関数をメモ化することで、不要なレンダリングを防ぐ
  // ただし、関数外の変数(ステータスも含め)を参照する場合、その変数の値は、
  // この関数が生成されたときのものに固定化される（他の hook も同様）ので、
  // state を参照する場合などは、第2引数にその変数をいれて再度関数を作り直す必要がある。
  // 公式ドキュメントによれば、関数の再作成の重さはクロージャの処理と同等とのこと。
  const onCountButtonClick = useCallback(() => {
    setCount(count + 1);
  }, [count]);
  return (
    <div>
      <h1>Hello React Hook!!</h1>
      <div>
        <p>
          (state): {greeting}! {props.name}さん!
        </p>
        <p>
          (memo): {greetingMemo}! {props.name}さん!
        </p>
      </div>
      <div>
        count: {count}
        <button onClick={onCountButtonClick}>+1</button>
        {/* 以下は NG */}
        {/* onClick に直接関数を書と、内容は同じでも毎回新しい関数が生成されるため、再レンダリングが走る */}
        {/* <button onClick={() => {setCount(count + 1);}}>+1</button> */}
      </div>
    </div>
  );
};

export default HelloReact;
```

## 次回

次回からは、より実践的なアプリの作成を作っていきます。
