import React from 'react';
import { Avatar } from 'evergreen-ui';
import { Player } from 'src/types';

interface Props {
  player: Player,
}

export default ({ player }: Props) => {
  // For some reason evergreen's theme doesn't export properly.
  // Should try to fix later
  const styleOverrides = {
    opacity: '85%',
    position: 'absolute',
    left: `200px`,
    top: `200px`
  };

  return (
    <Avatar 
      name={player.name}
      hashValue={player.id}
      size={50}
      style={styleOverrides}
    />
  );
}