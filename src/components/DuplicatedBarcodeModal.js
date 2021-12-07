import React from 'react';
import PropTypes from 'prop-types';
import { Modal, Text, Button, useToast } from 'native-base';
import { useTranslation } from 'react-i18next';

export default function DuplicatedBarcodeModal(props) {
  const { t } = useTranslation();
  const toast = useToast();

  const addProductToList = () => {
    props.closeModal();

    // Voltando para a tela das listas com o produto a ser adicionado
    props.navigate('Lists', { foundProductByBarcode: props.product });

    toast.show({
      title: t('successfullySaved'),
      status: 'success',
    });
  };

  return (
    <Modal
      testID="duplicated-barcode-modal"
      isOpen={props.showModal}
      onClose={() => props.closeModal()}
      size="lg"
      accessibilityValue={{
        text: props.showModal ? 'visible' : 'hidden',
      }}
    >
      <Modal.Content maxWidth="85%">
        <Modal.CloseButton />
        <Modal.Header>{t('barcodeAlreadyRegistered')}</Modal.Header>
        <Modal.Body>
          <Text>
            {t('barcodeRegisteredOn', {
              barcode: props?.barcode,
              product: props?.product?.name,
            })}
          </Text>
          <Text>{t('wisthToAddToList')}</Text>
        </Modal.Body>

        <Modal.Footer width="95%" justifyContent="space-between">
          <Button
            testID="cancel-duplicated-barcode-button"
            onPress={props.closeModal}
            variant="ghost"
          >
            {t('cancel')}
          </Button>
          <Button testID="duplicated-barcode-button" onPress={addProductToList}>
            {t('yes')}
          </Button>
        </Modal.Footer>
      </Modal.Content>
    </Modal>
  );
}

DuplicatedBarcodeModal.propTypes = {
  showModal: PropTypes.bool,
  closeModal: PropTypes.func,
  barcode: PropTypes.string,
  navigate: PropTypes.func,
  product: PropTypes.object,
};
