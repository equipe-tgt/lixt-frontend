import React, { useState, useEffect, useContext } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import PropTypes from 'prop-types';
import { SafeAreaView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { screenBasicStyle as style } from '../../styles/style';

import {
  Button,
  FormControl,
  Center,
  Radio,
  useToast,
  Select,
  View,
  Text,
  HStack,
  Box,
  ScrollView,
} from 'native-base';

import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import LixtInput from '../../components/LixtInput';

// Validação do formulário
import { useFormik } from 'formik';
import { ProductSchema } from '../../validationSchemas';
import MeasureTypes, { getMeasureValueByLabel } from '../../utils/measureTypes';

import ProductService from '../../services/ProductService';
import CategoryService from '../../services/CategoryService';

import DuplicatedBarcodeModal from '../../components/DuplicatedBarcodeModal';
import { AuthContext } from '../../context/AuthProvider';

export default function NewProductScreen(props) {
  const { t } = useTranslation();
  const { user } = useContext(AuthContext);
  const toast = useToast();

  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [barcode, setBarcode] = useState(null);
  const [duplicatedModalData, setDuplicatedModalData] = useState({
    isOpen: false,
    duplicatedProduct: null,
  });

  // Instanciando formik para controlar as validações do formulário
  const { handleChange, handleSubmit, handleBlur, values, errors } = useFormik({
    initialValues: {
      name: props.route.params?.productName || '',
      brand: '',
      categoryId: '',
      measureType: 'un',
      measureValue: '',
    },
    validateOnChange: false,
    validateOnBlur: false,
    validationSchema: ProductSchema(t),
    onSubmit: () => {
      addProduct();
    },
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  // Hook que dispara toda vez que esta tela for focada
  useFocusEffect(() => {
    // Verifica se alguma tela enviou props para essa
    if (props.route.params) {
      // Caso a tela tenha enviado um barcode
      if (props.route.params.barcode) {
        setBarcode(props.route.params.barcode);
        props.route.params.barcode = null;

        // Se esse barcode já tiver sido cadastrado anteriormente,
        // abre o modal de produto duplicado
        if (props.route.params.foundProductByBarcode) {
          setDuplicatedModalData({
            isOpen: true,
            duplicatedProduct: props.route.params.foundProductByBarcode,
          });
        }
      }
    }
  });

  const fetchCategories = () => {
    CategoryService.getCategories(user)
      .then((resp) => {
        setCategories([...resp.data]);
      })
      .catch(() => {
        toast.show({
          title: t('couldntSearchCategories'),
          status: 'error',
        });
      });
  };

  const addProduct = async () => {
    setLoading(true);

    let status;
    let title;

    const product = {
      categoryId: values.categoryId,
      name: values.brand ? `${values.name} ${values.brand}` : values.name,
      userId: barcode ? null : user.id,
      measureType: getMeasureValueByLabel(values.measureType),
      barcode,
    };

    ProductService.createProduct(product, user)
      .then((resp) => {
        title = t('addingProductSuccess', { productName: product.name });
        status = 'success';

        const category = {
          id: product.categoryId,
          name:
            categories.find((c) => c.id === Number(product.categoryId))?.name ||
            '',
        };

        props.navigation.navigate('Lists', {
          newProduct: { ...resp.data, category },
        });
      })
      .catch((error) => {
        // Caso o produto que está sendo cadastrado já exista com o mesmo
        // código de barras na plataforma
        if (error?.response?.status === 409) {
          setDuplicatedModalData({
            isOpen: true,
            duplicatedProduct: error?.response?.data,
          });
        } else {
          title = t('couldntAddProduct');
          status = 'warning';
        }
      })
      .finally(() => {
        toast.show({
          status,
          title,
        });

        setLoading(false);
      });
  };

  return (
    <SafeAreaView style={style.container}>
      <ScrollView>
        <Center width="90%" mx="auto">
          <LixtInput
            labelName="name"
            value={values.name}
            error={errors.name}
            onChangeText={handleChange('name')}
            onBlur={handleBlur('name')}
            inputTestID="new-product-name"
            errorTestID="error-new-product-name"
            disabled={loading}
            isInvalid={!!errors.name}
          />

          <LixtInput
            labelName="brandInput"
            value={values.brand}
            onChangeText={handleChange('brand')}
            onBlur={handleBlur('brand')}
            inputTestID="new-product-brand"
            disabled={loading}
          />

          <FormControl my={3}>
            <FormControl.Label>{t('measureType')}</FormControl.Label>
            <Radio.Group
              value={values.measureType}
              onChange={handleChange('measureType')}
              flexDirection="row"
              justifyContent="space-around"
            >
              {Object.keys(MeasureTypes).map((measure) => {
                return (
                  <Radio
                    key={MeasureTypes[measure].value}
                    accessibilityLabel={MeasureTypes[measure].label}
                    value={MeasureTypes[measure].label}
                    my={1}
                  >
                    {MeasureTypes[measure].label}
                  </Radio>
                );
              })}
            </Radio.Group>
          </FormControl>

          <FormControl>
            <FormControl.Label>{t('category')}</FormControl.Label>
            <Select
              error={errors.categoryId}
              selectedValue={values.categoryId}
              onValueChange={handleChange('categoryId')}
              testID="category-select"
            >
              {categories.map((c) => (
                <Select.Item key={c.id} value={String(c.id)} label={c.name} />
              ))}
            </Select>
            <View style={{ height: 20 }}>
              <Text
                color="rose.600"
                fontSize="sm"
                testID="error-category-select"
              >
                {errors.categoryId}
              </Text>
            </View>
          </FormControl>

          {!barcode ? (
            <Button
              testID="button-new-barcode"
              paddingX={18}
              paddingY={3}
              variant="outline"
              colorScheme="dark"
              startIcon={
                <MaterialCommunityIcons
                  name="barcode-scan"
                  size={34}
                  color="#292524"
                />
              }
              onPress={() => {
                props.navigation.navigate('BarcodeReader', {
                  origin: 'NewProduct',
                });
              }}
            >
              <Text color="#292524">
                {t('addBarcode')}: {t('optional')}
              </Text>
            </Button>
          ) : (
            <HStack justifyContent="space-between" w="100%" alignItems="center">
              <Box>
                <Text textAlign="left">{t('barcode')}</Text>
                <Text textAlign="left">{barcode}</Text>
              </Box>

              <HStack justifyContent="space-between" alignItems="center">
                <Button
                  variant="link"
                  testID="read-again-button"
                  onPress={() => {
                    props.navigation.navigate('BarcodeReader', {
                      origin: 'NewProduct',
                    });
                  }}
                >
                  {t('readAgain')}
                </Button>
                <Button
                  testID="clean-barcode-button"
                  onPress={() => {
                    setBarcode(null);
                  }}
                  variant="link"
                  startIcon={<Ionicons name="close" size={24} color="#777" />}
                />
              </HStack>
            </HStack>
          )}

          <Button
            paddingX={20}
            paddingY={4}
            isLoading={loading}
            isLoadingText={t('creating')}
            marginTop={5}
            onPress={handleSubmit}
            testID="create-product-button"
          >
            {t('add')}
          </Button>
          <DuplicatedBarcodeModal
            showModal={duplicatedModalData.isOpen}
            product={duplicatedModalData.duplicatedProduct}
            barcode={barcode}
            navigate={props.navigation.navigate}
            closeModal={() => {
              setDuplicatedModalData({
                isOpen: false,
                duplicatedProduct: null,
              });
            }}
          />
        </Center>
      </ScrollView>
    </SafeAreaView>
  );
}

NewProductScreen.propTypes = {
  route: PropTypes.object,
  navigation: PropTypes.object,
};
