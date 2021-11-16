import React from 'react';
import PropTypes from 'prop-types';
import { Button, Modal } from 'native-base';
import { useTranslation } from 'react-i18next';

export default function RemoveCommentaryModal(props) {
  const { t } = useTranslation();

  return (
    <Modal
      testID="remove-commentary-modal"
      accessibilityValue={props.isOpen ? 'visible' : 'hidden'}
      isOpen={props.isOpen}
      onClose={() => {
        props.closeModal(false);
      }}
      motionPreset={'fade'}
    >
      <Modal.Content>
        <Modal.Header fontSize="lg" fontWeight="bold">
          {t('removeCommentaryModal')}
        </Modal.Header>
        <Modal.Body>{t('confirmRemoveCommentary')}</Modal.Body>
        <Modal.Footer justifyContent="space-around">
          <Button
            variant="link"
            testID="close-remove-commentary-modal-button"
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
        </Modal.Footer>
      </Modal.Content>
    </Modal>
  );
}

RemoveCommentaryModal.propTypes = {
  isOpen: PropTypes.bool,
};
