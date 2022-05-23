import React, { useContext } from 'react';
import { Title, Button, Container, Text } from '@mantine/core';
import { TranslationContext } from 'src/providers/TranslationProvider';
import CenterLayout from 'src/components/CenterLayout';

export default () => {
  const i18n = useContext(TranslationContext);

  return (
    <CenterLayout>
      <>
        <Title order={1} mb="md">{i18n.home.title}</Title>
        <Text component="p">
          {i18n.home.explanation}
        </Text>

        <Container px={0} mb="md">
          <Button
            component="a"
            href="/#/create"
            mr="md"
          >
            {i18n.home.createGame}
          </Button>
          <Button
            component="a"
            href="/#/join"
            variant="outline"
          >
            {i18n.home.joinGame}
          </Button>
        </Container>

        <div>
          <a target="_blank" rel="noreferrer" href="https://github.com/alexqguo/drinking-board-game-v2">
            <img width="30" alt="Github link" src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png" />
          </a>
        </div>
      </>
    </CenterLayout>
  );
}