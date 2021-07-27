import React, { useContext, useState } from 'react';
import PropTypes from 'prop-types';
import { SafeAreaView } from 'react-native';
import { screenBasicStyle as style } from '../../styles/style';
import {
  Text,
  FormControl,
  Center,
  TextArea,
  Button,
  useToast,
} from 'native-base';
import { AuthContext } from '../../context/AuthProvider';
import ListService from '../../services/ListService';
import { useTranslation } from 'react-i18next';

// Validação e controle do formulário
import { useFormik } from 'formik';
import { ListSchema } from '../../validationSchemas';

import LixtInput from '../../components/LixtInput';

export default function NewListScreen(props) {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const { t } = useTranslation();

  const { handleChange, handleSubmit, handleBlur, values, errors } = useFormik({
    initialValues: { nameList: '', description: '' },
    validationSchema: ListSchema(t),
    onSubmit: () => {
      createList();
    },
    validateOnChange: false,
  });

  const createList = () => {
    setLoading(true);

    ListService.createList({ ...values, ownerId: user.id }, user)
      .then(({ data }) => {
        toast.show({
          title: t('createdList'),
          status: 'success',
        });
  
        // Retorna para a tela de listas
        props.navigation.navigate('Lists', {
          newList: data,
        });
      })
      .catch(() => {
        toast.show({
          title: t('errorServerDefault'),
          status: 'error',
        });
        setLoading(false);
      });
  };

  return (
    <SafeAreaView style={style.container}>
      <Center width="90%" mx="auto" mt={10}>
        <LixtInput
          labelName="nameList"
          error={errors.nameList}
          onChangeText={handleChange('nameList')}
          onBlur={handleBlur('nameList')}
          inputTestID="new-list-name-list"
          errorTestID="error-new-list-name-list"
          type="text"
          value={values.nameList}
          isInvalid={!!errors.nameList}
        />

        <FormControl>
          <FormControl.Label>{t('description')}</FormControl.Label>
          <TextArea
            onChangeText={handleChange('description')}
            onBlur={handleBlur('description')}
            value={values.description}
            isInvalid={!!errors.description}
            testID="new-list-description"
          />
          <FormControl.HelperText>
            <Text
              style={
                errors.description ? { color: '#fb7185' } : { display: 'none' }
              }
              testID="error-new-list-description"
            >
              {errors.description}
            </Text>
          </FormControl.HelperText>
        </FormControl>

        <Button
          marginTop={5}
          paddingX={20}
          paddingY={4}
          isLoading={loading}
          isLoadingText="Criando"
          onPress={handleSubmit}
          testID="create-list-button"
        >
          {t('saveList')}
        </Button>
      </Center>
    </SafeAreaView>
  );
}

NewListScreen.propTypes = {
  navigation: PropTypes.object,
};
