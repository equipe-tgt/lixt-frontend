import React, { useState, useEffect, useContext } from 'react';
import { SafeAreaView } from 'react-native';

import { useTranslation } from 'react-i18next';

import { screenBasicStyle as style } from '../styles/style';

import {
  Button,
  Text,
  Input,
  FormControl,
  Center,
  Radio,
  Box,
  useToast,
  Select,
  KeyboardAvoidingView,
} from 'native-base';

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

  // Instanciando formik para controlar as validações do formulário
  const { handleChange, handleSubmit, handleBlur, values, errors, touched } =
    useFormik({
      initialValues: {
        name: props.route.params.productName,
        categoryId: '',
        measureType: 'UN',
        measureValue: '',
      },
      validateOnChange: false,
      validateOnBlur: false,
      validationSchema: ProductSchema,
      onSubmit: () => {},
    });
  return (
    <SafeAreaView style={style.container}>
      <Center width="90%" mx="auto">
        <FormControl>
          <FormControl.Label>{t('name')}</FormControl.Label>
          <Input
            value={values.name}
            onChangeText={handleChange('name')}
            onBlur={handleBlur}
          />
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

        <FormControl>
          <FormControl.Label>{t('category')}</FormControl.Label>
          <Select
            selectedValue={values.categoryId}
            onValueChange={handleChange('categoryId')}
          >
            {categories.map((c) => (
              <Select.Item key={c.id} value={String(c.id)} label={c.name} />
            ))}
          </Select>
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
