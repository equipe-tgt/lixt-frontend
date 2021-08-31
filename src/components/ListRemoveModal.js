import React from 'react';
import { AlertDialog, Button } from 'native-base';
import { useTranslation } from 'react-i18next';

export default function ListRemoveModal(props) {
  const { t } = useTranslation();

  return (
    <AlertDialog
      isOpen={props.isOpen}
      onClose={() => {
        props.closeModal(false);
      }}
      motionPreset={'fade'}
    >
      <AlertDialog.Content>
        <AlertDialog.Header fontSize="lg" fontWeight="bold">
          {t('deleteList')}
        </AlertDialog.Header>
        <AlertDialog.Body>{t('confirmDeleteList')}</AlertDialog.Body>
        <AlertDialog.Footer justifyContent="space-around">
          <Button
            variant="link"
            onPress={() => {
              props.closeModal(false);
            }}
          >
            {t('cancel')}
          </Button>
          <Button
            colorScheme="red"
            onPress={() => {
              props.closeModal(true);
            }}
            ml={3}
          >
            {t('deleteList')}
          </Button>
        </AlertDialog.Footer>
      </AlertDialog.Content>
    </AlertDialog>
  );
}
