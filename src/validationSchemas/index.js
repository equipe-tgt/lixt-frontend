import * as Yup from 'yup';
import MEASURE_TYPES from '../utils/measureTypes';

export const LoginSchema = (t) =>
  Yup.object().shape({
    username: Yup.string().required('requiredField'),
    password: Yup.string().max(20, 'longPassword').required('requiredField'),
  });

export const RegisterSchema = (t) =>
  Yup.object().shape({
    username: Yup.string()
      .max(45, t('fieldMaxChars', { max: 45 }))
      .required(t('requiredField')),
    password: Yup.string()
      .min(8, t('passwordMinLength', { min: 8 }))
      .max(20, t('longPassword'))
      .required(t('requiredField')),
    email: Yup.string()
      .max(120, t('fieldMaxChars', { max: 120 }))
      .email(t('invalidEmail'))
      .required(t('requiredField')),
    name: Yup.string()
      .max(45, t('fieldMaxChars', { max: 45 }))
      .required(t('requiredField')),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password')], t('passwordsDontMatch'))
      .required(t('requiredField')),
  });

export const ResetPasswordSchema = (t) =>
  Yup.object().shape({
    email: Yup.string()
      .max(120, t('fieldMaxChars', { max: 120 }))
      .email('invalidEmail')
      .required('requiredField'),
  });

export const ListSchema = Yup.object().shape({
  nameList: Yup.string()
    .max(45, 'Este campo deve possuir até 45 caracteres')
    .required('Este campo é obrigatório'),
  description: Yup.string().max(
    200,
    'Este campo deve possuir até 200 caracteres'
  ),
});

export const UpdatePasswordSchema = (t) =>
  Yup.object().shape({
    password: Yup.string()
      .min(8, t('passwordMinLength', { min: 8 }))
      .max(20, t('longPassword'))
      .required(t('requiredField')),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password')], t('passwordsDontMatch'))
      .required(t('requiredField')),
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
    .max(45, 'Este campo deve possuir até 45 caracteres')
    .required('Este campo é obrigatório'),
  measureValue: Yup.string().matches(
    /^-?(?:\d+|\d{1,3}(?:,\d{3})+)(?:(\.|,)\d+)?$/
  ),
});

export const InviteSchema = (t) =>
  Yup.object().shape({
    username: Yup.string()
      .max(120, t('fieldMaxChars', { max: 120 }))
      .required(t('requiredField')),
  });
