import moment from 'moment';
import { Dispatch } from 'redux';
import { actionCreatorFactory } from 'typescript-fsa';
import { ITask } from '../states/ITask';

const actionCreator = actionCreatorFactory('task-actions');

/** タスクの一覧を表示する */
export const showTaskListAction = actionCreator<ITask[]>('show-task-list');

/** タスクを追加する */
export const addTaskAction = actionCreator<ITask>('add');

/**
 *  タスクの完了フラグをトグルする
 *  タスクIDを渡す
 */
export const toggleCompleteAction = actionCreator<string>('toggle-complete');

/**
 *  タスクを削除する
 *  タスクIDを渡す
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
  dispatch(showTaskListAction(dummyTasks));
};
