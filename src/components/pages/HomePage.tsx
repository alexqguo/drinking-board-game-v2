import React, { useContext } from 'react';
import { Heading, Paragraph, Button, Pane } from 'evergreen-ui';
import { TranslationContext } from 'src/providers/TranslationProvider';
import CenterLayout from 'src/components/CenterLayout';

export default () => {
  const i18n = useContext(TranslationContext);

  return (
    <CenterLayout>
      <>
        <Heading is="h1" size={800} marginBottom={16}>{i18n.home.title}</Heading>
        <Paragraph marginBottom={16}>
          {i18n.home.explanation}
        </Paragraph>

        <Pane marginBottom={16}>
          <Button
            is="a"
            href="/#/create"
            appearance="primary"
            marginRight={8}
          >
            {i18n.home.createGame}
          </Button>{' '}
          <Button is="a" href="/#/join">{i18n.home.joinGame}</Button>
        </Pane>

        <div>
          <a target="_blank" rel="noreferrer" href="https://github.com/alexqguo/drinking-board-game-v2">
            <img width="30" alt="Github link" src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png" />
          </a>
        </div>
      </>
    </CenterLayout>
  );
}