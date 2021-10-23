import React from 'react';
import PropTypes from 'prop-types';
import { Modal, Text, Button } from 'native-base';
import { useTranslation } from 'react-i18next';

export default function AddProductFromBarcodeModal(props) {
  const { t } = useTranslation();

  return (
    <Modal
      isOpen={props.showModal}
      onClose={() => props.closeModal()}
      size="lg"
    >
      <Modal.Content maxWidth="85%">
        <Modal.CloseButton />
        <Modal.Header>{t('couldntFindBarcode')}</Modal.Header>
        <Modal.Body>
          <Text>{t('addNewBarcode', { barcode: props.barcode })}</Text>
          <Button
            onPress={() => {
              props.navigate('NewProduct', { barcode: props.barcode });
            }}
            mt={5}
          >
            {t('add')}
          </Button>
        </Modal.Body>
      </Modal.Content>
    </Modal>
  );
}

AddProductFromBarcodeModal.propTypes = {
  showModal: PropTypes.bool,
  closeModal: PropTypes.func,
  barcode: PropTypes.string,
  navigate: PropTypes.func,
};
