import { autorun } from 'mobx';
import { AlertDiceRollInfo, PlayerTarget } from 'src/types';
import rootStore from 'src/stores';

// May need to change this eventually to handle single click multi rolls
export const requireDiceRolls = (numRequired: number): Promise<AlertDiceRollInfo> => {
  return new Promise((resolve) => {
    const { alertStore } = rootStore;
    const alertDiceRolls: AlertDiceRollInfo = {};

    for (let i = 0; i < numRequired; i++) {
      alertDiceRolls[`roll${i}`] = {
        numRolls: 1,
        result: '',
      };
    }
    alertStore.update({ diceRolls: alertDiceRolls });

    // If the current player closes their screen in the middle of this, when they join back the autorun 
    // won't be set up since the rule already executed, leaving the rule unfinishable. Edge case, but should fix
    autorun(reaction => {
      const keys = Object.keys(alertStore.alert.diceRolls);
      const { diceRolls } = alertStore.alert;
      const hasFullResults = keys.every((key: string) => !!diceRolls[key].result);
  
      if (hasFullResults) {
        reaction.dispose();
        resolve(diceRolls);
      }
    });
  });
};

export const requirePlayerSelection = (playerTarget: PlayerTarget): Promise<string[]> => {
  return new Promise((resolve) => {
    const { gameStore, playerStore } = rootStore;

    switch(playerTarget) {
      case PlayerTarget.custom: break;
      case PlayerTarget.allOthers:
        resolve(playerStore.ids.filter((id: string) => id !== gameStore.game.currentPlayerId));
      case PlayerTarget.self:
      default:
        resolve([gameStore.game.currentPlayerId]);
    }
  });
}