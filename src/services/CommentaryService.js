import BaseService from './BaseService';

const CommentaryService = {
  addCommentary: (commentary, user) => {
    return BaseService.post('/comment', commentary, {
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
    });
  },
};

export default CommentaryService;
