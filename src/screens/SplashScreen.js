import React from "react";
import { Center, Image } from "native-base";

export default function SplashScreen() {
  return (
    <Center style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Image source={require("../../assets/logo_lixt.png")} />
    </Center>
  );
}
