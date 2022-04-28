import React, { useContext } from 'react';
import { useObserver } from 'mobx-react';
import { Pane, Text } from 'evergreen-ui';
import { StoreContext } from 'src/providers/StoreProvider';
import { ActionType, AlertAction, GameType, RuleSchema } from 'src/types';
import RollAction from 'src/components/actions/RollAction';
import PlayerSelectAction from 'src/components/actions/PlayerSelectAction';
import ChoiceAction from 'src/components/actions/ChoiceAction';
import StarterSelectAction from 'src/components/actions/StarterSelectAction';

const actionTypeComponentMap = Object.freeze({
  [ActionType.roll]: RollAction,
  [ActionType.choice]: ChoiceAction,
  [ActionType.playerSelection]: PlayerSelectAction,
  [ActionType.starterSelection]: StarterSelectAction
});

export default () => {
  const rootStore = useContext(StoreContext);
  const { alertStore, actionStore, gameStore, playerStore, boardStore } = rootStore;
  const rule: RuleSchema | undefined = boardStore.rulesById.get(alertStore.alert.ruleId);
  const hasMultiplePlayers = new Set(actionStore.actionList.map(a => a.playerId)).size > 1;

  const renderActionComponentForAction = (action: AlertAction) => {
    const Component = actionTypeComponentMap[action.type];

    return (
      <Component
        rule={rule}
        action={action}
        actions={actionStore.actionList}
        players={playerStore.players}
        isMyAction={gameStore.game.type === GameType.local ? true : action.playerId === gameStore.localPlayerId}
      />
    );
  };

  return useObserver(() => (
    <Pane marginTop={16}>
      {actionStore.actionList.map((action: AlertAction) => (
        <Pane key={action.id} marginTop={8}>
          {hasMultiplePlayers && (
            <Text>
              {playerStore.players.get(action.playerId)!.name}{' '}
            </Text>
          )}
          {renderActionComponentForAction(action)}
        </Pane>
      ))}
    </Pane>
  ));
};