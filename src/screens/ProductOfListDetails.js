import React, { useEffect, useState } from "react";
import { SafeAreaView, Text } from "react-native";
import {
  FormControl,
  Input,
  ScrollView,
  Radio,
  Select,
  Button,
  Heading,
} from "native-base";

import { useTranslation } from "react-i18next";
import { screenBasicStyle as style } from "../styles/style";

// Validação do formulário
import MEASURE_TYPES from "../utils/measureTypes";
import { ProductOfListSchema } from "../validationSchemas/index";
import { useFormik } from "formik";

export default function ProductOfListDetails(props) {
  const { t } = useTranslation();
  const [categories, setCategories] = useState([]);

  // Instanciando formik para controlar as validações do formulário
  const { handleChange, handleSubmit, handleBlur, values, errors, touched } =
    useFormik({
      initialValues: {
        price: props.route.params.product.price,
        amount: props.route.params.product.amount,
        measureType: props.route.params.product.measureType,
        measureValue: String(props.route.params.product.measureValue),
      },
      validateOnChange: false,
      validateOnBlur: false,
      validationSchema: ProductOfListSchema,
      onSubmit: () => {
        edit();
      },
    });

  return (
    <SafeAreaView style={style.container}>
      <ScrollView w="90%" mx="auto">
        <Heading>
          {t("editing")} "{props.route.params.product.product.name}"
        </Heading>

        <FormControl my={3}>
          <FormControl.Label>{t("price")}</FormControl.Label>
          <Input
            type="number"
            value={values.price}
            onChangeText={handleChange("price")}
          />
          <FormControl.HelperText>
            <Text
              style={errors.price ? { color: "#fb7185" } : { display: "none" }}
            >
              {errors.price}
            </Text>
          </FormControl.HelperText>
        </FormControl>

        <FormControl my={3}>
          <FormControl.Label>{t("measureType")}</FormControl.Label>
          <Radio.Group
            value={values.measureType}
            onChange={handleChange("measureType")}
            flexDirection="row"
            justifyContent="space-around"
          >
            {Object.keys(MEASURE_TYPES).map((measure) => {
              return (
                <Radio
                  key={measure}
                  accessibilityLabel={measure}
                  value={measure}
                  my={1}
                >
                  {measure}
                </Radio>
              );
            })}
          </Radio.Group>
        </FormControl>

        {/* Se a unidade de medida do produto não for do tipo "unidade" questiona o valor de mensura,
        Ex.: Produto: Arroz, unidade de medida: KG, valor da mensura: 5 = Arroz 5KG
        */}
        {values.measureType !== "UN" ? (
          <FormControl my={3}>
            <FormControl.Label>{t("measureValue")}</FormControl.Label>
            <Input
              value={values.measureValue}
              onChangeText={handleChange("measureValue")}
            />
            <FormControl.HelperText>
              <Text
                style={
                  errors.measureValue
                    ? { color: "#fb7185" }
                    : { display: "none" }
                }
              >
                {errors.measureValue}
              </Text>
            </FormControl.HelperText>
          </FormControl>
        ) : null}

        <FormControl my={3}>
          <FormControl.Label>{t("amount")}</FormControl.Label>
          <Input value={values.amount} onChangeText={handleChange("amount")} />
        </FormControl>

        <Button onPress={handleSubmit} marginTop={5} paddingX={20} paddingY={4}>
          {t("finish")}
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}
