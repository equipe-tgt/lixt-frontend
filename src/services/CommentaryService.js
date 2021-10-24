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
  getGlobalCommentaries: (user) => {
    return BaseService.get('/globalComment/all', {
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
    });
  },
};

export default CommentaryService;
