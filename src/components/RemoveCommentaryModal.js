import React from 'react';
import PropTypes from 'prop-types';
import { AlertDialog, Button } from 'native-base';
import { useTranslation } from 'react-i18next';

export default function RemoveCommentaryModal(props) {
  const { t } = useTranslation();

  return (
    <AlertDialog
      testID="remove-commentary-modal"
      isOpen={props.isOpen}
      onClose={() => {
        props.closeModal(false);
      }}
      motionPreset={'fade'}
    >
      <AlertDialog.Content>
        <AlertDialog.Header fontSize="lg" fontWeight="bold">
          {t('removeCommentaryModal')}
        </AlertDialog.Header>
        <AlertDialog.Body>{t('confirmRemoveCommentary')}</AlertDialog.Body>
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
            testID="button-confirm-removal"
            onPress={() => {
              props.closeModal(true);
            }}
            ml={3}
          >
            {t('removeCommentaryModalOk')}
          </Button>
        </AlertDialog.Footer>
      </AlertDialog.Content>
    </AlertDialog>
  );
}

RemoveCommentaryModal.propTypes = {
  isOpen: PropTypes.bool,
};
