import React, { useState, useContext } from "react";
import { SafeAreaView } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Box, VStack, HStack, Text, Button } from "native-base";
import { screenBasicStyle as style } from "../styles/style";

import { AuthContext } from "../context/AuthProvider";

export default function ListDetailsScreen(props) {
  const [list, setList] = useState({
    productsOfList: [],
    listMembers: []
  });
  const { user } = useContext(AuthContext);

  useFocusEffect(() => {
    setList(props.route.params.list);
  });

  return (
    <SafeAreaView style={style.container}>
      <VStack width="90%" mx="auto">
        <Box>
          <Text>{list.nameList}</Text>
          <Text>
            {user.id === list.ownerId
              ? "Você é o proprietário desta lista"
              : null}
          </Text>
        </Box>
        <Box>
          <Text>Descrição</Text>
          <Text>{list.description}</Text>
        </Box>
        <HStack>
          <Box>
            <Text>Produtos</Text>
            <Text>{list.productsOfList.length}</Text>
          </Box>
          <Box>
            <Text>Membros</Text>
            <Text>{list.listMembers.length}</Text>
          </Box>
        </HStack>

        {user.id === list.ownerId ? (
          <Button>Convidar</Button>
        ) : (
          <Button variant="outline">Sair da lista</Button>
        )}
      </VStack>
    </SafeAreaView>
  );
}
