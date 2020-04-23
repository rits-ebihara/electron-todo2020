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
