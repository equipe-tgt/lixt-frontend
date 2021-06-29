import * as Yup from "yup";
import MEASURE_TYPES from "../utils/measureTypes";

export const LoginSchema = Yup.object().shape({
  username: Yup.string().required("Este campo é obrigatório"),
  password: Yup.string()
    .max(20, "Senha muito longa")
    .required("Este campo é obrigatório"),
});

export const RegisterSchema = Yup.object().shape({
  username: Yup.string()
    .max(45, "Este campo deve possuir até 45 caracteres")
    .required("Este campo é obrigatório"),
  password: Yup.string()
    .min(8, "A senha deve ter no mínimo 8 caracteres")
    .max(20, "Senha muito longa")
    .required("Este campo é obrigatório"),
  email: Yup.string()
    .max(120, "Este campo deve possuir até 120 caracteres")
    .email("O email é inválido")
    .required("Este campo é obrigatório"),
  name: Yup.string()
    .max(45, "Este campo deve possuir até 45 caracteres")
    .required("Este campo é obrigatório"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "As senhas não são iguais")
    .required("Este campo é obrigatório"),
});

export const ResetPasswordSchema = Yup.object().shape({
  email: Yup.string()
    .max(120)
    .email("O email é inválido")
    .required("Este campo é obrigatório"),
});

export const ListSchema = Yup.object().shape({
  nameList: Yup.string()
    .max(45, "Este campo deve possuir até 45 caracteres")
    .required("Este campo é obrigatório"),
  description: Yup.string().max(
    200,
    "Este campo deve possuir até 200 caracteres"
  ),
});

export const UpdatePasswordSchema = Yup.object().shape({
  password: Yup.string()
    .min(8, "A senha deve ter no mínimo 8 caracteres")
    .max(20, "Senha muito longa")
    .required("Este campo é obrigatório"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "As senhas não são iguais")
    .required("Este campo é obrigatório"),
});

export const ProductOfListSchema = Yup.object().shape({
  price: Yup.string().matches(/^-?(?:\d+|\d{1,3}(?:,\d{3})+)(?:(\.|,)\d+)?$/),
  amount: Yup.string().matches(/^-?(?:\d+|\d{1,3}(?:,\d{3})+)(?:(\.|,)\d+)?$/),
  measureValue: Yup.string().matches(
    /^-?(?:\d+|\d{1,3}(?:,\d{3})+)(?:(\.|,)\d+)?$/
  ),
});

export const ProductSchema = Yup.object().shape({
  name: Yup.string()
    .max(45, "Este campo deve possuir até 45 caracteres")
    .required("Este campo é obrigatório"),
  measureValue: Yup.number().typeError("Este campo deve ser numérico"),
});
