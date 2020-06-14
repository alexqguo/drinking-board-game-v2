import React, { useState, useContext } from 'react';
import { Button, ButtonProps } from 'evergreen-ui';
import { TranslationContext } from 'src/providers/TranslationProvider';

type RollCallback = (rolls: number[], reset: Function) => void;

interface Props extends ButtonProps {
  numRolls?: number,
  onRoll: RollCallback,
}

const createRoll = () => Math.floor(Math.random() * 6) + 1;

export default ({ numRolls = 1, onRoll, ...rest }: Props) => {
  const i18n = useContext(TranslationContext);
  const [rolls, setRolls] = useState<number[]>([]);

  const reset = () => setRolls([]);
  const handleClick = () => {
    const rolls = Array.from(Array(numRolls), createRoll);
    onRoll(rolls, reset);
    setRolls(rolls);
  }

  return (
    <Button
      {...rest}
      iconBefore="hand-right"
      appearance="primary"
      onClick={handleClick}
      disabled={!!rolls.length}
    >
      {rolls.length ? rolls.join(',  ') : i18n.playerStatus.roll}
    </Button>
  );
}