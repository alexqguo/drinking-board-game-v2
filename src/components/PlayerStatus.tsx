import React from 'react';
import { useObserver } from 'mobx-react';
import { Pane, Heading } from 'evergreen-ui';
import { Player } from 'src/types';

interface Props {
  player: Player
}

export default ({ player }: Props) => {
  return useObserver(() => (
    <Pane
      width={220}
      minHeight={100}
      padding={20}
      elevation={1}
      backgroundColor="white"
      position="absolute"
      top={0}
      left={0}
    >
      <Heading>{player.name}</Heading>
    </Pane>
  ));
}