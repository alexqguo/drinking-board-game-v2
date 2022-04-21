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
import { AlertAction, RuleSchema } from 'src/types';
import { getHandlerForRule } from 'src/engine/rules';

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

  @action setAction = (action: AlertAction) => {
    const { alertStore, boardStore } = this.rootStore;
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
     * NOTE: This will run whenever an action is updated, which INCLUDES when you join an ongoing game. RootStore
     * will rehydrate the actions one by one, so the logic needs to take that into account as well.
     *
     * Only execute this logic if it is your turn in the game.
     */
    if (this.rootStore.gameStore.isMyTurn) {
      const curRule: RuleSchema = boardStore.getTileOrZoneRuleForAlert(alertStore.alert);
      const { postActionHandler = () => {} } = getHandlerForRule(curRule);
      postActionHandler(curRule, this.actionList);
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
      acc[cur.id] = cur;
      return acc;
    }, {});
    return update(this.rootStore.actionRef!, updateObj);
  }

  clear = async () => {
    // "Passing null to update() will remove the data at this location."
    // For some reason have to cast to null anyway
    // return update(this.rootStore.actionRef!, null as any);
    return remove(this.rootStore.actionRef!);
  }

  /**
   * Push a single action to the existing list
   */
  pushAction = async (newAction: AlertAction): Promise<void> => {
    return set(push(this.rootStore.actionRef!), newAction);
  }
}