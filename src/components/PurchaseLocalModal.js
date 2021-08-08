import React, { useState, useContext, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Modal, ScrollView, List, useToast } from 'native-base';
import LixtInput from './LixtInput';

import { useTranslation } from 'react-i18next';
import PurchaseLocalService from '../services/PurchaseLocalService';
import { AuthContext } from '../context/AuthProvider';

// Validação do formulário
import { useFormik } from 'formik';
import { PurchaseLocal } from '../validationSchemas/index';

export default function PurchaseLocalModal(props) {
  const { t } = useTranslation();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [purchaseLocations, setPurchaseLocations] = useState([]);
  const [filteredPurchaseLocations, setFilteredPurchaseLocations] = useState(
    []
  );
  const { user } = useContext(AuthContext);

  // Instanciando formik para controlar as validações do formulário
  const { handleChange, handleBlur, values, errors } = useFormik({
    initialValues: {
      name: '',
    },
    validateOnChange: false,
    validateOnBlur: false,
    validationSchema: PurchaseLocal(t),
    onSubmit: () => {
      savePurchaseLocal();
    },
  });

  useEffect(() => {
    if (props.showModal) {
      values.name = '';
      getPurchaseLocals();
    }
  }, [props.showModal]);

  useEffect(() => {
    return () => {
      if (values.name.length > 0) {
        console.log(values.name.length);
        const filtered = purchaseLocations.filter((l) =>
          l.name.startsWith(values.name)
        );
        setFilteredPurchaseLocations(filtered);
      } else {
        setFilteredPurchaseLocations([]);
      }
    };
  }, [values.name]);

  const savePurchaseLocal = async () => {
    let status;
    let title;

    setLoading(true);
    try {
      const { data } = await PurchaseLocalService.createNewPurchaseLocal(
        values.name,
        user
      );
      props.closeModal(data);
      title = t('successfullySaved');
      status = 'success';
    } catch (error) {
      console.log(error);
      toast.show({
        title: t('unsuccessfullySaved'),
        status: 'warning',
      });
    } finally {
      values.name = '';
      toast.show({
        title,
        status,
      });
      setLoading(false);
    }
  };

  const getPurchaseLocals = async () => {
    let status;
    let title;

    try {
      const { data } = await PurchaseLocalService.findNearBy(user);
      setPurchaseLocations(data);
    } catch (error) {
      console.log(error);
      toast.show({
        title: t('unsuccessfullySaved'),
        status: 'warning',
      });
    } finally {
      toast.show({
        title,
        status,
      });
    }
  };

  return (
    <Modal
      isOpen={props.showModal}
      onClose={() => {
        values.name = '';
        props.closeModal();
      }}
    >
      <Modal.Content maxWidth="400px">
        <Modal.CloseButton />
        <Modal.Header>Local da compra</Modal.Header>
        <Modal.Body mt={5}>
          <LixtInput
            labelName="purchaseLocal"
            value={values.name}
            error={errors.name}
            inputTestID="new-local-purchase"
            errorTestID="error-new-local-purchase"
            onBlur={handleBlur('name')}
            onChangeText={handleChange('name')}
            disabled={loading}
            isInvalid={!!errors.name}
          />
          {/* Produtos encontrados */}
          {values.name.length > 0 ? (
            <List borderTopColor="transparent" space="md">
              <ScrollView keyboardShouldPersistTaps="always">
                {filteredPurchaseLocations.length > 0 ? (
                  filteredPurchaseLocations.map((location) => (
                    <List.Item
                      pb={4}
                      key={location.id}
                      onPress={() => {
                        props.closeModal(location);
                      }}
                      _pressed={{ bg: 'primary.500' }}
                    >
                      {location.name}
                    </List.Item>
                  ))
                ) : (
                  <List.Item
                    pb={4}
                    onPress={() => {
                      savePurchaseLocal();
                    }}
                    _pressed={{ bg: 'primary.500' }}
                  >
                    {t('add')} {values.name}
                  </List.Item>
                )}
              </ScrollView>
            </List>
          ) : null}
        </Modal.Body>
      </Modal.Content>
    </Modal>
  );
}

PurchaseLocalModal.propTypes = {
  showModal: PropTypes.bool,
  closeModal: PropTypes.func,
};
