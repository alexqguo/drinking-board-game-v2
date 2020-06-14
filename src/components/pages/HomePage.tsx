import React, { useContext } from 'react';
import { Heading, Paragraph, Button } from 'evergreen-ui';
import { TranslationContext } from 'src/providers/TranslationProvider';
import DiceRoll from '../DiceRoll';

export default () => {
  const i18n = useContext(TranslationContext);

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