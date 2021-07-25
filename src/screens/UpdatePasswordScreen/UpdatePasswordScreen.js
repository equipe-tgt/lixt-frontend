import React, { useState, useContext } from 'react';
import PropTypes from 'prop-types';
import {
  SafeAreaView,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { Button, Text, useToast, Box, Center } from 'native-base';

import { AuthContext } from '../../context/AuthProvider';
import UserService from '../../services/UserService';

import { screenBasicStyle as style } from '../../styles/style';
import { useTranslation } from 'react-i18next';

import { useFormik } from 'formik';
import { UpdatePasswordSchema } from '../../validationSchemas';
import LixtInput from '../../components/LixtInput';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'space-around',
  },

  form: {
    marginBottom: 16,
  },
});

export default function UpdatePasswordScreen(props) {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const { t } = useTranslation();

  const { handleChange, handleSubmit, handleBlur, values, errors } = useFormik({
    initialValues: {
      password: '',
      confirmPassword: '',
    },
    validateOnChange: false,
    validateOnBlur: false,
    validationSchema: UpdatePasswordSchema(t),
    onSubmit: () => updatePassword(),
  });

  const updatePassword = () => {
    setLoading(true);

    UserService.updatePassword(values.password, user.token)
      .then(() => {
        toast.show({
          title: t('passwordUpdatedSucessfully'),
          status: 'success',
        });
        props.navigation.navigate('Profile');
      })
      .catch(() => {
        toast.show({ title: t('errorServerDefault'), status: 'error' });
      })
      .finally(() => setLoading(false));
  };

  return (
    <SafeAreaView style={style.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} flex={1}>
          <Center mx="auto" my="auto" width="90%" flex={1}>
            <Box marginBottom="16px" width="282px">
              <LixtInput
                labelName="password"
                error={errors.password}
                onBlur={handleBlur('password')}
                onChangeText={handleChange('password')}
                inputTestID="update-password"
                errorTestID="error-update-password"
                disabled={loading}
                secureTextEntry
              />
            </Box>

            <Box marginBottom="16px" width="282px">
              <LixtInput
                labelName="confirmPassword"
                error={errors.confirmPassword}
                onBlur={handleBlur('confirmPassword')}
                onChangeText={handleChange('confirmPassword')}
                inputTestID="update-confirm-password"
                errorTestID="error-update-confirm-password"
                disabled={loading}
                secureTextEntry
              />
            </Box>

            <Button
              paddingX={20}
              paddingY={4}
              isLoading={loading}
              isLoadingText={t('updating')}
              onPress={handleSubmit}
              marginTop={4}
              testID="update-button"
            >
              <Text style={{ color: '#fff' }}>{t('updatePassword')}</Text>
            </Button>
          </Center>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

UpdatePasswordScreen.propTypes = {
  navigation: PropTypes.object,
};
