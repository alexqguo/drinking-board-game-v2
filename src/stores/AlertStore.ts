import { observable, action } from 'mobx';
import { Alert, AlertState, AlertRuleType } from 'src/types';
import RootStore from 'src/stores/RootStore';
import { db } from 'src/firebase';

export default class AlertStore {
  rootStore: RootStore;
  @observable alert: Alert = AlertStore.defaultAlert();

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
  }

  @action setAlert = (alert: Alert) => {
    this.alert = alert;
  }

  update = (alert: Partial<Alert>) => {
    this.rootStore.alertRef?.update(alert);
  }

  updateDiceRollResult = (key: string, result: string) => {
    db.ref(`${this.rootStore.prefix}/alert/diceRolls/${key}`).update({ result });
  }

  // Selects
  updateChoice = (choiceId: string, isSelected: boolean = true) => {
    db.ref(`${this.rootStore.prefix}/alert/choice/${choiceId}`).update({ isSelected });
  }

  clear = () => {
    this.rootStore.alertRef?.update(AlertStore.defaultAlert());
  }

  static defaultAlert = () => ({
    open: false,
    state: AlertState.PENDING,
    ruleIdx: -1,
    ruleType: AlertRuleType.rule,
    diceRolls: {},
    messageOverride: '',
    playerSelection: {
      isRequired: false,
      selectedId: '',
      candidateIds: [],
    },
    choice: {},
    outcomeIdentifier: '',
    customComponent: '',
  });
}