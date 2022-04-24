import { autorun } from 'mobx';
import { AlertDiceRollInfo } from 'src/types';
import rootStore from 'src/stores';

/**
 * TODO- remove this in favor of actions. The only place it's used is for move conditions that
 * require more than one dice roll. Which I believe is just Elite Four in gen 3 (though that specific
 * implementation should arguably apply to all gens).
 */
// May need to change this eventually to handle single click multi rolls
export const requireDiceRolls = (numRequired: number): Promise<AlertDiceRollInfo> => {
  return new Promise((resolve) => {
    const { alertStore } = rootStore;
    const { diceRolls } = alertStore.alert;
    const newDiceRollInfo = { ...diceRolls };
    const numExisting = Object.keys(newDiceRollInfo).length;

    for (let i = numExisting; i < numExisting + numRequired; i++) {
      newDiceRollInfo[`roll${i}`] = {
        numRolls: 1,
        result: '',
      };
    }
    alertStore.update({ diceRolls: newDiceRollInfo });

    // If the current player closes their screen in the middle of this, when they join back the autorun
    // won't be set up since the rule already executed, leaving the rule unfinishable. Edge case, but should fix
    autorun(reaction => {
      const { diceRolls } = alertStore.alert;
      const keys = Object.keys(diceRolls);
      const hasFullResults = keys.every((key: string) => !!diceRolls[key].result);

      if (hasFullResults) {
        reaction.dispose();
        resolve(diceRolls);
      }
    });
  });
};

// Really need to rethink this multiple rolls in one thing
export const getRollsFromAlertDiceRoll = (info: AlertDiceRollInfo): number[] => {
  let result: number[] = [];
  Object.keys(info).forEach((key: string) => {
    const diceRoll = info[key];
    result = result.concat(diceRoll.result.split('|').map((x: string) => Number(x)));
  });
  return result;
}
