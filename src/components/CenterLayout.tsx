import React from 'react';
import { Container } from '@mantine/core';

export default ({ children }: { children: JSX.Element }) => (
  <section>
    <Container
      px={0}
      m="xl"
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        maxWidth: '100%',
      }}
    >
      <Container px={0} sx={{ maxWidth: 500 }}>
        {children}
      </Container>
    </Container>
  </section>
);