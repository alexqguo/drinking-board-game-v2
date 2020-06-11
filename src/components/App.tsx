import * as React from 'react';
import { HashRouter, Switch, Route } from 'react-router-dom';
import { StoreProvider } from 'src/providers/StoreProvider';
import { TranslationProvider } from 'src/providers/TranslationProvider';
import CreateGamePage from 'src/components/pages/CreateGamePage';
import JoinGamePage from 'src/components/pages/JoinGamePage';
import PlayGamePage from 'src/components/pages/PlayGamePage';
import HomePage from 'src/components/pages/HomePage';

function App() {
  return (
    <StoreProvider>
      <TranslationProvider>
        <HashRouter>
          <Switch>
            <Route path="/join" component={JoinGamePage} />
            <Route path="/game/:gameId" component={PlayGamePage} />
            <Route path="/create" component={CreateGamePage} />
            <Route path="/" component={HomePage} />
          </Switch>
        </HashRouter>
      </TranslationProvider>
    </StoreProvider>
  );
}

export default App;
