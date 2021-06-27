import React, { useEffect } from "react";
import { View, Text } from "react-native";

export default function ProductOfListDetails(props) {
  useEffect(() => {
    console.log(props);
  }, []);

  return (
    <View>
      <Text>Detalhes</Text>
    </View>
  );
}
