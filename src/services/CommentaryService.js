import BaseService from './BaseService';

const CommentaryService = {
  addCommentary: (commentary, user) => {
    return BaseService.post('/comment', commentary, {
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
    });
  },
  addGlobalCommentary: (commentary, user) => {
    return BaseService.post('/globalComment', commentary, {
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
    });
  },
  removeCommentary: (commentaryId, user) => {
    return BaseService.delete(`/comment/${commentaryId}`, {
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
    });
  },
  removeGlobalCommentary: (commentaryId, user) => {
    return BaseService.delete(`/globalComment/${commentaryId}`, {
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
    });
  },
};

export default CommentaryService;
