import React from "react";
import { Center, Image } from "native-base";

export default function SplashScreen() {
  return (
    <Center style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Image alt="Lixt logo" source={require("../../assets/logo_lixt.png")} />
    </Center>
  );
}
