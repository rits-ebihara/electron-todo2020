import React from 'react';
import ReactDom from 'react-dom';
import { Provider } from 'react-redux';
import { ThemeProvider } from 'styled-components';
import { GlobalStyle, theme } from './components/FoundationStyles';
import Store from './Store';
import TaskListContainer from './components/TaskList';

const container = document.getElementById('contents');

ReactDom.render(
  <Provider store={Store}>
    {/* テーマを適用する */}
    <ThemeProvider theme={theme}>
      {/* 全体のスタイルを適用する */}
      <GlobalStyle />
      <TaskListContainer />
    </ThemeProvider>
  </Provider>,
  container,
);
