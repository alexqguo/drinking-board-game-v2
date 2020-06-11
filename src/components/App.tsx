import React from 'react';
import { HashRouter, Switch, Route, Redirect } from 'react-router-dom';
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
            <Route path="/join/:gameId" component={JoinGamePage} />
            <Route path="/game/:gameId" component={PlayGamePage} />
            <Route path="/create" component={CreateGamePage} />
            <Route path="/" exact component={HomePage} />
            <Route path="*">
              <Redirect to="/" />
            </Route>
          </Switch>
        </HashRouter>
      </TranslationProvider>
    </StoreProvider>
  );
}

export default App;
