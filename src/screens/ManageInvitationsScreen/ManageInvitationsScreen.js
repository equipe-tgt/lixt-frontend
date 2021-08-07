import React, { useState, useContext, useEffect } from 'react';
import { SafeAreaView } from 'react-native';
import {
  Tabs,
  VStack,
  useToast,
  Center,
  Box,
  Text,
  ScrollView,
  HStack,
  Button,
  Spinner,
} from 'native-base';
import { screenBasicStyle as style } from '../../styles/style';

import { AuthContext } from '../../context/AuthProvider';
import { useTranslation } from 'react-i18next';
import ListMembersService, {
  INVITATION_TYPES,
  INVITATION_ACTIONS,
} from '../../services/ListMembersService';

export default function ManageInvitationsScreen() {
  const { user } = useContext(AuthContext);
  const { t } = useTranslation();
  const toast = useToast();

  const [loadingInvitation, setLoadingInvitation] = useState(false);
  const [idInvitationLoading, setIdInvitationLoading] = useState(null);
  const [receivedInvitations, setReceivedInvitations] = useState([]);
  const [sentInvitations, setSentInvitations] = useState([]);

  useEffect(() => {
    getInvitations(0);
    getInvitations(1);
  }, []);

  const getInvitations = (tabIndex) => {
    const invitationType =
      tabIndex === 0 ? INVITATION_TYPES.SENT : INVITATION_TYPES.RECEIVED;

    ListMembersService.getInvitations(invitationType, user)
      .then(({ data }) => {
        if (invitationType === INVITATION_TYPES.SENT) {
          setSentInvitations([...data]);
        } else {
          setReceivedInvitations([...data]);
        }
      })
      .catch(() => {
        toast.show({
          status: 'warning',
          title: 'Um erro inesperado do servidor ocorreu',
        });
      });
  };

  const dealWithInvitation = async (invite, action) => {
    try {
      setLoadingInvitation(true);
      setIdInvitationLoading(invite.id);
      const { data } = await ListMembersService.handleInvitation(
        invite.id,
        action,
        user
      );

      for (const receivedInvite of receivedInvitations) {
        if (receivedInvite.id === data.id) {
          receivedInvite.statusListMember = data.statusListMember;
        }
      }
    } catch (error) {
      toast.show({
        status: 'warning',
        title: 'Um erro inesperado do servidor ocorreu',
      });
    } finally {
      setLoadingInvitation(false);
      setIdInvitationLoading(null);
    }
  };

  const getStatus = (statusFromServer) => {
    switch (statusFromServer) {
      case 'WAITING':
        return t('waitingInvitation');
      case 'ACCEPT':
        return t('acceptedInvitation');
      case 'REJECT':
        return t('rejectedInvitation');
      default:
        break;
    }
  };

  return (
    <SafeAreaView style={style.container}>
      <VStack>
        <Tabs onChange={getInvitations} isFitted>
          <Tabs.Bar>
            <Tabs.Tab>{t('sent')}</Tabs.Tab>
            <Tabs.Tab testID="received-invitations-tab">
              {t('received')}
            </Tabs.Tab>
          </Tabs.Bar>
          <Tabs.Views>
            <Tabs.View>
              {sentInvitations.length > 0 ? (
                <ScrollView>
                  {sentInvitations.map((invite) => (
                    <Box ml={2} py={3} key={invite.id}>
                      <Text
                        fontSize="lg"
                        fontWeight="bold"
                        testID={'sent-invite-' + invite.id}
                      >
                        {`${t('youInvited')} ${invite.userInvited} ${t(
                          'toJoin'
                        )} ${invite.nameList}`}
                      </Text>
                      <Text testID={'sent-invite-status-' + invite.id}>
                        Status: {getStatus(invite.statusListMember)}
                      </Text>
                    </Box>
                  ))}
                </ScrollView>
              ) : (
                <Center>
                  <Text>{t('noInvitationsFound')}</Text>
                </Center>
              )}
            </Tabs.View>
            <Tabs.View>
              {receivedInvitations.length > 0 ? (
                <ScrollView>
                  {receivedInvitations.map((invite) => (
                    <Box ml={2} py={3} key={invite.id}>
                      <Text
                        fontSize="lg"
                        fontWeight="bold"
                        testID={'received-invite-' + invite.id}
                      >
                        {`${invite.userWhoInvite} ${t('hasInvitedYou')} ${
                          invite.nameList
                        }`}
                      </Text>

                      {/* Se o status do convite for "WAITING" dá as opções para rejeitar ou aceitar
                        Caso seja outro status ("ACCEPT" ou "REJECT") só exibe para o usuário
                       */}
                      {invite.statusListMember === 'WAITING' ? (
                        <HStack mt={4}>
                          <Button
                            isDisabled={loadingInvitation}
                            disabled={loadingInvitation}
                            testID="accept-invitation"
                            onPress={() => {
                              dealWithInvitation(
                                invite,
                                INVITATION_ACTIONS.ACCEPT
                              );
                            }}
                          >
                            {t('accept')}
                          </Button>
                          <Button
                            isDisabled={loadingInvitation}
                            disabled={loadingInvitation}
                            variant="link"
                            testID="reject-invitation"
                            onPress={() => {
                              dealWithInvitation(
                                invite,
                                INVITATION_ACTIONS.REJECT
                              );
                            }}
                          >
                            {t('reject')}
                          </Button>

                          {idInvitationLoading === invite.id ? (
                            <Spinner size="sm" />
                          ) : null}
                        </HStack>
                      ) : (
                        <Text testID={'received-invite-status-' + invite.id}>
                          {invite.statusListMember === 'ACCEPT'
                            ? t('youAccepted')
                            : t('youRejected')}
                        </Text>
                      )}
                    </Box>
                  ))}
                </ScrollView>
              ) : (
                <Center>
                  <Text>{t('noInvitationsFound')}</Text>
                </Center>
              )}
            </Tabs.View>
          </Tabs.Views>
        </Tabs>
      </VStack>
    </SafeAreaView>
  );
}
