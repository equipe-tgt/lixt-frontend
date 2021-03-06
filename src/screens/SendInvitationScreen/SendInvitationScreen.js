import React, { useState, useContext } from 'react';
import PropTypes from 'prop-types';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native';
import { Center, Button, Select, useToast, Box } from 'native-base';
import { useFormik } from 'formik';
import { useTranslation } from 'react-i18next';
import InviteToThePlatformModal from '../../components/InviteToThePlatformModal';

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

  const [isModalOpen, setIsModalOpen] = useState(false);

  useFocusEffect(() => {
    // Verifica se alguma tela enviou props para essa
    if (props.route.params?.list) {
      // Caso a tela de listas tenha enviado uma lista seleciona ela automaticamente
      const list = props.route.params.list;
      const foundList = lists.find((l) => l.id === list.id);
      if (foundList) {
        setSelectedList(foundList);
        props.route.params.list = null;
      }
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
          title: t('invitationToYourself'),
        });
        return;
      }

      sendInvitation();
    },
  });

  const sendInvitation = (
    config = { triedToInviteOutsider: false, newValue: null }
  ) => {
    setLoading(true);

    let status;
    let title;
    let description;

    // Lida com o caso do usuário tentar convidar alguém externo, e ao abrir o modal de convite para usuários externos,
    // convidou alguém que já está na plataforma
    const recipient = config.triedToInviteOutsider
      ? config.newValue
      : values.username;

    ListMembersService.sendInvite(recipient, selectedList.id, user)
      .then(() => {
        title = config.triedToInviteOutsider
          ? t('userAlreadyOnPlatform')
          : t('invitationSent', {
              username: recipient,
            });

        if (config.triedToInviteOutsider)
          description = t('weSentAnInviteToThem');

        status = 'success';
      })
      .catch((error) => {
        if (error?.response?.status === 409) {
          status = 'info';
          title = t('repeatedInvitation', { username: values.username });
        } else if (error?.response?.status === 404) {
          setIsModalOpen(true);
        } else {
          status = 'warning';
          title = t('errorServerDefault');
        }
      })
      .finally(() => {
        const toastConfig = {
          status,
          title,
        };

        if (description) toastConfig.description = description;

        toast.show(toastConfig);
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
            selectedValue={selectedList?.id}
            onValueChange={(listId) => {
              const foundList = lists.find(
                (list) => list.id === Number(listId)
              );
              if (foundList) {
                setSelectedList(foundList);
              }
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
          onPress={handleSubmit}
          isDisabled={isDisabled}
          testID="send-invitation-button"
        >
          {t('sendInvitation')}
        </Button>
      </Center>
      {isModalOpen && (
        <InviteToThePlatformModal
          closeModal={() => setIsModalOpen(false)}
          usernameOrEmail={values.username}
          isOpen={isModalOpen}
          sendToRegisteredUser={(value) => {
            // Caso o usuário tenha aberto o modal de convite para usuário externo
            // mas tenha convidado alguém que já está na plataforma, define triedToInviteOutsider como true
            sendInvitation({ triedToInviteOutsider: true, newValue: value });
          }}
        />
      )}
    </SafeAreaView>
  );
}

SendInvitationScreen.propTypes = {
  route: PropTypes.object,
  navigation: PropTypes.object,
};
