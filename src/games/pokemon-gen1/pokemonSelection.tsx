import React from 'react';
import { Button } from 'evergreen-ui';
import RootStore from 'src/stores/RootStore';
import { starters } from './';

interface Props {
  rootStore: RootStore,
  onComplete: Function
}

export default ({ rootStore, onComplete }: Props) => {
  return (
    <div>
      {JSON.stringify(starters)}
      <Button onClick={onComplete}>Done</Button>
    </div>
  );
}