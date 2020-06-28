import React from 'react';
import RootStore from 'src/stores/RootStore';
import { Button } from 'evergreen-ui';

interface Props {
  rootStore: RootStore,
  onComplete: Function
}

export default ({ rootStore, onComplete }: Props) => {
  return (
    <div>
      <Button onClick={onComplete}>Done</Button>
    </div>
  );
}