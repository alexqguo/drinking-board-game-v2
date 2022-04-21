import React, { useContext } from 'react';
import { useObserver } from 'mobx-react';
import { Pane } from 'evergreen-ui';
import { StoreContext } from 'src/providers/StoreProvider';
import { ActionType, AlertAction } from 'src/types';
import RollAction from 'src/components/actions/RollAction';
import PlayerSelectAction from 'src/components/actions/PlayerSelectAction';

const actionTypeComponentMap = Object.freeze({
  [ActionType.roll]: RollAction,
  [ActionType.playerSelection]: PlayerSelectAction,
});

export default () => {
  const rootStore = useContext(StoreContext);
  const { actionStore, gameStore, playerStore } = rootStore;

  const renderActionComponentForAction = (action: AlertAction) => {
    const Component = actionTypeComponentMap[action.type];
    return (
      <Component
        action={action}
        actions={actionStore.actionList}
        isMyTurn={gameStore.isMyTurn}
        players={playerStore.players}
      />
    );
  };

  return useObserver(() => (
    <Pane>
      Actions<br />
      {actionStore.actionList.map((action: AlertAction) => (
        <div key={action.id}>
          {renderActionComponentForAction(action)}
        </div>
      ))}
    </Pane>
  ));
};