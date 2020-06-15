import { observable, action } from 'mobx';
import { Alert } from 'src/types';
import RootStore from 'src/stores/RootStore';

export default class AlertStore {
  rootStore: RootStore;
  @observable alert: Alert = {
    open: false,
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
      ruleIdx: -1
    });
  }
}