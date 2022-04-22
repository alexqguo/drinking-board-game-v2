import React, { useContext } from 'react';
import { useObserver } from 'mobx-react';
import { Pane } from 'evergreen-ui';
import { StoreContext } from 'src/providers/StoreProvider';
import { ActionType, AlertAction, RuleSchema } from 'src/types';
import RollAction from 'src/components/actions/RollAction';
import PlayerSelectAction from 'src/components/actions/PlayerSelectAction';
import ChoiceAction from 'src/components/actions/ChoiceAction';

const actionTypeComponentMap = Object.freeze({
  [ActionType.roll]: RollAction,
  [ActionType.playerSelection]: PlayerSelectAction,
  [ActionType.choice]: ChoiceAction,
});

export default () => {
  const rootStore = useContext(StoreContext);
  const { alertStore, actionStore, gameStore, playerStore, boardStore } = rootStore;
  const rule: RuleSchema | null = boardStore.getTileOrZoneRuleForAlert(alertStore.alert);

  const renderActionComponentForAction = (action: AlertAction) => {
    const Component = actionTypeComponentMap[action.type];
    return (
      <Component
        rule={rule}
        action={action}
        actions={actionStore.actionList}
        isMyTurn={gameStore.isMyTurn}
        players={playerStore.players}
      />
    );
  };

  return useObserver(() => (
    <Pane marginTop={16}>
      {actionStore.actionList.map((action: AlertAction) => (
        <div key={action.id}>
          {renderActionComponentForAction(action)}
        </div>
      ))}
    </Pane>
  ));
};