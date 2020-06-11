import * as React from 'react';
import { Heading, Paragraph, Button } from 'evergreen-ui';
import { TranslationContext } from 'src/providers/TranslationProvider';

export default () => {
  const i18n = React.useContext(TranslationContext);
  const x: number = 3;

  return (
    <section>
      <Heading is="h1" size={800}>{i18n.home.title}</Heading>
      <Paragraph>
        {i18n.home.explanation}
      </Paragraph>
      <Button is="a" href="/#/create">{i18n.home.createGame}</Button>{' '}
      <Button is="a" href="/#/join">{i18n.home.joinGame}</Button>
    </section>
  );
}