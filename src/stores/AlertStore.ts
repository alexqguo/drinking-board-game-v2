import { observable, action, makeObservable } from 'mobx';
import { update, ref } from 'firebase/database';
import { Alert, AlertState, GameState } from 'src/types';
import RootStore from 'src/stores/RootStore';
import { db } from 'src/firebase';

export default class AlertStore {
  rootStore: RootStore;
  @observable alert: Alert = AlertStore.defaultAlert();

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeObservable(this);
  }

  @action setAlert = (alert: Alert) => {
    this.alert = alert;
  }

  update = (alert: Partial<Alert>) => {
    update(this.rootStore.alertRef!, alert);
  }

  updateDiceRollResult = (key: string, result: string) => {
    update(ref(db, `${this.rootStore.prefix}/alert/diceRolls/${key}`), { result });
  }

  // Selects
  updateChoice = (choiceId: string, isSelected: boolean = true) => {
    update(ref(db, `${this.rootStore.prefix}/alert/choice/${choiceId}`), { isSelected });
  }

  clear = () => {
    update(this.rootStore.alertRef!, AlertStore.defaultAlert());
  }

  static defaultAlert = (): Alert => ({
    open: false,
    state: AlertState.PENDING,
    nextGameState: GameState.NOT_STARTED,
    ruleId: '',
    diceRolls: {},
    messageOverride: '',
    headingOverride: '',
    outcomeIdentifier: '',
  });
}