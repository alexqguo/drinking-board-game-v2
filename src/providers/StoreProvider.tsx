import React from 'react';
import rootStore from 'src/stores';
import RootStore from 'src/stores/RootStore';

export const StoreContext = React.createContext<RootStore>(rootStore);
export const StoreProvider = ({ children }: any) => {
  return (
    <StoreContext.Provider value={rootStore}>
      {children}
    </StoreContext.Provider>
  );
}