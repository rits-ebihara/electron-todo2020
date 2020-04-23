import moment from 'moment';
import React, { useCallback, useMemo, MouseEvent } from 'react';
import { deleteTaskAction, toggleCompleteAction } from '../actions/TaskActions';
import { ITask } from '../states/ITask';
import store from '../Store';
import { styled } from './FoundationStyles';

// #region styled
/**
 * 行の大外枠...(1)
 */
const Task = styled.div<{ expiration: boolean }>`
  align-items: center;
  background-color: ${(p): string =>
    p.expiration ? 'inherit' : p.theme.SECONDARY_2_0};
  border-radius: 5px;
  cursor: pointer;
  border: 1px solid rgb(200, 200, 200);
  display: flex;
  flex-direction: row;
  margin-bottom: 1em;
  padding: 10px;
  transition-duration: 0.2s;
  transition-property: all;
  /* (2) */
  &:hover {
    transform: translate(-5px, -5px);
    box-shadow: 5px 5px 5px rgba(200, 200, 200, 4);
  }
`;
/**
 * タスク完了のチェックアイコン表示 枠
 */
const TaskCheckBox = styled.div`
  align-items: center;
  background-color: #fff;
  border: 2px solid #ccc;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  flex-grow: 0;
  flex-shrink: 0;
  height: 2em;
  width: 2em;
`;
/**
 * タスク完了チェックアイコン
 */
const TaskCheck = styled.p`
  color: ${(p): string => p.theme.SECONDARY_1_3};
  font-size: 150%;
`;
/**
 * タスク名と期日の表示 枠
 */
const TaskBody = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  flex-shrink: 0;
  height: 3em;
  justify-content: space-around;
`;
/**
 * タスク削除アイコン
 */
const TaskRemove = styled.div`
  flex-grow: 0;
  flex-shrink: 0;
`;
/**
 * タスク名
 */
const TaskName = styled.div`
  font-size: 120%;
`;

/**
 * 期日
 */
const Deadline = styled.div``;

// #endregion

const TaskRow: React.FC<ITask> = props => {
  // 未完了で有効期限を超過していないか
  const expiration = useMemo(() => {
    return new Date() < props.deadline || props.complete;
  }, [props.deadline, props.complete]);
  // 期限の表示書式に合わせた変換
  const deadlineString = useMemo(() => {
    return moment(props.deadline).format('YYYY-MM-DD HH:mm');
  }, [props.deadline]);
  // 行をクリックしたときのイベント
  const onRowClick = useCallback(() => {
    store.dispatch(toggleCompleteAction(props.id));
  }, [props.id]);
  // 削除ボタンを押した時のイベント
  const onDeleteClick = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      store.dispatch(deleteTaskAction(props.id));
      // クリックイベントを親要素の伝播させない
      e.stopPropagation();
    },
    [props.id],
  );
  return (
    <Task expiration={expiration} onClick={onRowClick}>
      <TaskCheckBox>
        <TaskCheck>{props.complete ? '✔' : null}</TaskCheck>
      </TaskCheckBox>
      <TaskBody>
        <TaskName>{props.taskName}</TaskName>
        <Deadline>⏰{deadlineString}</Deadline>
      </TaskBody>
      <TaskRemove onClick={onDeleteClick}>❌</TaskRemove>
    </Task>
  );
};

export default TaskRow;
