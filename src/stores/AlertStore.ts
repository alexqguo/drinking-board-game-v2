import { observable, action } from 'mobx';
import { Alert, AlertState } from 'src/types';
import RootStore from 'src/stores/RootStore';

export default class AlertStore {
  rootStore: RootStore;
  @observable alert: Alert = {
    open: false,
    state: AlertState.PENDING,
    ruleIdx: -1,
  }

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
  }

  @action setAlert = (alert: Alert) => {
    this.alert = alert;
  }

  update = (alert: Partial<Alert>) => {
    this.rootStore.alertRef?.update(alert);
  }

  clear = () => {
    this.rootStore.alertRef?.update({
      open: false,
      state: AlertState.PENDING,
      ruleIdx: -1
    });
  }
}