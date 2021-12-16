import React from 'react';
import PropTypes from 'prop-types';
import { Modal, Button } from 'native-base';
import { useTranslation } from 'react-i18next';

export default function LeaveListModal(props) {
  const { t } = useTranslation();

  return (
    <Modal
      testID="leave-list-modal"
      isOpen={props.isOpen}
      onClose={() => {
        props.closeModal(false);
      }}
      accessibilityValue={{
        text: props.isOpen ? 'visible' : 'hidden',
      }}
    >
      <Modal.Content>
        <Modal.CloseButton testID="close-leave-list-modal-button" />
        <Modal.Header fontSize="lg" fontWeight="bold">
          {t('leaveList')}
        </Modal.Header>
        <Modal.Body>{t('confirmLeaveList')}</Modal.Body>
        <Modal.Footer justifyContent="space-around">
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
            testID="button-confirm-leave-list"
            onPress={() => {
              props.closeModal(true);
            }}
            ml={3}
          >
            {t('leaveList')}
          </Button>
        </Modal.Footer>
      </Modal.Content>
    </Modal>
  );
}

LeaveListModal.propTypes = {
  isOpen: PropTypes.bool,
};
