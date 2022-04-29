import React, { ReactNode, useContext } from 'react';
import { Button, ButtonProps, HandRightIcon } from 'evergreen-ui';
import { TranslationContext } from 'src/providers/TranslationProvider';

type RollCallback = (rolls: number[]) => void;

interface Props extends ButtonProps {
  rolls: number[],
  numRolls?: number,
  onRoll: RollCallback,
  children?: ReactNode,
}

const createRoll = () => Math.floor(Math.random() * 6) + 1;

// This is a controlled component
export default ({
  numRolls = 1,
  onRoll,
  rolls,
  children,
  ...rest
}: Props) => {
  const i18n = useContext(TranslationContext);

  const handleClick = () => {
    const rolls = Array.from(Array(numRolls), createRoll);
    onRoll(rolls);
  }

  return (
    <Button
      {...rest}
      iconBefore={HandRightIcon}
      appearance="primary"
      onClick={handleClick}
    >
      {rolls.length ? rolls.join(',  ') : i18n.playerStatus.roll}
      {children}
    </Button>
  );
}