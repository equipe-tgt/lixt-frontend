import React, { useState, useEffect } from 'react';
import { StyleSheet, SafeAreaView } from 'react-native';
import { Text, Spinner, VStack } from 'native-base';
import { BarCodeScanner } from 'expo-barcode-scanner';

import { useTranslation } from 'react-i18next';

export default function BarcodeScreen(props) {
  const { t } = useTranslation();

  const [loading, setLoading] = useState(false);
  const [hasPermission, setHasPermission] = useState(null);

  const handleBarCodeScanned = ({ type, data }) => {
    setLoading(true);
  };

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  if (hasPermission === null) {
    return <Text>Requesting for camera permission</Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
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
