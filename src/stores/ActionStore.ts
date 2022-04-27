import { observable, computed, action, makeObservable } from 'mobx';
import {
  get,
  ref,
  set,
  push,
  query,
  remove,
  update,
  equalTo,
  orderByChild,
  DataSnapshot,
} from 'firebase/database';
import RootStore from 'src/stores/RootStore';
import { db } from 'src/firebase';
import { ActionStatus, ActionType, AlertAction, GameState, RuleSchema } from 'src/types';
import { getHandlerForRule } from 'src/engine/rules';
import { createId } from 'src/utils';

/**
 * For actions in the alert modal, such as dice rolls or player selections
 */
export default class ActionStore {
  rootStore: RootStore;
  @observable actions: Map<string, AlertAction> = new Map();

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeObservable(this);
  }

  @action setActionChildAdded = (action: AlertAction) => {
    this.actions.set(action.id, action);
  }

  @action setActionChildChanged = (action: AlertAction) => {
    const { alertStore, boardStore, gameStore } = this.rootStore;
    this.actions.set(action.id, action);

    /**
     * Based on the action update, calculate the next action status here, for the current player.
     *
     * This really should be in an API/lambda, if a user is disconnected between the time they complete the action
     * in the UI and the firebase updates come back, the game may end up stuck.
     *
     * postActionHandler is in charge of updating game state accordingly based on current action statuses.
     * This could mean adding another action, setting a player effect, or allowing the modal to be closed because
     * all of the actions are completed.
     *
     * NOTE: This will run whenever an action is updated, which DOES NOT INCLUDE when you join an ongoing game.
     * This will assume that when the user took their last action, they stayed online long enough for this
     * function to execute after the firebase updates came back. As mentioned above, if they disconnect in this time,
     * the game will likely end up stuck.
     *
     * This could potentially be worked around by adding an additional call upon joining a game. Alternatively,
     * could add this handler also to the child_added event, but that invokes individually for every action that
     * is added when you rejoin a game, and thus the state will not be complete.
     *
     * Only execute this logic if it is your turn in the game.
     * --> Maybe consider putting this check individually in each postActionHandler. Could run into weird edge
     *     cases for things like group roll rule.
     */
    if (gameStore.isMyTurn) {
      if (gameStore.game.state === GameState.BATTLE && this.rootStore.extension?.battleHandler) {
        this.rootStore.extension.battleHandler(this.actionList);
      } else {
        // TODO- Consider removing the isMyTurn limitation on this, at least for actions where multiple
        // players are involved, as they would require the current player to be online

        /**
         * For the action which changed, invoke its rule's postActionHandler with all actions for that rule.
         * It's necessary to do this filtering in the case of nested rules/actions.
         */
        const actionsForRule = this.actionList.filter(a => a.ruleId === action.ruleId);
        const rule = boardStore.rulesById.get(action.ruleId)!;
        const { postActionHandler = () => {} } = getHandlerForRule(rule);
        postActionHandler(rule, actionsForRule);
      }
    }
  }

  @action removeAction = (action: AlertAction) => {
    this.actions.delete(action.id);
  }

  @computed get ids(): string[] {
    return Array.from(this.actions.keys());
  }

  @computed get actionList(): AlertAction[] {
    return Array.from(this.actions.values());
  }

  updateAction = async (id: string, ActionData: Partial<AlertAction>): Promise<void> => {
    const actionSnap: DataSnapshot = await get(query(this.rootStore.actionRef!, orderByChild('id'), equalTo(id)));
    const [key] = Object.entries(actionSnap!.val())[0];
    return update(ref(db, `${this.rootStore.prefix}/actions/${key}`), ActionData);
  }

  /**
   * Create and overwrite the existing action list. Should not invoke when actions preexist
   */
  createNewActions = async (actions: AlertAction[]) => {
    const updateObj = actions.reduce((acc: { [key: string]: AlertAction }, cur: AlertAction) => {
      // Always se a push as the key, otherwise ordering will be fucked up
      const key = push(this.rootStore.actionRef!).key;
      acc[key!] = cur;
      return acc;
    }, {});
    return update(this.rootStore.actionRef!, updateObj);
  }

  clear = async () => {
    return remove(this.rootStore.actionRef!);
  }

  /**
   * Push a single action to the existing list
   */
  pushAction = async (newAction: AlertAction): Promise<void> => {
    return set(push(this.rootStore.actionRef!), newAction);
  }

  static createNDiceRollActionObjects = ({
    n,
    ruleId,
    playerId,
    status = ActionStatus.ready,
  }: { n: number, ruleId: string, playerId: string, status?: ActionStatus }): AlertAction[] => {
    const actions: AlertAction[] = [];
    for (let i = 0; i < n; i++) {
      actions.push({
        id: createId('action'),
        status,
        ruleId,
        playerId,
        type: ActionType.roll,
        value: null,
      });
    }

    return actions;
  };
}