import React, { useContext } from 'react';
import { StoreContext } from 'src/providers/StoreProvider';
import { useObserver } from 'mobx-react';

export default () => {
  const store = useContext(StoreContext);
  const { gameStore } = store;

  return useObserver(() => (
    <img alt="" src={`games/${gameStore.game.board}/index.png`} />
  ));
};