import React, { useState } from 'react';
import {
  Button,
  Link,
  Text,
  Center,
  Box,
  Image,
  useToast,
  KeyboardAvoidingView,
} from 'native-base';
import { useTranslation } from 'react-i18next';
import { useFormik } from 'formik';

import UserService from '../../services/UserService';
// Validação do formulário
import { RegisterSchema } from '../../validationSchemas';
import LixtInput from '../../components/LixtInput';

export default function RegisterScreen({ navigation }) {
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const { t } = useTranslation();

  // Instanciando formik para controlar as validações do formulário
  const { handleChange, handleSubmit, handleBlur, values, errors } = useFormik({
    initialValues: {
      username: '',
      password: '',
      confirmPassword: '',
      name: '',
      email: '',
    },
    validateOnChange: false,
    validateOnBlur: false,
    validationSchema: RegisterSchema(t),
    onSubmit: () => register(),
  });

  const register = () => {
    setLoading(true);
    const { username, password, name, email } = values;

    UserService.doRegister({ username, password, name, email })
      .then(() => navigation.navigate('Login'))
      .catch((error) => {
        console.log({ error });

        if (error?.response?.data === 'Email já cadastrado na plataforma') {
          toast.show({
            title: t('emailAlreadyTaken'),
            status: 'warning',
          });
        } else if (
          error?.response?.data === 'Usuário já cadastrado na plataforma'
        ) {
          toast.show({
            title: t('usernameAlreadyTaken'),
            status: 'warning',
          });
        }
        // Erro do servidor
        else {
          toast.show({
            title: t('errorServerDefault'),
            status: 'error',
          });
        }
      })
      .finally(() => setLoading(false));
  };

  return (
    <KeyboardAvoidingView
      flex={1}
      _contentContainerStyle={{
        justifyContent: 'center',
        alignItems: 'center',
        alignContent: 'center',
        marginTop: '20%',
        w: '100%',
      }}
    >
      <Center mx="auto" my="auto" width="90%">
        <Image
          source={require('../../../assets/logo_lixt.png')}
          resizeMode="contain"
          width="30%"
          height="7%"
          alt="Lixt logo"
        />

        <LixtInput
          labelName="name"
          error={errors.name}
          onChangeText={handleChange('name')}
          handleBlur={handleBlur('name')}
          inputTestID="register-name"
          errorTestID="error-register-name"
          disabled={loading}
          isInvalid={!!errors.name}
        />

        <LixtInput
          labelName="Email"
          error={errors.email}
          onChangeText={handleChange('email')}
          onBlur={handleBlur('email')}
          inputTestID="register-email"
          errorTestID="error-register-email"
          disabled={loading}
          isInvalid={!!errors.name}
          autoCapitalize="none"
        />

        <LixtInput
          labelName="username"
          error={errors.username}
          onChangeText={handleChange('username')}
          onBlur={handleBlur('username')}
          inputTestID="register-username"
          errorTestID="error-register-username"
          disabled={loading}
          isInvalid={!!errors.name}
          autoCapitalize="none"
        />

        <LixtInput
          labelName="password"
          error={errors.password}
          onChangeText={handleChange('password')}
          onBlur={handleBlur('password')}
          inputTestID="register-password"
          errorTestID="error-register-password"
          disabled={loading}
          isInvalid={!!errors.name}
          secureTextEntry
        />

        <LixtInput
          labelName="confirmPassword"
          error={errors.confirmPassword}
          onChangeText={handleChange('confirmPassword')}
          onBlur={handleBlur('confirmPassword')}
          inputTestID="register-confirm-password"
          errorTestID="error-register-confirm-password"
          disabled={loading}
          isInvalid={!!errors.name}
          secureTextEntry
        />

        <Button
          paddingX={20}
          paddingY={4}
          isLoading={loading}
          isLoadingText={t('registering')}
          marginTop={5}
          onPress={handleSubmit}
          testID="register-button"
        >
          <Text style={{ color: '#fff' }}>{t('register')}</Text>
        </Button>

        <Box style={{ flexDirection: 'row' }} mt={5}>
          <Text mr={2}>{t('alreadyHaveAnAccount')}</Text>
          <Link
            onPress={() => {
              navigation.navigate('Login');
            }}
          >
            <Text color="blue.500">{t('doLogin')}</Text>
          </Link>
        </Box>
      </Center>
    </KeyboardAvoidingView>
  );
}
