import React, { useState, useContext, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Modal,
  ScrollView,
  List,
  useToast,
  Text,
  Box,
  HStack,
} from 'native-base';
import LixtInput from './LixtInput';

import { FontAwesome5 } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import PurchaseLocalService from '../services/PurchaseLocalService';
import { AuthContext } from '../context/AuthProvider';
import * as Location from 'expo-location';

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
  const [coordinates, setCoordinates] = useState({
    latitude: null,
    longitude: null,
  });

  const { user } = useContext(AuthContext);

  // Instanciando formik para controlar as validações do formulário
  const { handleChange, handleBlur, values, errors, resetForm } = useFormik({
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

  // Ao abrir o modal pega as coordenadas do usuário
  useEffect(() => {
    if (props.showModal) {
      resetForm();
      getCoordinates();
    }
  }, [props.showModal]);

  useEffect(() => {
    return () => {
      // Conforme o usuário digita o nome, filtra a lista de localizações de compra
      if (values.name.length > 0) {
        const filtered = purchaseLocations.filter((l) =>
          l.name.toLowerCase().startsWith(values.name.toLowerCase())
        );
        setFilteredPurchaseLocations(filtered);
      } else {
        setFilteredPurchaseLocations([]);
      }
    };
  }, [values.name]);

  // Ao possuir as coordenadas passamos a buscar as localizações próximas
  useEffect(() => {
    if (coordinates.latitude && coordinates.longitude) {
      getPurchaseLocals();
    }
  }, [coordinates]);

  // Usuário inserindo um local novo na aplicação
  const savePurchaseLocal = async (name) => {
    let status;
    let title;

    setLoading(true);
    try {
      const { data } = await PurchaseLocalService.createNewPurchaseLocal(
        {
          name: name,
          ...coordinates,
        },
        user
      );
      props.closeModal(data);
      title = t('successfullySaved');
      status = 'success';
    } catch (error) {
      toast.show({
        title: t('unsuccessfullySaved'),
        status: 'warning',
      });
    } finally {
      resetForm();
      toast.show({
        title,
        status,
      });
      setLoading(false);
    }
  };

  // Busca os locais de compra próximos
  const getPurchaseLocals = async () => {
    let status;
    let title;

    try {
      const { data } = await PurchaseLocalService.findNearBy(coordinates, user);
      setPurchaseLocations(data);
    } catch (error) {
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

  const getCoordinates = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();

    // Verifica se há permissão para obter a localização do dispositivo
    if (status !== 'granted') {
      props.closeModal();
      toast.show({
        title: t('requestForLocationPermission'),
        status: 'warning',
      });

      return;
    }

    try {
      const location = await Location.getCurrentPositionAsync({
        enableHighAccuracy: true,
      });
      const { latitude, longitude } = location.coords;
      setCoordinates({ latitude, longitude });
    } catch (error) {
      // Caso haja permissão mas a localização do dispositivo esteja desativada
      props.closeModal();
      toast.show({
        title: t('turnOnDeviceLocation'),
        status: 'info',
      });
    }
  };

  return (
    <Modal
      testID="modal-purchase"
      isOpen={props.showModal}
      onClose={() => {
        resetForm();
        props.closeModal();
      }}
    >
      <Modal.Content maxWidth="400px">
        <Modal.CloseButton />
        <Modal.Header>{t('purchaseLocal')}</Modal.Header>
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
          {/* Locais de compra encontrados */}
          {values.name.length > 0 ? (
            <List borderTopColor="transparent" space="md">
              <ScrollView keyboardShouldPersistTaps="always">
                {filteredPurchaseLocations.length > 0 ? (
                  filteredPurchaseLocations.map((location) => (
                    <List.Item
                      pb={4}
                      key={location.name}
                      onPress={() => {
                        // Caso o local venha do MapBox, ele não possuirá id e portanto manda salvar
                        if (!location.id) {
                          savePurchaseLocal(location.name);
                        } else {
                          props.closeModal(location);
                        }
                      }}
                      _pressed={{ bg: 'primary.500' }}
                    >
                      {location.name.includes(',') ? (
                        <Box width="90%">
                          {/* Caso o nome do local da compra venha do mapbox quebra a visualização da string  */}
                          <Text> {location.name.split(',')[0]}</Text>

                          <HStack alignItems="center">
                            <FontAwesome5
                              name="map-marker-alt"
                              size={12}
                              color="black"
                            />
                            <Text fontSize="xs" ml={1} mt={1}>
                              {location.name.slice(
                                location.name.indexOf(',') + 1
                              )}
                            </Text>
                          </HStack>
                        </Box>
                      ) : (
                        <HStack alignItems="center">
                          <FontAwesome5
                            name="map-marker-alt"
                            size={12}
                            color="black"
                          />
                          <Text ml={1}> {location.name}</Text>
                        </HStack>
                      )}
                    </List.Item>
                  ))
                ) : (
                  <List.Item
                    pb={4}
                    testID="add-purchase-location"
                    onPress={() => {
                      savePurchaseLocal(values.name);
                    }}
                    _pressed={{ bg: 'primary.500' }}
                  >
                    {t('add')} {`"${values.name}"`}
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
