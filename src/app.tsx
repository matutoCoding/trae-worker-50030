import React, { useEffect } from 'react';
import { useDidShow, useDidHide } from '@tarojs/taro';
import { useShoeStore } from '@/store/useShoeStore';
import './app.scss';

function App(props) {
  const initStorage = useShoeStore(state => state.initStorage);

  useEffect(() => {
    initStorage();
  }, [initStorage]);

  useDidShow(() => {
    initStorage();
  });

  useDidHide(() => {});

  return props.children;
}

export default App;
