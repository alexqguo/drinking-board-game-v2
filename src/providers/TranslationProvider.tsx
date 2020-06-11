import * as React from 'react';
import { useState } from 'react';
import en from 'src/i18n/en_US.json';

export const TranslationContext = React.createContext(en);
export const TranslationProvider = ({ children }: any) => {
  const [translations, setTranslations] = useState(en);
  
  return (
    <TranslationContext.Provider value={translations}>
      {children}
    </TranslationContext.Provider>
  );
}