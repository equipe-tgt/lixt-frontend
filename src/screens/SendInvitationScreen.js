import React, { useState, useContext } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView, Text } from 'react-native';
import {
  FormControl,
  Input,
  Center,
  Button,
  Select,
  useToast,
} from 'native-base';

import { screenBasicStyle as style } from '../styles/style';
import { useTranslation } from 'react-i18next';

import { AuthContext } from '../context/AuthProvider';
import { useFormik } from 'formik';
import { InviteSchema } from '../validationSchemas';
import ListMembersService from '../services/ListMembersService';
import { ListContext } from '../context/ListProvider';

export default function SendInvitationScreen(props) {
  const { t } = useTranslation();
  const toast = useToast();
  const { user } = useContext(AuthContext);
  const { lists } = useContext(ListContext);

  const [loading, setLoading] = useState(false);
  const [selectedList, setSelectedList] = useState(
    lists.length > 0 ? lists[0] : {}
  );

  useFocusEffect(() => {
    // Verifica se alguma tela enviou props para essa
    if (props.route.params?.list) {
      // Caso a tela de listas tenha enviado uma lista seleciona ela automaticamente
      const list = props.route.params.list;
      setSelectedList(lists.find((l) => l.id === list.id));
      props.route.params.list = null;
    }
  });

  const { handleChange, handleSubmit, handleBlur, values, errors, touched } =
    useFormik({
      initialValues: {
        username: '',
      },
      validateOnChange: false,
      validateOnBlur: false,
      validationSchema: InviteSchema,
      onSubmit: () => {
        sendInvitation();
      },
    });

  const sendInvitation = async () => {
    setLoading(true);

    let status;
    let title;

    try {
      await ListMembersService.sendInvite(
        values.username,
        selectedList.id,
        user
      );
      title = `Convite enviado para ${values.username}`;
      status = 'success';
    } catch (error) {
      if (error?.response?.status === 409) {
        status = 'info';
        title = `Um convite já foi enviado para "${values.username}"`;
      } else if (error?.response?.status === 404) {
        status = 'info';
        title = `Usuário "${values.username}" não existe`;
      } else {
        status = 'warning';
        title = 'Um erro inesperado ocorreu no servidor';
      }
    } finally {
      toast.show({
        status,
        title,
      });
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={style.container}>
      <Center width="90%" mx="auto" mt={5}>
        <FormControl mb={5}>
          <FormControl.Label>{t('selectList')}</FormControl.Label>
          <Select
            isDisabled={loading}
            selectedValue={selectedList.id}
            onValueChange={(listId) => {
              setSelectedList(lists.find((list) => list.id === Number(listId)));
            }}
          >
            {lists.map((list) => (
              <Select.Item
                key={list.id}
                value={list.id}
                label={list.nameList}
              />
            ))}
          </Select>
        </FormControl>

        <FormControl mb={5}>
          <FormControl.Label>{t('emailOrUsername')}</FormControl.Label>
          <Input
            autoCapitalize="none"
            disabled={loading}
            onBlur={handleBlur('username')}
            onChangeText={handleChange('username')}
            error={!!errors.username}
          />
          <FormControl.HelperText>
            <Text
              style={
                errors.username ? { color: '#fb7185' } : { display: 'none' }
              }
            >
              {errors.username}
            </Text>
          </FormControl.HelperText>
        </FormControl>
        <Button
          marginTop={5}
          paddingX={20}
          paddingY={4}
          isLoading={loading}
          isLoadingText="Enviando"
          onPress={handleSubmit}
        >
          {t('sendInvitation')}
        </Button>
      </Center>
    </SafeAreaView>
  );
}
