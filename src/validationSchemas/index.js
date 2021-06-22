import * as Yup from "yup";

export const LoginSchema = Yup.object().shape({
  username: Yup.string().required("Este campo é obrigatório"),
  password: Yup.string()
    .max(20, "Senha muito longa")
    .required("Este campo é obrigatório"),
});

export const RegisterSchema = Yup.object().shape({
  username: Yup.string().required("Este campo é obrigatório"),
  password: Yup.string()
    .max(20, "Senha muito longa")
    .required("Este campo é obrigatório"),
  email: Yup.string()
    .max(120)
    .email("O email é inválido")
    .required("Este campo é obrigatório"),
  name: Yup.string().max(45).required("Este campo é obrigatório"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "As senhas não são iguais")
    .required("Este campo é obrigatório"),
});
