import React, { ReactNode, useContext } from 'react';
import { FaHandPointRight } from 'react-icons/fa';
import { Button, MantineSize } from '@mantine/core';
import { TranslationContext } from 'src/providers/TranslationProvider';

type RollCallback = (rolls: number[]) => void;

interface Props {
  rolls: number[],
  disabled: boolean,
  numRolls?: number,
  onRoll: RollCallback,
  children?: ReactNode,
  mr?: MantineSize,
  mb?: MantineSize,
}

const createRoll = () => Math.floor(Math.random() * 6) + 1;

// This is a controlled component
export default ({
  numRolls = 1,
  onRoll,
  rolls,
  children,
  disabled,
  mr,
  mb,
}: Props) => {
  const i18n = useContext(TranslationContext);

  const handleClick = () => {
    const rolls = Array.from(Array(numRolls), createRoll);
    onRoll(rolls);
  }

  return (
    <Button
      leftIcon={<FaHandPointRight />}
      onClick={handleClick}
      disabled={disabled}
      size="xs"
      mr={mr}
      mb={mb}
    >
      {rolls.length ? rolls.join(',  ') : i18n.playerStatus.roll}
      {children}
    </Button>
  );
}