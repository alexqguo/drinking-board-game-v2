import { useState } from 'react';

const useInput = (initialValue: any) => {
  const [value, setValue] = useState(initialValue);
  const reset = () => setValue(initialValue);
  const bind = {
    value,
    onChange: (e: Event) => setValue((e.target as HTMLInputElement).value),
    onChangeVal: (val: any) => setValue(val),
  };

  return [value, bind, reset];
}

export default useInput;