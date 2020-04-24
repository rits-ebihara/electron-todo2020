import fs from 'fs-extra';
import { mocked } from 'ts-jest';
import target, { __private__ } from '../../src/core/core';
import { ITask } from '../../src/states/ITask';
import path from 'path';

jest.mock('fs-extra');

jest.mock('os', () => ({
  homedir: (): string => '/home',
  platform: jest.fn(), // 無いとエラーになる・・・
}));

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

describe('__private__', () => {
  test('reviver', () => {
    const key1 = 'deadline';
    const value = '2020-04-25T01:02:00.000Z';
    const result1 = __private__.reviver(key1, value);
    expect(result1).toEqual(new Date(2020, 3, 25, 10, 2, 0));
    const key2 = 'other';
    const result2 = __private__.reviver(key2, value);
    expect(result2).toEqual(value);
  });
  test('replacer', () => {
    const key1 = 'deadline';
    const value1 = new Date('2020-04-25T01:02:00.000Z');
    const result1 = __private__.replacer(key1, value1);
    expect(result1).toEqual('2020-04-25T01:02:00.000Z');
    const key2 = 'other';
    const value2 = 'test';
    const result2 = __private__.replacer(key2, value2);
    expect(result2).toEqual(value2);
  });
});

describe('loadTaskList', () => {
  // ファイルパスがテストを実行するOSによって異なるので、ここで作成する
  const dataFilePath = path.join('/home', 'todo.json');
  // ファイルが存在しているときのテスト
  test('success - exist data file', async () => {
    // ファイルが存在する前提
    mocked(fs.pathExists).mockResolvedValue(true as never);
    // ファイルから読み込まれるデータの設定
    mocked(fs.readJSON).mockResolvedValue({ data: testTaskList } as never);
    // 実行
    const taskList = await target.loadTaskList();
    // ファイルの新規作成の処理が実行され”ない”ことを確認する
    expect(fs.ensureFileSync).not.toBeCalled();
    expect(fs.writeJSON).not.toBeCalled();
    // 期待された値が返されたか確認する
    expect(taskList).toEqual(testTaskList);
  });
  // ファイルが存在しないときのテスト
  test('success - not exist data file', async () => {
    // ファイルが存在しない前提
    mocked(fs.pathExists).mockResolvedValue(false as never);
    // ファイルから読み込まれるデータの設定
    mocked(fs.readJSON).mockResolvedValue({ data: [] } as never);
    // 実行
    const taskList = await target.loadTaskList();
    // ファイルを作成する処理が実行されることを確認する。
    expect(fs.ensureFileSync).toBeCalledWith(dataFilePath);
    expect(fs.writeJSON).toBeCalledWith(dataFilePath, { data: [] });
    // 期待された値が返されたか確認する
    expect(taskList).toEqual([]);
  });
});
