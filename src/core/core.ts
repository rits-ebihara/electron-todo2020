import fs from 'fs-extra';
import os from 'os';
import path from 'path';
import shortid from 'shortid';
import { ITask } from '../states/ITask';
import ICore from './ICore';

// OSごとのユーザーのプロファイルフォルダに保存される
const dataFilePath = path.join(os.homedir(), 'todo.json');

/** 遅延処理確認用：指定ミリ秒 待つ関数 */
const setTimeoutPromise = (count: number): Promise<void> => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, count);
  });
};

// テストのためにJSONの変換処理を別に定義する
export const __private__ = {
  reviver: (key: string, value: unknown): unknown => {
    if (key === 'deadline') {
      return new Date(value as string);
    } else {
      return value;
    }
  },
  replacer: (key: string, value: unknown): unknown => {
    if (key !== 'deadline') {
      return value;
    }
    return new Date(value as string).toISOString();
  },
};

const loadTaskList = async (): Promise<ITask[]> => {
  const exist = await fs.pathExists(dataFilePath); // ...(b)
  if (!exist) {
    // ...(c)
    // データファイルがなけれが、ファイルを作成して、初期データを保存する
    fs.ensureFileSync(dataFilePath);
    await fs.writeJSON(dataFilePath, { data: [] });
  }
  // データファイルを読み込む ...(d)
  const jsonData = (await fs.readJSON(dataFilePath, {
    // 日付型は、数値で格納しているので、日付型に変換する
    reviver: __private__.reviver,
  })) as { data: ITask[] };
  // 早すぎて非同期処理を実感できないので、ちょっと時間がかかる処理のシミュレート
  await setTimeoutPromise(500);
  return jsonData.data;
};

const saveTaskList = async (taskList: ITask[]): Promise<void> => {
  await fs.writeJSON(
    dataFilePath,
    { data: taskList },
    {
      replacer: __private__.replacer,
      spaces: 2,
    },
  );
};

const saveTask = async (task: ITask): Promise<ITask[]> => {
  // 早すぎて非同期処理を実感できないので、ちょっと時間がかかる処理のシミュレート
  await setTimeoutPromise(500);
  const taskList = await loadTaskList();
  const existTask = taskList.find(pTask => pTask.id === task.id);
  if (!task.id || !existTask) {
    task.id = shortid();
    taskList.push(task);
  } else {
    existTask.complete = task.complete;
    existTask.deadline = task.deadline;
    existTask.taskName = task.taskName;
  }
  await saveTaskList(taskList);
  return taskList;
};

const deleteTask = async (id: string): Promise<ITask[]> => {
  // 早すぎて非同期処理を実感できないので、ちょっと時間がかかる処理のシミュレート
  await setTimeoutPromise(500);
  const taskList = await loadTaskList();
  const deletedTaskList = taskList.filter(task => task.id !== id);
  await saveTaskList(deletedTaskList);
  return deletedTaskList;
};

const core: ICore = {
  loadTaskList,
  saveTask,
  deleteTask,
};

export default core;
