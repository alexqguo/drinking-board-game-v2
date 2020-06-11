import * as React from 'react';
import * as ReactDOM from 'react-dom';
import App from 'src/components/App';
import 'src/firebase';

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root'),
);