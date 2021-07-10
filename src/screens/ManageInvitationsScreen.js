import React, { useState, useContext, useEffect } from "react";
import { SafeAreaView } from "react-native";
import {
  Tabs,
  VStack,
  useToast,
  Center,
  Box,
  Text,
  ScrollView,
} from "native-base";
import { screenBasicStyle as style } from "../styles/style";

import { AuthContext } from "../context/AuthProvider";
import { ListContext } from "../context/ListProvider";
import { useTranslation } from "react-i18next";
import ListMembersService, {
  INVITATION_TYPES,
  INVITATION_ACTIONS,
} from "../services/ListMembersService";

export default function ManageInvitationsScreen() {
  const { user } = useContext(AuthContext);
  const { lists } = useContext(ListContext);
  const { t } = useTranslation();
  const toast = useToast();

  const [receivedInvitations, setReceivedInvitations] = useState([]);
  const [sentInvitations, setSentInvitations] = useState([]);

  useEffect(() => {
    getInvitations(0);
    getInvitations(1);
  }, []);

  const getInvitations = async (tabIndex) => {
    const invitationType =
      tabIndex === 0 ? INVITATION_TYPES.SENT : INVITATION_TYPES.RECEIVED;

    try {
      const { data } = await ListMembersService.getInvitations(
        invitationType,
        user
      );

      if (invitationType === INVITATION_TYPES.SENT) {
        setSentInvitations([...data]);
      } else {
        setReceivedInvitations([...data]);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const dealWithInvitation = async (invite, action) => {
    try {
      await ListMembersService.handleInvitation(invite.id, action, user);
    } catch (error) {
      console.log(error);
    }
  };

  const getStatus = (statusFromServer) => {
    switch (statusFromServer) {
      case "WAITING":
        return t("waitingInvitation");
      case "ACCEPT":
        return t("acceptedInvitation");
      case "REJECT":
        return t("rejectedInvitation");
      default:
        break;
    }
  };

  return (
    <SafeAreaView style={style.container}>
      <VStack>
        <Tabs onChange={getInvitations} isFitted={true}>
          <Tabs.Bar>
            <Tabs.Tab>Enviados</Tabs.Tab>
            <Tabs.Tab>Recebidos</Tabs.Tab>
          </Tabs.Bar>
          <Tabs.Views>
            <Tabs.View>
              {sentInvitations.length > 0 ? (
                <ScrollView w="90%">
                  {sentInvitations.map((invite) => (
                    <Box ml={2} py={3} key={invite.id}>
                      <Text fontSize="lg" fontWeight="bold">
                        Você convidou {invite.user.name} para{" "}
                        {lists.find((l) => l.id === invite.listId).nameList}
                      </Text>
                      <Text>Status: {getStatus(invite.statusListMember)}</Text>
                    </Box>
                  ))}
                </ScrollView>
              ) : (
                <Center></Center>
              )}
            </Tabs.View>
            <Tabs.View>
              {receivedInvitations.length > 0 ? (
                <ScrollView w="90%">
                  {receivedInvitations.map((invite) => (
                    <Box ml={2} py={3} key={invite.id}>
                      <Text fontSize="lg" fontWeight="bold">
                        Convite para entrar em {invite.listId}
                      </Text>
                    </Box>
                  ))}
                </ScrollView>
              ) : (
                <Center></Center>
              )}
            </Tabs.View>
          </Tabs.Views>
        </Tabs>
      </VStack>
    </SafeAreaView>
  );
}
