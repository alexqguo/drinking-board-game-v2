import React, { useContext } from 'react';
import { Avatar } from 'evergreen-ui';
import { Player, Point } from 'src/types';
import { getCenterPoint } from 'src/utils';
import { StoreContext } from 'src/providers/StoreProvider';

const AVATAR_SIZE = 50;

interface Props {
  player: Player,
}

export default ({ player }: Props) => {
  const { boardStore } = useContext(StoreContext);
  const position: Point = getCenterPoint(boardStore.schema.tiles[player.tileIndex].position);

  return (
    <Avatar 
      position="absolute"
      left={position.x - (AVATAR_SIZE / 2)}
      top={position.y - (AVATAR_SIZE / 2)}
      opacity="85%"
      name={player.name}
      hashValue={player.id}
      size={AVATAR_SIZE}
    />
  );
}