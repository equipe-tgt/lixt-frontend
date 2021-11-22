import React, { useEffect, useState, useContext } from 'react';
import PropTypes from 'prop-types';
import { SafeAreaView } from 'react-native';
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
import { screenBasicStyle as style } from '../../styles/style';
import { AuthContext } from '../../context/AuthProvider';
import { ListContext } from '../../context/ListProvider';
import ListMembersService from '../../services/ListMembersService';
import RemoveMemberModal from '../../components/RemoveMemberModal';

export default function ListDetailsScreen(props) {
  const toast = useToast();
  const { user } = useContext(AuthContext);
  const { lists, setLists } = useContext(ListContext);
  const [isRemoveMemberModalOpened, setIsRemoveMemberModalOpened] =
    useState(false);

  const { t } = useTranslation();

  const [list, setList] = useState({
    productsOfList: [],
    listMembers: [],
    description: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setList(props.route.params.list);
  }, []);

  const leaveList = async () => {
    try {
      setLoading(true);

      // Pega o id do convite atual e faz a deleção do convite
      const { userId } = getCurrentInvitation();
      await ListMembersService.deleteInvitation(userId, user);

      // Após se desvincular da lista, filtra as listas do usuário de forma
      // que a lista da qual ele se desvinculou não apareça mais
      const editedLists = lists.filter((l) => l.id !== list.id);
      setLists([...editedLists]);

      toast.show({
        status: 'success',
        title: 'Você saiu da lista',
      });

      props.navigation.navigate('Lists');
    } catch (error) {
      toast.show({
        status: 'warning',
        title: t('errorServerDefault'),
      });
    } finally {
      setLoading(false);
    }
  };

  const getCurrentInvitation = () => {
    return list.listMembers.find((listMember) => listMember.userId === user.id);
  };

  const removeMember = async (idMemberList) => {
    try {
      await ListMembersService.deleteInvitation(idMemberList, user);

      const editedMembersList = list.listMembers.filter(
        (lm) => lm.id !== idMemberList
      );
      setList({
        ...list,
        listMembers: editedMembersList,
      });

      toast.show({
        status: 'success',
        title: t('memberRemoved'),
      });
    } catch (error) {
      toast.show({
        status: 'warning',
        title: t('errorServerDefault'),
      });
    } finally {
      setIsRemoveMemberModalOpened(false);
    }
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
              ? t('youAreTheListOwner')
              : `${list.owner} ${t('isTheListOwner')}`}
          </Text>
        </Box>
        <Box mb={5}>
          <Text fontWeight="bold">{t('description')}</Text>
          <Text>
            {list.description.length
              ? list.description
              : t('listHasNoDescription')}
          </Text>
        </Box>
        <Box mb={5}>
          <Text fontWeight="bold">{t('products')}</Text>
          <Text>{list?.productsOfList?.length || 0}</Text>
        </Box>
        <Box mb={5}>
          <Text fontWeight="bold">{t('members')}</Text>
          {list.listMembers && list.listMembers.length > 0 ? (
            <>
              {list?.listMembers
                .filter(
                  (listMember) => listMember.statusListMember === 'ACCEPT'
                )
                .map((listMember, index) => (
                  <Box
                    display="flex"
                    flexDirection="row"
                    justifyContent="space-between"
                    mt={4}
                    key={listMember.id}
                    testID={`list-member-${index}`}
                  >
                    <Box>
                      <Text fontWeight="bold">{listMember.user.name}</Text>
                      <Text fontSize="md">@{listMember.user.username} </Text>
                    </Box>
                    {user.id === list.ownerId && (
                      <Button
                        isLoading={isRemoveMemberModalOpened === listMember.id}
                        isLoadingText={t('removing')}
                        size="sm"
                        variant="link"
                        testID={`remove-member-button-${index}`}
                        onPress={() =>
                          setIsRemoveMemberModalOpened(listMember.id)
                        }
                      >
                        {t('remove')}
                      </Button>
                    )}
                  </Box>
                ))}
            </>
          ) : (
            <Text>{t('noMembers')}</Text>
          )}
        </Box>

        {user.id === list.ownerId ? (
          <Button
            testID="invite-button"
            onPress={() => {
              props.navigation.navigate('Invite', {
                list,
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
            testID="leave-list"
            mt={5}
            variant="outline"
          >
            {t('leaveList')}
          </Button>
        )}

        {list.ownerId === user.id ? (
          <RemoveMemberModal
            isOpen={!!isRemoveMemberModalOpened}
            closeModal={(value) => {
              if (value) removeMember(isRemoveMemberModalOpened);
              else setIsRemoveMemberModalOpened(false);
            }}
          />
        ) : null}
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

ListDetailsScreen.propTypes = {
  route: PropTypes.object,
  navigation: PropTypes.object,
};
