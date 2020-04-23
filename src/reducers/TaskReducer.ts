import { reducerWithInitialState } from 'typescript-fsa-reducers';
import { ITaskList } from '../states/ITask';
import { showTaskListAction } from '../actions/TaskActions';

const initState: ITaskList = {
  tasks: [],
  loading: false,
};

const taskReducer = reducerWithInitialState<ITaskList>(initState)
  // タスクリストを表示する
  .case(showTaskListAction.started, state => ({
    ...state,
    loading: true,
  }))
  .case(showTaskListAction.done, (state, payload) => ({
    ...state, // tasks しか無いので本来は必要ないが、プロパティが増えた場合に必要
    tasks: payload.result,
    loading: false,
  }))
  .case(showTaskListAction.failed, state => ({
    ...state,
    loading: false,
  }))
  .build();

export default taskReducer;
