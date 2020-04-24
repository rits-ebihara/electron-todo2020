/* eslint-disable @typescript-eslint/no-explicit-any */
import { getTaskList, showTaskListAction } from '../../src/actions/TaskActions';
import { ITask } from '../../src/states/ITask';

const dispatch = jest.fn(); // --(a)

const loadTaskList = jest.fn();

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
    loadTaskList.mockRejectedValueOnce(new Error());
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
