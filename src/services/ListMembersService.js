import BaseService from './BaseService';
import { getI18n } from 'react-i18next';

export const INVITATION_TYPES = {
  SENT: 'sent',
  RECEIVED: 'received',
};

export const INVITATION_ACTIONS = {
  ACCEPT: 'accept',
  REJECT: 'reject',
};

const ListMembersService = {
  sendInvite: (username, idList, user) => {
    return BaseService.post(`/membersList/send-invite/${idList}`, username, {
      headers: {
        Authorization: `Bearer ${user.token}`,
        'Content-Type': 'text/plain',
      },
    });
  },

  getInvitations: (invitationType, user) => {
    return BaseService.get(`/membersList/${invitationType}`, {
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
    });
  },

  handleInvitation: (idInvitation, invitationAction, user) => {
    return BaseService.get(
      `/membersList/${invitationAction}-invite/${idInvitation}`,
      {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      }
    );
  },
  deleteInvitation: (idInvitation, user) => {
    return BaseService.delete(`/membersList/${idInvitation}`, {
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
    });
  },
  inviteToThePlatform: (email, user) => {
    return BaseService.post('/membersList/invite-join-platform', email, {
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
      params: {
        language: getI18n()?.language === 'pt_BR' ? 'pt-br' : 'en-us',
      },
    });
  },
};

export default ListMembersService;
