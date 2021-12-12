import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { Button, Text, Modal, useToast } from 'native-base';
import { useTranslation } from 'react-i18next';
import LixtInput from './LixtInput';
import { useFormik } from 'formik';
import { AuthContext } from '../context/AuthProvider';

import ListMembersService from '../services/ListMembersService';
import { InviteToThePlatformSchema } from '../validationSchemas';

export default function InviteToThePlatformModal(props) {
  const { t } = useTranslation();
  const { user } = useContext(AuthContext);
  const toast = useToast();

  const getEmail = () => {
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (props?.usernameOrEmail.match(emailRegex)) {
      return props.usernameOrEmail;
    } else {
      return '';
    }
  };

  const { handleChange, handleSubmit, handleBlur, values, errors } = useFormik({
    initialValues: {
      email: getEmail(),
    },
    validateOnChange: false,
    validateOnBlur: false,
    validationSchema: InviteToThePlatformSchema(t),
    onSubmit: () => {
      if (values.email === user.email) {
        toast.show({
          status: 'warning',
          title: t('invitationToYourself'),
        });
        return;
      }

      sendInvitation();
    },
  });

  const sendInvitation = () => {
    console.log('hey kitty girl');
  };

  return (
    <Modal
      isOpen={props.isOpen}
      onClose={props.closeModal}
      justifyContent="center"
      alignItems="center"
    >
      <Modal.Content>
        <Modal.CloseButton />
        <Modal.Header fontSize="lg" fontWeight="bold">
          {t('inviteToThePlatform')}
        </Modal.Header>
        <Modal.Body my={2}>
          <Text mb={3}>{t('userNotOnPlatform')}</Text>
          <LixtInput
            labelName="email"
            value={values.email}
            error={errors.email}
            onChangeText={handleChange('email')}
            onBlur={handleBlur('email')}
          />
        </Modal.Body>
        <Modal.Footer width="95%">
          <Button onPress={handleSubmit} flex={1}>
            {t('invite')}
          </Button>
        </Modal.Footer>
      </Modal.Content>
    </Modal>
  );
}

InviteToThePlatformModal.propTypes = {
  isOpen: PropTypes.bool,
  closeModal: PropTypes.func,
  usernameOrEmail: PropTypes.string,
};
