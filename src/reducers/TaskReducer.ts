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
