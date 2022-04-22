import React from 'react';
import { useState } from 'react';
import en from 'src/i18n/en_US.json';

export const TranslationContext = React.createContext(en);
export const formatString = (baseString: string, variables: { [key: string]: string }) => {
  let result = baseString;
  for (let [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{${key}}`, 'g')
    result = result.replace(regex, value);
  }

  return result;
}
export const TranslationProvider = ({ children }: any) => {
  const [translations, setTranslations] = useState(en);

  return (
    <TranslationContext.Provider value={translations}>
      {children}
    </TranslationContext.Provider>
  );
}
