import React, { useContext, useState } from "react";
import { SafeAreaView } from "react-native";
import { screenBasicStyle as style } from "../styles/style";
import {
  Text,
  Box,
  FormControl,
  Center,
  Input,
  TextArea,
  Button,
  useToast,
} from "native-base";
import { AuthContext } from "../context/AuthProvider";
import ListService from "../services/ListService";

// Validação e controle do formulário
import { useFormik } from "formik";
import { ListSchema } from "../validationSchemas";

export default function NewListScreen(props) {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const {t} = useTranslation();

  const { handleChange, handleSubmit, handleBlur, values, errors } = useFormik({
    initialValues: { nameList: "", description: "" },
    validationSchema: ListSchema,
    onSubmit: () => {
      createList();
    },
    validateOnChange: false,
  });

  const createList = async () => {
    setLoading(true);
    try {
      await ListService.createList({ ...values, ownerId: user.id }, user);
      toast.show({
        title: "Lista criada com sucesso!",
        status: "success",
      });

      // Retorna para a tela de listas
      props.navigation.navigate("Lists");
    } catch (error) {
      toast.show({
        title: t("errorServerDefault"),
        status: "error",
      });
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={style.container}>
      <Center width="90%" mx="auto" mt={10}>
        <FormControl>
          <FormControl.Label>{t("nameList")}</FormControl.Label>
          <Input
            type="text"
            onChangeText={handleChange("nameList")}
            onBlur={handleBlur("nameList")}
            value={values.nameList}
            isInvalid={!!errors.nameList}
          />
          <FormControl.HelperText>
            <Text
              style={
                errors.nameList ? { color: "#fb7185" } : { display: "none" }
              }
            >
              {errors.nameList}
            </Text>
          </FormControl.HelperText>
        </FormControl>

        <FormControl>
          <FormControl.Label>{t("description")}</FormControl.Label>
          <TextArea
            onChangeText={handleChange("description")}
            onBlur={handleBlur("description")}
            value={values.description}
            isInvalid={!!errors.description}
          />
          <FormControl.HelperText>
            <Text
              style={
                errors.description ? { color: "#fb7185" } : { display: "none" }
              }
            >
              {errors.description}
            </Text>
          </FormControl.HelperText>
        </FormControl>

        <Button
          marginTop={5}
          paddingX={20}
          paddingY={4}
          isLoading={loading}
          isLoadingText="Criando"
          onPress={handleSubmit}
        >
          Salvar lista
        </Button>
      </Center>
    </SafeAreaView>
  );
}
