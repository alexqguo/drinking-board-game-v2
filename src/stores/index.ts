import RootStore from 'src/stores/RootStore';

const store = new RootStore();
(window as any).store = store;

export default store;