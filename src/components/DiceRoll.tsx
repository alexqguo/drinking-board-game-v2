import React, { useState, useContext } from 'react';
import { Button, ButtonProps } from 'evergreen-ui';
import { TranslationContext } from 'src/providers/TranslationProvider';

type RollCallback = (rolls: number[]) => void;

interface Props extends ButtonProps {
  rolls: number[],
  numRolls?: number,
  onRoll: RollCallback,
}

const createRoll = () => Math.floor(Math.random() * 6) + 1;

// This is a controlled component
export default ({ numRolls = 1, onRoll, rolls, ...rest }: Props) => {
  const i18n = useContext(TranslationContext);

  const handleClick = () => {
    const rolls = Array.from(Array(numRolls), createRoll);
    onRoll(rolls);
  }

  return (
    <Button
      {...rest}
      iconBefore="hand-right"
      appearance="primary"
      onClick={handleClick}
    >
      {rolls.length ? rolls.join(',  ') : i18n.playerStatus.roll}
    </Button>
  );
}