import React, { useContext, useState } from 'react';
import PropTypes from 'prop-types';
import { SafeAreaView, Text } from 'react-native';
import {
  FormControl,
  Input,
  ScrollView,
  Radio,
  Button,
  Heading,
  useToast,
} from 'native-base';

import { useTranslation } from 'react-i18next';
import { screenBasicStyle as style } from '../styles/style';
import { Ionicons } from '@expo/vector-icons';

// Validação do formulário
import MEASURE_TYPES, { getMeasureType } from '../utils/measureTypes';
import { ProductOfListSchema } from '../validationSchemas/index';
import { useFormik } from 'formik';

import ProductOfListService from '../services/ProductOfListService';
import { AuthContext } from '../context/AuthProvider';

export default function ProductOfListDetails(props) {
  const { t } = useTranslation();
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const [product] = useState(props.route.params.product);

  // Instanciando formik para controlar as validações do formulário
  const { handleChange, handleSubmit, values, errors } = useFormik({
    initialValues: {
      price: product.price ? String(product.price) : '',
      amount: product.amount ? String(product.amount) : '',
      measureType: product.measureType
        ? getMeasureType(product.measureType)
        : '',
      measureValue: product.measureValue ? String(product.measureValue) : '',
    },
    validateOnChange: false,
    validateOnBlur: false,
    validationSchema: ProductOfListSchema,
    onSubmit: () => {
      editProductOfList();
    },
  });

  const editProductOfList = async () => {
    setLoading(true);
    const productOfListEdited = formatValuesForRequest();
    try {
      await ProductOfListService.editProductOfList(productOfListEdited, user);

      toast.show({
        title: 'Produto editado com sucesso',
        status: 'success',
      });
      // retorna à lista
      props.navigation.navigate('Lists');
    } catch (error) {
      console.log({ error });
      toast.show({
        title: 'Não foi possível editar o produto',
        status: 'warning',
      });
      setLoading(false);
    }
  };

  const formatValuesForRequest = () => {
    const productOfListEdited = Object.assign({}, props.route.params.product);
    productOfListEdited.price = parseFloat(values.price.replace(',', '.'));
    productOfListEdited.amount =
      !values.amount || parseInt(values.amount) <= 0
        ? 1
        : parseInt(values.amount);
    productOfListEdited.measureType = getMeasureType(values.measureType, false);
    productOfListEdited.measureValue =
      values.measureType !== 'UN' ? parseInt(values.measureValue) : null;
    return productOfListEdited;
  };

  return (
    <SafeAreaView style={style.container}>
      <ScrollView w="90%" mx="auto">
        <Heading>
          {`${t('editing')} ${props.route.params.product.product.name}`}
        </Heading>
        <Button
          px={0}
          mr="auto"
          variant="ghost"
          startIcon={
            <Ionicons name="chatbox-outline" size={35} color="#06b6d4" />
          }
          onPress={() => {
            props.navigation.navigate('Commentaries', { product });
          }}
        >
          {t('comment')}
        </Button>

        <FormControl my={3}>
          <FormControl.Label>{t('price')}</FormControl.Label>
          <Input
            keyboardType="numeric"
            value={values.price}
            onChangeText={handleChange('price')}
          />
          <FormControl.HelperText>
            <Text
              style={errors.price ? { color: '#fb7185' } : { display: 'none' }}
            >
              {errors.price}
            </Text>
          </FormControl.HelperText>
        </FormControl>

        <FormControl my={3}>
          <FormControl.Label>{t('measureType')}</FormControl.Label>
          <Radio.Group
            value={values.measureType}
            onChange={handleChange('measureType')}
            flexDirection="row"
            justifyContent="space-around"
          >
            {Object.keys(MEASURE_TYPES).map((measure) => {
              return (
                <Radio
                  key={measure}
                  accessibilityLabel={measure}
                  value={measure}
                  my={1}
                >
                  {measure}
                </Radio>
              );
            })}
          </Radio.Group>
        </FormControl>

        {/* Se a unidade de medida do produto não for do tipo "unidade" questiona o valor de mensura,
        Ex.: Produto: Arroz, unidade de medida: KG, valor da mensura: 5 = Arroz 5KG
        */}
        {values.measureType !== 'UN' ? (
          <FormControl my={3}>
            <FormControl.Label>{t('measureValue')}</FormControl.Label>
            <Input
              value={values.measureValue}
              onChangeText={handleChange('measureValue')}
              keyboardType="numeric"
            />
            <FormControl.HelperText>
              <Text
                style={
                  errors.measureValue
                    ? { color: '#fb7185' }
                    : { display: 'none' }
                }
              >
                {errors.measureValue}
              </Text>
            </FormControl.HelperText>
          </FormControl>
        ) : null}

        <FormControl my={3}>
          <FormControl.Label>{t('amount')}</FormControl.Label>
          <Input
            keyboardType="numeric"
            value={values.amount}
            onChangeText={handleChange('amount')}
          />
        </FormControl>

        <Button
          isLoading={loading}
          isLoadingText={t('editing')}
          onPress={handleSubmit}
          marginTop={5}
          paddingX={20}
          paddingY={4}
        >
          {t('finish')}
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}

ProductOfListDetails.propTypes = {
  navigation: PropTypes.object,
  route: PropTypes.object,
};
