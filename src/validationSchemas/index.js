import * as Yup from 'yup';

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

export const ListSchema = (t) =>
  Yup.object().shape({
    nameList: Yup.string()
      .max(45, t('fieldMaxChars', { max: 45 }))
      .required(t('requiredField')),
    description: Yup.string().max(200, t('fieldMaxChars', { max: 200 })),
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

export const ProductOfListSchema = (language) => 
  Yup.object().shape({
    price: Yup.string().matches(
      language === "en_US" ?
        /^-?(?:\d+|\d{1,3}(?:,\d{3})+)(?:(\.)\d+)?$/ :
        language === "pt_BR" ? 
        /^-?(?:\d+|\d{1,3}(?:\.\d{3})+)(?:(,)\d+)?$/ :
        /^-?(?:\d+|\d{1,3}(?:,\d{3})+)(?:(\.)\d+)?$/),
    plannedAmount: Yup.string().matches(
      /^-?(?:\d+|\d{1,3}(?:,\d{3})+)(?:(\.|,)\d+)?$/
    ),
    measureValue: Yup.string().matches(
      /^-?(?:\d+|\d{1,3}(?:,\d{3})+)(?:(\.|,)\d+)?$/
    ),
  });

export const ProductSchema = (t) =>
  Yup.object().shape({
    name: Yup.string()
      .max(45, t('fieldMaxChars', { max: 45 }))
      .required(t('requiredField')),
    measureValue: Yup.string().matches(
      /^-?(?:\d+|\d{1,3}(?:,\d{3})+)(?:(\.|,)\d+)?$/
    ),
    categoryId: Yup.number().required(t('selectAnOption')),
  });

export const InviteSchema = (t) =>
  Yup.object().shape({
    username: Yup.string()
      .max(120, t('fieldMaxChars', { max: 120 }))
      .required(t('requiredField')),
  });

export const PurchaseLocal = (t) =>
  Yup.object().shape({
    name: Yup.string()
      .max(45, t('fieldMaxChars', { max: 45 }))
      .required(t('requiredField')),
  });
