import React, { useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import { SafeAreaView } from 'react-native';

import { useTranslation } from 'react-i18next';

import { screenBasicStyle as style } from '../styles/style';

import {
  Button,
  FormControl,
  Center,
  Radio,
  useToast,
  Select,
  View,
  Text,
} from 'native-base';

import LixtInput from '../components/LixtInput';

// Validação do formulário
import { useFormik } from 'formik';
import { ProductSchema } from '../validationSchemas';
import MEASURE_TYPES from '../utils/measureTypes';

import ProductService from '../services/ProductService';
import CategoryService from '../services/CategoryService';

import { AuthContext } from '../context/AuthProvider';

export default function NewProductScreen(props) {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const { t } = useTranslation();

  const { user } = useContext(AuthContext);
  const toast = useToast();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data } = await CategoryService.getCategories(user);
      setCategories([...data]);
    } catch (error) {
      console.log({ error });
      toast.show({
        title: 'Não foi possível buscar as categorias',
        status: 'error',
      });
    }
  };

  const addProduct = async () => {
    setLoading(true);

    let status;
    let title;

    try {
      const product = {
        categoryId: values.categoryId,
        name: values.name,
        userId: user.id,
      };

      product.measureType =
        values.measureType === 'UN' ? 'UNITY' : values.measureType;

      await ProductService.createProduct(product, user);

      title = `Produto "${product.name}" adicionado com sucesso!`;
      status = 'success';
    } catch (error) {
      title = 'Não foi possível adicionar o produto';
      status = 'warning';
    } finally {
      toast.show({
        status,
        title,
      });

      setLoading(false);
    }
  };

  // Instanciando formik para controlar as validações do formulário
  const { handleChange, handleSubmit, handleBlur, values, errors } = useFormik({
    initialValues: {
      name: props.route.params.productName,
      categoryId: '',
      measureType: 'UN',
      measureValue: '',
    },
    validateOnChange: false,
    validateOnBlur: false,
    validationSchema: ProductSchema(t),
    onSubmit: () => {
      addProduct();
    },
  });
  return (
    <SafeAreaView style={style.container}>
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

        <FormControl>
          <FormControl.Label>{t('category')}</FormControl.Label>
          <Select
            error={errors.categoryId}
            selectedValue={values.categoryId}
            onValueChange={handleChange('categoryId')}
          >
            {categories.map((c) => (
              <Select.Item key={c.id} value={String(c.id)} label={c.name} />
            ))}
          </Select>
          <View style={{ height: 20 }}>
            <Text color="rose.600" fontSize="sm">
              {errors.categoryId}
            </Text>
          </View>
        </FormControl>
        <Button
          paddingX={20}
          paddingY={4}
          isLoading={loading}
          isLoadingText={t('creating')}
          marginTop={5}
          onPress={handleSubmit}
        >
          {t('add')}
        </Button>
      </Center>
    </SafeAreaView>
  );
}

NewProductScreen.propTypes = {
  route: PropTypes.object,
};
