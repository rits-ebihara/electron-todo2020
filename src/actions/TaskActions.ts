import { Dispatch } from 'redux';
import { actionCreatorFactory } from 'typescript-fsa';
import { ITask } from '../states/ITask';
import '../core/ICore';

const actionCreator = actionCreatorFactory('task-actions');

/** タスクの一覧を表示する */
export const showTaskListAction = actionCreator.async<null, ITask[], string>(
  'show-task-list',
);

/** タスクの一覧を取得する */
export const getTaskList = async (dispatch: Dispatch): Promise<void> => {
  dispatch(showTaskListAction.started(null));
  const taskList = await window.core.loadTaskList().catch(e => {
    console.error(e);
    dispatch(
      showTaskListAction.failed({
        error: 'ファイルの読み込みに失敗しました。',
        params: null,
      }),
    );
  });
  if (!taskList) return;
  dispatch(showTaskListAction.done({ result: taskList, params: null }));
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
