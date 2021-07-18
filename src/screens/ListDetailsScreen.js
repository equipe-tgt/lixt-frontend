import React, { useState, useContext } from 'react';
import { SafeAreaView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Center,
  Spinner,
  useToast,
} from 'native-base';
import { useTranslation } from 'react-i18next';
import { screenBasicStyle as style } from '../styles/style';
import { AuthContext } from '../context/AuthProvider';
import { ListContext } from '../context/ListProvider';
import ListMembersService from '../services/ListMembersService';

export default function ListDetailsScreen(props) {
  const toast = useToast();
  const { user } = useContext(AuthContext);
  const { lists, setLists } = useContext(ListContext);

  const { t } = useTranslation();

  const [list, setList] = useState({
    productsOfList: [],
    listMembers: [],
    description: '',
  });
  const [loading, setLoading] = useState(false);

  useFocusEffect(() => {
    setList(props.route.params.list);
  });

  const leaveList = async () => {
    try {
      setLoading(true);

      // Pega o id do convite atual e faz a deleção do convite
      let { id } = getCurrentInvitation();
      await ListMembersService.deleteInvitation(id, user);

      // Após se desvincular da lista, filtra as listas do usuário de forma
      // que a lista da qual ele se desvinculou não apareça mais
      let editedLists = lists.filter((l) => l.id != list.id);
      setLists([...editedLists]);

      toast.show({
        status: 'success',
        title: 'Você saiu da lista',
      });

      props.navigation.navigate('Lists');
    } catch (error) {
      toast.show({
        status: 'warning',
        title: 'Um erro inesperado ocorreu no servidor',
      });
    } finally {
      setLoading(false);
    }
  };

  const getCurrentInvitation = () => {
    return list.listMembers.find((listMember) => {
      if (listMember.userId === user.id) {
        return listMember;
      }
    });
  };

  return list ? (
    <SafeAreaView style={style.container}>
      <VStack mt={5} width="90%" mx="auto">
        <Box mb={5}>
          <Text fontSize="lg" fontWeight="bold">
            {list.nameList}
          </Text>
          <Text>
            {user.id === list.ownerId
              ? 'Você é o proprietário desta lista'
              : `${list.ownerId} é o proprietário desta lista`}
          </Text>
        </Box>
        <Box mb={5}>
          <Text fontWeight="bold">Descrição</Text>
          <Text>
            {list.description.length
              ? list.description
              : 'Não há descrição para esta lista'}
          </Text>
        </Box>
        <HStack justifyContent="space-between" width="70%" mb={3}>
          <Box>
            <Text fontWeight="bold">Produtos</Text>
            <Text>{list.productsOfList.length}</Text>
          </Box>
          <Box>
            <Text fontWeight="bold">Membros</Text>
            <Text>{list.listMembers.length}</Text>
          </Box>
        </HStack>

        {user.id === list.ownerId ? (
          <Button
            onPress={() => {
              props.navigation.navigate('Invite', {
                list: list,
              });
            }}
            mt={5}
          >
            {t('sendInvitation')}
          </Button>
        ) : (
          <Button
            isLoading={loading}
            isLoadingText="Saindo"
            onPress={leaveList}
            mt={5}
            variant="outline"
          >
            Sair da lista
          </Button>
        )}
      </VStack>
    </SafeAreaView>
  ) : (
    <SafeAreaView>
      <Center>
        <Spinner size="lg" />
      </Center>
    </SafeAreaView>
  );
}
