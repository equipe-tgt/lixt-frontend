import React, { useContext, useState } from 'react';
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

  const [isLoading, setIsLoading] = useState(false);

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

  const sendInvitation = async () => {
    setIsLoading(true);
    try {
      await ListMembersService.inviteToThePlatform(values.email, user);
      props.closeModal();
      toast.show({
        title: t('sentEmail'),
        status: 'success',
      });
    } catch (error) {
      // Caso o usuáraio tente convidar pra participar da plataforma um email que já está na
      // plataforma o encaminha de volta pra tela de SenvInivtationScreen pra ser convidado
      // normalmente para a lista
      if (error?.response?.status === 409) {
        props.closeModal();
        props.sendToRegisteredUser(values.email);
      } else {
        props.closeModal();
        toast.show({
          title: t('errorServerDefault'),
          status: 'warning',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={props.isOpen}
      onClose={props.closeModal}
      justifyContent="center"
      alignItems="center"
      testID="invite-to-platform-modal"
      accessibilityValue={{
        text: props.isOpen ? 'visible' : 'hidden',
      }}
    >
      <Modal.Content>
        <Modal.CloseButton />
        <Modal.Header>
          <Text fontSize="lg" fontWeight="bold">
            {t('inviteToThePlatform')}
          </Text>
        </Modal.Header>
        <Modal.Body mt={2}>
          <Text mb={3}>{t('userNotOnPlatform')}</Text>
          <LixtInput
            labelName="E-mail"
            value={values.email}
            error={errors.email}
            onChangeText={handleChange('email')}
            onBlur={handleBlur('email')}
            autoCapitalize="none"
            testID="invite-to-platform-email-input"
          />
        </Modal.Body>
        <Modal.Footer width="95%">
          <Button
            isLoading={isLoading}
            onPress={handleSubmit}
            flex={1}
            testID="button-confirm-send-invitation"
          >
            {t('sendInvitation')}
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
  sendToRegisteredUser: PropTypes.func,
};
