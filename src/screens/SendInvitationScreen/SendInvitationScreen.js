import React, { useState, useContext } from 'react';
import PropTypes from 'prop-types';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native';
import { Center, Button, Select, useToast, Box } from 'native-base';
import { useFormik } from 'formik';
import { useTranslation } from 'react-i18next';

import { screenBasicStyle as style } from '../../styles/style';

import { AuthContext } from '../../context/AuthProvider';
import { InviteSchema } from '../../validationSchemas';
import ListMembersService from '../../services/ListMembersService';
import { ListContext } from '../../context/ListProvider';

import LixtSelect from '../../components/LixtSelect';
import LixtInput from '../../components/LixtInput';

export default function SendInvitationScreen(props) {
  const { user } = useContext(AuthContext);
  const { lists } = useContext(ListContext);
  const toast = useToast();
  const { t } = useTranslation();

  const [loading, setLoading] = useState(false);
  const [selectedList, setSelectedList] = useState(
    lists.length > 0 ? lists[0] : {}
  );

  // Caso o usuário não possuir listas ou não for dono de nenhuma deixa o select e o botão desabilitados
  const [isDisabled] = useState(
    lists.length === 0 || lists.every((l) => l.ownerId !== user.id)
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

  const { handleChange, handleSubmit, handleBlur, values, errors } = useFormik({
    initialValues: {
      username: '',
    },
    validateOnChange: false,
    validateOnBlur: false,
    validationSchema: InviteSchema(t),
    onSubmit: () => {
      if (values.username === user.username) {
        toast.show({
          status: 'warning',
          title: 'Você não pode se convidar para a lista',
        });
        return;
      }

      sendInvitation();
    },
  });

  const sendInvitation = () => {
    setLoading(true);

    let status;
    let title;

    ListMembersService.sendInvite(values.username, selectedList.id, user)
      .then(() => {
        title = `Convite enviado para ${values.username}`;
        status = 'success';
      })
      .catch((error) => {
        if (error?.response?.status === 409) {
          status = 'info';
          title = `Um convite já foi enviado para "${values.username}"`;
        } else if (error?.response?.status === 404) {
          status = 'info';
          title = `Usuário "${values.username}" não existe`;
        } else {
          status = 'warning';
          title = t('errorServerDefault');
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
      <Center width="90%" mx="auto" mt={5}>
        <Box mb={5} width="100%">
          <LixtSelect
            labelName="selectList"
            isDisabled={loading || isDisabled}
            selectedValue={selectedList.id}
            onValueChange={(listId) => {
              setSelectedList(lists.find((list) => list.id === Number(listId)));
            }}
            selectTestID="select-list"
          >
            {lists.map((list) => (
              <Select.Item
                key={list.id}
                value={list.id}
                label={list.nameList}
              />
            ))}
          </LixtSelect>
        </Box>

        <Box mb={5} width="100%">
          <LixtInput
            labelName="emailOrUsername"
            error={errors.username}
            onChangeText={handleChange('username')}
            onBlur={handleBlur('username')}
            inputTestID="invitation-username-or-email"
            errorTestID="error-invitation-username-or-email"
            autoCapitalize="none"
            disabled={loading}
          />
        </Box>

        <Button
          marginTop={5}
          paddingX={20}
          paddingY={4}
          isLoading={loading}
          isLoadingText="Enviando"
          onPress={handleSubmit}
          isDisabled={isDisabled}
          testID="send-invitation-button"
        >
          {t('sendInvitation')}
        </Button>
      </Center>
    </SafeAreaView>
  );
}

SendInvitationScreen.propTypes = {
  route: PropTypes.object,
  navigation: PropTypes.object,
};
