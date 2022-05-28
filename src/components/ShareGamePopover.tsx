import React, { useState, useContext, useEffect } from 'react';
import QRCode from 'qrcode';
import { Popover, Text, Button } from '@mantine/core';
import { TranslationContext } from 'src/providers/TranslationProvider';

interface Props {
  gameId: string,
};

export default ({
  gameId,
}: Props) => {
  const [open, setIsOpen] = useState(false);
  const i18n = useContext(TranslationContext);
  const [qrCodeDataUrl, setQRCodeDataUrl] = useState('');
  const joinGameUrl = new URL(`/#/join/${gameId}`, window.location.href);

  useEffect(() => {
    (async () => {
      try {
        setQRCodeDataUrl(await QRCode.toDataURL(joinGameUrl.href));
      } catch (err) {
        console.error(err);
      }
    })();
  }, [gameId]);

  console.log(qrCodeDataUrl)

  return (
    <Popover
      withArrow
      shadow="xl"
      opened={open}
      closeOnClickOutside
      onClose={() => setIsOpen(false)}
      target={
        <Button size="xs" mt="xs" variant="outline" compact onClick={() => setIsOpen(true)}>
            {i18n.playerStatus.shareGame}
        </Button>
      }
    >
      <a href={joinGameUrl.href} target="_blank" rel="noreferrer">
        <Text size="xs">{gameId}</Text>
      </a>
      <img src={qrCodeDataUrl} alt="QR code to join the game" />
    </Popover>
  );
};