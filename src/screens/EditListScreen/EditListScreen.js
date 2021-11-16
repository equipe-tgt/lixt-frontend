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

export default function EditListScreen(props) {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState(null);
  const toast = useToast();
  const { t } = useTranslation();

  const { handleChange, handleSubmit, handleBlur, values, errors, resetForm } =
    useFormik({
      initialValues: { nameList: '', description: '' },
      validationSchema: ListSchema(t),
      onSubmit: () => {
        editList();
      },
      validateOnChange: false,
    });

  React.useEffect(() => {
    getList();
  }, []);

  const getList = () => {
    setLoading(true);
    ListService.getListById(props.route.params.listId, user)
      .then(({ data }) => {
        setList(data);
        resetForm({
          values: {
            nameList: data.nameList,
            description: data.description,
          },
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const editList = () => {
    setLoading(true);

    ListService.editList({ ...list, ...values }, list.id, user)
      .then(({ data }) => {
        toast.show({
          title: t('editedList'),
          status: 'success',
        });

        // Retorna para a tela de listas
        props.navigation.navigate('Lists', {
          refresh: true,
        });
      })
      .catch(() => {
        toast.show({
          title: t('errorServerDefault'),
          status: 'error',
        });
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
          inputTestID="edit-list-name"
          errorTestID="error-edit-list-name"
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
            testID="edit-list-description"
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
          isLoadingText={t('editingList')}
          onPress={handleSubmit}
          testID="edit-list-button"
        >
          {t('saveList')}
        </Button>
      </Center>
    </SafeAreaView>
  );
}

EditListScreen.propTypes = {
  navigation: PropTypes.object,
};
