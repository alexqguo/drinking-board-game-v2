import React from 'react';
import { Loader, Container } from '@mantine/core';

const Loading = () => (
  <Container
    sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: 400,
    }}
  >
    <Loader size="xl" />
  </Container>
);

export default Loading;