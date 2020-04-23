import { ITask } from '../states/ITask';

export default interface ICore {
  /** ファイルからタスク一覧をロードする */
  loadTaskList: () => Promise<ITask[]>;
  /** ID が空文字なら新規、そうでない場合は更新する */
  saveTask: (task: ITask) => Promise<ITask[]>;
  /** 指定したIDのタスクを削除する */
  deleteTask: (taskId: string) => Promise<ITask[]>;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/interface-name-prefix
  interface Window {
    core: ICore;
  }
}
