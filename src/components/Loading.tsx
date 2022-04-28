import React from 'react';
import { Spinner, Pane } from 'evergreen-ui';

const Loading = () => (
  <Pane display="flex" alignItems="center" justifyContent="center" height={400}>
    <Spinner />
  </Pane>
);

export default Loading;