import React from 'react';
import { HashRouter, Switch, Route, Redirect } from 'react-router-dom';
import { mergeTheme, defaultTheme, ThemeProvider } from 'evergreen-ui'
import { StoreProvider } from 'src/providers/StoreProvider';
import { TranslationProvider } from 'src/providers/TranslationProvider';
import CreateGamePage from 'src/components/pages/CreateGamePage';
import JoinGamePage from 'src/components/pages/JoinGamePage';
import PlayGamePage from 'src/components/pages/PlayGamePage';
import HomePage from 'src/components/pages/HomePage';

const theme = mergeTheme(defaultTheme, {
  components: {
    Button: {
      baseStyle: {
        //
        /**
         * I'm putting this here specifically for primary button types.
         * It's not currently possible in evergreen to override the primary button theme without
         * duplicating a bunch of their code. Creating a new button appearance type is an option, but
         * a bit more effort than it's really worth.
         * See https://github.com/segmentio/evergreen/discussions/1106
         */
        _disabled: {
          color: 'rgba(0, 0, 255, 0.5)',
        }
      },
      appearances: {
        default: {
          _disabled: {
            color: '#999'
          },
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider value={theme}>
      <StoreProvider>
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
      </StoreProvider>
    </ThemeProvider>
  );
}

export default App;
