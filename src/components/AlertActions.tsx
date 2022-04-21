import React, { useContext } from 'react';
import { useObserver } from 'mobx-react';
import { Pane } from 'evergreen-ui';
import { StoreContext } from 'src/providers/StoreProvider';
import { ActionType, AlertAction } from 'src/types';
import RollAction from 'src/components/actions/RollAction';

const actionTypeComponentMap = Object.freeze({
  [ActionType.roll]: RollAction,
});

export default () => {
  const rootStore = useContext(StoreContext);
  const { actionStore, gameStore } = rootStore;

  const renderActionComponentForAction = (action: AlertAction) => {
    const Component = actionTypeComponentMap[action.type];
    return (
      <Component
        action={action}
        actions={actionStore.actionList}
        isMyTurn={gameStore.isMyTurn}
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