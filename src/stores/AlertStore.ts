import { observable, action } from 'mobx';
import { Alert } from 'src/types';
import RootStore from 'src/stores/RootStore';

export default class AlertStore {
  rootStore: RootStore;
  @observable alert: Alert = {
    open: false,
  }

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
  }

  @action setAlert = (alert: Alert) => {
    this.alert = alert;
  }
}