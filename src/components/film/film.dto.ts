import createValidator from '../../helpers/createValidator';

export class FilmValidator {
  createCommentValidator  = createValidator(Joi => {
    return {
      body: Joi.string()
      .max(500)
      .error(new Error('Body must not be grater than 500 characters'))
      .required()
      .trim()
      .error(new Error("Comment body is required")),
    }
  });
}
