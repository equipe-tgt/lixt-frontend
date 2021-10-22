import React, { useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, SafeAreaView } from 'react-native';
import { Text, Spinner, VStack, useToast, Center } from 'native-base';
import AddProductFromBarcodeModal from '../../components/AddProductFromBarcodeModal';

import { BarCodeScanner } from 'expo-barcode-scanner';
import { AuthContext } from '../../context/AuthProvider';

import ProductService from '../../services/ProductService';

import { useTranslation } from 'react-i18next';

export default function BarcodeReaderScreen(props) {
  const { t } = useTranslation();
  const { user } = useContext(AuthContext);
  const toast = useToast();

  const [loading, setLoading] = useState(false);
  const [hasPermission, setHasPermission] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [newBarcode, setNewBarcode] = useState(null);

  const handleBarCodeScanned = async ({ data }) => {
    if (!props.route.params?.origin) {
      setLoading(true);

      try {
        const response = await ProductService.getProductByBarcode(data, user);

        if (response.data) {
          toast.show({
            title: t('foundBarcode'),
            description: t('addingToList'),
            status: 'success',
          });
          props.navigation.navigate('Lists', {
            foundProductByBarcode: response.data,
          });
        } else {
          setNewBarcode(data);
          setModalOpen(true);
        }
      } catch (error) {
        toast.show({
          title: t('defaultServerError'),
          status: 'success',
        });
      } finally {
        setLoading(false);
      }
    } else {
      props.navigation.navigate(props.route.params?.origin, { barcode: data });
    }
  };

  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    const { status } = await BarCodeScanner.requestPermissionsAsync();
    setHasPermission(status === 'granted');
  };

  if (hasPermission === null) {
    return (
      <SafeAreaView style={styles.container}>
        <Center>
          <Text>{t('requestForCameraPermission')}</Text>
        </Center>
      </SafeAreaView>
    );
  }
  if (hasPermission === false) {
    return (
      <SafeAreaView style={styles.container}>
        <Center>
          <Text>{t('noAccessToCamera')}</Text>
        </Center>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {loading ? (
        <VStack
          my="auto"
          bgColor="light.600"
          shadow={3}
          rounded="md"
          px={3}
          py={6}
        >
          <Spinner size="lg" />
          <Text mt={2} color="white">
            Fetching product
          </Text>
        </VStack>
      ) : (
        <BarCodeScanner
          style={StyleSheet.absoluteFillObject}
          onBarCodeScanned={loading ? undefined : handleBarCodeScanned}
        >
          <Text mt={20} mx="auto" w="70%" textAlign="center" highlight>
            {t('scanYourBarcode')}
          </Text>
        </BarCodeScanner>
      )}

      <AddProductFromBarcodeModal
        barcode={newBarcode}
        showModal={modalOpen}
        navigate={props.navigation.navigate}
        closeModal={() => setModalOpen(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'black',
  },

  barcode: {
    marginLeft: 'auto',
    marginRight: 'auto',
    width: '85%',
    borderRadius: 10,
  },
});

BarcodeReaderScreen.propTypes = {
  showModal: PropTypes.bool,
  closeModal: PropTypes.func,
  barcode: PropTypes.string,
  navigation: PropTypes.object,
  route: PropTypes.object,
};
