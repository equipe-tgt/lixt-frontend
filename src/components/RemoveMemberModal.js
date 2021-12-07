import React from 'react';
import PropTypes from 'prop-types';
import { Modal, Button } from 'native-base';
import { useTranslation } from 'react-i18next';

export default function RemoveMemberModal(props) {
  const { t } = useTranslation();

  return (
    <Modal
      testID="remove-member-modal"
      isOpen={props.isOpen}
      onClose={() => {
        props.closeModal(false);
      }}
      accessibilityValue={{
        text: props.isOpen ? 'visible' : 'hidden',
      }}
    >
      <Modal.Content>
        <Modal.CloseButton />
        <Modal.Header fontSize="lg" fontWeight="bold">
          {t('removeMember')}
        </Modal.Header>
        <Modal.Body>{t('confirmRemoveMember')}</Modal.Body>
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
            testID="button-confirm-removal-member"
            onPress={() => {
              props.closeModal(true);
            }}
            ml={3}
          >
            {t('removeMember')}
          </Button>
        </Modal.Footer>
      </Modal.Content>
    </Modal>
  );
}

RemoveMemberModal.propTypes = {
  isOpen: PropTypes.bool,
};
