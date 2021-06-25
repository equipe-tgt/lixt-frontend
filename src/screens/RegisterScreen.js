import React, { useState } from "react";
import {
  Button,
  Link,
  Text,
  Input,
  FormControl,
  Center,
  ScrollView,
  Box,
  Image,
  useToast,
  KeyboardAvoidingView
} from "native-base";

import UserService from "../services/UserService";

// Validação do formulário
import { useFormik } from "formik";
import { RegisterSchema } from "../validationSchemas";

export default function RegisterScreen(props) {
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  // Instanciando formik para controlar as validações do formulário
  const { handleChange, handleSubmit, handleBlur, values, errors, touched } =
    useFormik({
      initialValues: {
        username: "",
        password: "",
        confirmPassword: "",
        name: "",
        email: "",
      },
      validateOnChange: false,
      validateOnBlur: false,
      validationSchema: RegisterSchema,
      onSubmit: () => {
        register();
      },
    });

  const register = async () => {
    try {
      setLoading(true);

      const user = {
        username: values.username,
        password: values.password,
        name: values.name,
        email: values.email,
      };

      await UserService.doRegister(user);

      // Se o registro foi autorizado manda para o login
      props.navigation.navigate("Login");
    } catch (error) {
      // Usuário com dados repetidos
      if (error?.response?.status === 401) {
        toast.show({
          title: "Este nome de usuário ou email já foram registrados",
          status: "warning",
        });
      }
      // Erro do servidor
      else {
        toast.show({
          title: "Um erro inesperado ocorreu no servidor",
          status: "error",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      flex={1}
      _contentContainerStyle={{
        justifyContent: "center",
        alignItems: "center",
        alignContent: "center",
        marginTop: "20%",
        w: "100%",
      }}
    >
      <Center mx="auto" my="auto" width="90%">
        <Image
          source={require("../../assets/logo_lixt.png")}
          resizeMode="contain"
          width="30%"
          height="7%"
          alt="Lixt logo"
        />

        <FormControl>
          <FormControl.Label>Nome</FormControl.Label>
          <Input
            disabled={loading}
            onChangeText={handleChange("name")}
            onBlur={handleBlur("name")}
            error={!!errors.name}
          ></Input>
          <FormControl.HelperText>
            <Text
              style={errors.name ? { color: "#fb7185" } : { display: "none" }}
            >
              {errors.name}
            </Text>
          </FormControl.HelperText>
        </FormControl>

        <FormControl>
          <FormControl.Label>Email</FormControl.Label>
          <Input
            disabled={loading}
            onBlur={handleBlur("email")}
            onChangeText={handleChange("email")}
            error={!!errors.email}
            autoCapitalize="none"
          ></Input>
          <FormControl.HelperText>
            <Text
              style={errors.email ? { color: "#fb7185" } : { display: "none" }}
            >
              {errors.email}
            </Text>
          </FormControl.HelperText>
        </FormControl>

        <FormControl>
          <FormControl.Label>Nome de usuário</FormControl.Label>
          <Input
            disabled={loading}
            onBlur={handleBlur("username")}
            onChangeText={handleChange("username")}
            error={!!errors.username}
            autoCapitalize="none"
          ></Input>
          <FormControl.HelperText>
            <Text
              style={
                errors.username ? { color: "#fb7185" } : { display: "none" }
              }
            >
              {errors.username}
            </Text>
          </FormControl.HelperText>
        </FormControl>

        <FormControl>
          <FormControl.Label>Senha</FormControl.Label>
          <Input
            disabled={loading}
            onBlur={handleBlur("password")}
            onChangeText={handleChange("password")}
            secureTextEntry={true}
            error={!!errors.password}
          ></Input>
          <FormControl.HelperText>
            <Text
              style={
                errors.password ? { color: "#fb7185" } : { display: "none" }
              }
            >
              {errors.password}
            </Text>
          </FormControl.HelperText>
        </FormControl>

        <FormControl>
          <FormControl.Label>Confirmação de senha</FormControl.Label>
          <Input
            disabled={loading}
            onBlur={handleBlur("confirmPassword")}
            onChangeText={handleChange("confirmPassword")}
            secureTextEntry={true}
            error={!!errors.confirmPassword}
          ></Input>
          <FormControl.HelperText>
            <Text
              style={
                errors.confirmPassword
                  ? { color: "#fb7185" }
                  : { display: "none" }
              }
            >
              {errors.confirmPassword}
            </Text>
          </FormControl.HelperText>
        </FormControl>

        <Button
          paddingX={20}
          paddingY={4}
          isLoading={loading}
          isLoadingText="Registrando"
          marginTop={5}
          onPress={handleSubmit}
        >
          <Text style={{ color: "#fff" }}>Registrar</Text>
        </Button>

        <Box style={{ flexDirection: "row" }} mt={5}>
          <Text mr={2}>Já tem uma conta?</Text>
          <Link
            onPress={() => {
              props.navigation.navigate("Login");
            }}
          >
            <Text color="blue.500"> Faça login</Text>
          </Link>
        </Box>
      </Center>
    </KeyboardAvoidingView>
  );
}
