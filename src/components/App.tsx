import React from 'react';
import { HashRouter, Switch, Route, Redirect } from 'react-router-dom';
import { StoreProvider } from 'src/providers/StoreProvider';
import { TranslationProvider } from 'src/providers/TranslationProvider';
import ErrorBoundary from 'src/components/ErrorBoundary';
import CreateGamePage from 'src/components/pages/CreateGamePage';
import JoinGamePage from 'src/components/pages/JoinGamePage';
import PlayGamePage from 'src/components/pages/PlayGamePage';
import HomePage from 'src/components/pages/HomePage';

const App = () => {
  return (
    <StoreProvider>
      <ErrorBoundary>
        <TranslationProvider>
          <HashRouter>
            <Switch>
              <Route path="/join/:gameId" component={JoinGamePage} />
              <Route path="/join" component={JoinGamePage} />
              <Route path="/game/:gameId" component={PlayGamePage} />
              <Route path="/create" component={CreateGamePage} />
              <Route path="/" exact component={HomePage} />
              <Route path="*">
                <Redirect to="/" />
              </Route>
            </Switch>
          </HashRouter>
        </TranslationProvider>
      </ErrorBoundary>
    </StoreProvider>
  );
}

export default App;
