import React, { useState, useContext } from 'react';
import PropTypes from 'prop-types';
import { SafeAreaView } from 'react-native';
import { Box, Text, ScrollView, HStack, Button, useToast } from 'native-base';
import { useFocusEffect } from '@react-navigation/native';
import { screenBasicStyle as style } from '../styles/style';

import { AuthContext } from '../context/AuthProvider';
import { useTranslation } from 'react-i18next';
import ListMembersService from '../services/ListMembersService';

export default function MembersListScreen(props) {
  const { user } = useContext(AuthContext);
  const { t } = useTranslation();
  const toast = useToast();

  const [listMembers, setListMembers] = useState([]);
  const [owner, setOwner] = useState('');
  const [isUserTheOwner, setIsUserTheOwner] = useState(false);
  const [idMemberLoading, setIdMemberLoading] = useState(null);

  // Hook que dispara toda vez que esta tela for focada
  useFocusEffect(() => {
    if (!owner) {
      const { listMembers, owner, ownerId } = props.route.params.list;

      setIsUserTheOwner(user.id === ownerId);

      // Se o usuário não for o dono da lista, rearranja a lista de membros para que ele apareça em primeiro
      if (!isUserTheOwner) {
        listMembers.sort((a, b) => (a.id === user.id) - (b.id === user.id));
      }

      // Se o usuário for o dono da lista o nome do proprietário aparecerá com a indicação "você"
      // ex.: "nome-do-dono - você"
      const ownerText = isUserTheOwner ? `${owner} - ${t('you')}` : owner;

      setListMembers(listMembers);
      setOwner(ownerText);
    }
  });

  const removeMember = async (idMemberList) => {
    setIdMemberLoading(idMemberList);
    try {
      await ListMembersService.deleteInvitation(idMemberList, user);

      const editedMembersList = listMembers.filter(
        (lm) => lm.id !== idMemberList
      );
      setListMembers(editedMembersList);

      toast.show({
        status: 'success',
        title: 'Membro foi removido da lista',
      });
    } catch (error) {
      toast.show({
        status: 'warning',
        title: 'Um erro inesperado ocorreu no servidor',
      });
    } finally {
      setIdMemberLoading(null);
    }
  };

  return (
    <SafeAreaView style={style.container}>
      <ScrollView>
        <Box ml={5} my={3}>
          <Text fontSize="lg" fontWeight="bold">
            {owner}
          </Text>
          <Text>{t('owner')}</Text>
        </Box>

        <Box mt={2} mb={5} ml={5}>
          <Text>{`${listMembers.length} ${t('members')}`}</Text>
        </Box>

        {listMembers.map((lm) => (
          <HStack mb={5} ml={5} key={lm.id} justifyContent="space-between">
            <Box>
              <Text fontSize="lg" fontWeight="bold">
                {lm.user.name}
              </Text>
              {/* Se o usuário for o convidado realça na tela em que posição da lista ele está */}
              <Text fontSize="md">
                @{lm.user.username}{' '}
                {lm.user.id === user.id ? `(${t('you')})` : null}
              </Text>
              <Text mt={2}>{t('guest')}</Text>
            </Box>

            {/* Se o usuário for o dono da lista mostra o botão para remover um usuário */}
            {isUserTheOwner && (
              <Button
                mr={3}
                isLoading={idMemberLoading === lm.id}
                isLoadingText={t('removing')}
                variant="link"
                onPress={() => {
                  removeMember(lm.id);
                }}
              >
                {t('remove')}
              </Button>
            )}
          </HStack>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

MembersListScreen.propTypes = {
  route: PropTypes.object,
  navigation: PropTypes.object,
};
