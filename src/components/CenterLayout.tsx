import React from 'react';
import { Pane } from 'evergreen-ui';

export default ({ children }: { children: JSX.Element }) => (
  <section>
    <Pane
      margin={32}
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <Pane maxWidth={500}>
        {children}
      </Pane>
    </Pane>
  </section>
);