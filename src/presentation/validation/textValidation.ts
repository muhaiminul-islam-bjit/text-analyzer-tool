import Joi from 'joi';

export const createTextValidation = Joi.object({
  title: Joi.string()
    .required()
    .trim()
    .min(1)
    .max(200)
    .messages({
      'string.empty': 'Title is required',
      'string.min': 'Title must not be empty',
      'string.max': 'Title must not exceed 200 characters',
    }),
  content: Joi.string()
    .required()
    .trim()
    .min(1)
    .messages({
      'string.empty': 'Content is required',
      'string.min': 'Content must not be empty',
    }),
});

export const updateTextValidation = Joi.object({
  title: Joi.string()
    .optional()
    .trim()
    .min(1)
    .max(200)
    .messages({
      'string.min': 'Title must not be empty',
      'string.max': 'Title must not exceed 200 characters',
    }),
  content: Joi.string()
    .optional()
    .trim()
    .min(1)
    .messages({
      'string.min': 'Content must not be empty',
    }),
}).min(1).messages({
  'object.min': 'At least one field (title or content) must be provided',
});

export const textIdValidation = Joi.string()
  .required()
  .pattern(/^[0-9a-fA-F]{24}$/)
  .messages({
    'string.pattern.base': 'Invalid text ID format',
    'string.empty': 'Text ID is required',
  });
