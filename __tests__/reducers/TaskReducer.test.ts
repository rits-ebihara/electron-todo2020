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
  // 非同期成功時
  test('showTaskListAction: DONE', () => {
    const beforState: ITaskList = {
      failedMessage: 'befor',
      loading: true,
      tasks: [],
    };
    const expectData = [{ test: 'dummy' }];
    const afterState = reducer(beforState, {
      type: 'task-actions/show-task-list_DONE',
      payload: { result: expectData },
    } as any);
    expect(afterState).toEqual({
      failedMessage: '',
      loading: false,
      tasks: expectData,
    });
  });
  // 非同期失敗時
  test('showTaskListAction: FAILED', () => {
    const beforState: ITaskList = {
      failedMessage: 'befor',
      loading: true,
      tasks: [],
    };
    const afterState = reducer(beforState, {
      type: 'task-actions/show-task-list_FAILED',
      payload: { error: 'test-error' },
    } as any);
    expect(afterState).toEqual({
      failedMessage: 'test-error',
      loading: false,
      tasks: [],
    });
  });
});
