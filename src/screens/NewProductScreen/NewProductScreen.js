import React, { useState, useEffect, useContext } from 'react';
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
} from 'native-base';

import LixtInput from '../../components/LixtInput';

// Validação do formulário
import { useFormik } from 'formik';
import { ProductSchema } from '../../validationSchemas';
import MEASURE_TYPES, {
  getMeasureValueByLabel,
} from '../../utils/measureTypes';

import ProductService from '../../services/ProductService';
import CategoryService from '../../services/CategoryService';

import { AuthContext } from '../../context/AuthProvider';

export default function NewProductScreen(props) {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const { t } = useTranslation();

  const { user } = useContext(AuthContext);
  const toast = useToast();

  // Instanciando formik para controlar as validações do formulário
  const { handleChange, handleSubmit, handleBlur, values, errors } = useFormik({
    initialValues: {
      name: props.route.params.productName,
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

  const fetchCategories = () => {
    CategoryService.getCategories(user)
      .then((resp) => {
        setCategories([...resp.data]);
      })
      .catch(() => {
        toast.show({
          title: 'Não foi possível buscar as categorias',
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
      name: values.name,
      userId: user.id,
      measureType: getMeasureValueByLabel(values.measureType),
    };

    ProductService.createProduct(product, user)
      .then((resp) => {
        title = `Produto "${product.name}" adicionado com sucesso!`;
        status = 'success';

        const category = {
          id: product.categoryId,
          name: categories.find(c => c.id === Number(product.categoryId)).name
        }

        props.navigation.navigate('Lists', { newProduct: { ...resp.data, category } });
      })
      .catch(() => {
        title = 'Não foi possível adicionar o produto';
        status = 'warning';
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
                  key={MEASURE_TYPES[measure].value}
                  accessibilityLabel={MEASURE_TYPES[measure].label}
                  value={MEASURE_TYPES[measure].label}
                  my={1}
                >
                  {MEASURE_TYPES[measure].label}
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
            <Text color="rose.600" fontSize="sm" testID="error-category-select">
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
          testID="create-product-button"
        >
          {t('add')}
        </Button>
      </Center>
    </SafeAreaView>
  );
}

NewProductScreen.propTypes = {
  route: PropTypes.object,
  navigation: PropTypes.object,
};
