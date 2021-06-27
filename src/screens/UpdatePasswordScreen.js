import React, { useState, useContext } from "react";
import { SafeAreaView, StyleSheet, Platform, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard } from "react-native";
import {
  Button,
  Text,
  Link,
  VStack,
  Box,
  Heading,
  Pressable,
  FormControl,
  useToast,
  Input,
  Center,
} from "native-base";

import { AuthContext } from "../context/AuthProvider";
import UserService from "../services/UserService";

import { screenBasicStyle as style } from "../styles/style";
import {useTranslation} from 'react-i18next';

import { useFormik } from "formik";
import { UpdatePasswordSchema } from "../validationSchemas";

export default function UpdatePasswordScreen(props) {

  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const {t} = useTranslation();

  const { handleChange, handleSubmit, handleBlur, values, errors, touched } =
    useFormik({
        initialValues: {
        password: "",
        confirmPassword: "",
        },
        validateOnChange: false,
        validateOnBlur: false,
        validationSchema: UpdatePasswordSchema,
        onSubmit: () => {
            updatePassword();
        },
    });

    const updatePassword = async () => {
        setLoading(true);
        
        try {
          await UserService.updatePassword(values.password, user.token);

          toast.show({ title: t("passwordUpdatedSucessfully"), status: "success", });

          props.navigation.navigate("Profile");

        } catch (error) {

          toast.show({ title: t("errorServerDefault"), status: "error", });
          setLoading(false);
        }
      };

  return (
    <SafeAreaView style={style.container}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} flex={1}>
                <Center mx="auto" my="auto" width="90%" flex={1}>

                    <FormControl style={styles.form}>
                        <FormControl.Label>{t("password")}</FormControl.Label>
                        <Input
                            disabled={loading}
                            onBlur={handleBlur("password")}
                            onChangeText={handleChange("password")}
                            secureTextEntry={true}
                            error={!!errors.password}
                        ></Input>
                        <FormControl.HelperText>
                            <Text
                            style={ errors.password ? { color: "#fb7185" } : { display: "none" }}
                            >
                            {errors.password}
                            </Text>
                        </FormControl.HelperText>
                    </FormControl>

                    <FormControl style={styles.form}>
                        <FormControl.Label>{t("confirmPassword")}</FormControl.Label>
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
                        isLoadingText={t("updating")}
                        onPress={handleSubmit}
                        marginTop={4}
                    >
                        <Text style={{ color: "#fff" }}>{t("updatePassword")}</Text>
                    </Button>

                </Center>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'space-around'
    },

    form: {
        marginBottom: 16
    }
});
