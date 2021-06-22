import React from "react";
import { Center, Image } from "native-base";

export default function SplashScreen() {
  return (
    <Center>
      <Image source={require("../../assets/logo_lixt.png")} />
    </Center>
  );
}
