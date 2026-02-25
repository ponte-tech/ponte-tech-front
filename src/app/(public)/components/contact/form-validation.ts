import Joi from "joi";
export type ContactForm = {
  nomeCompleto: string;
  email: string;
  telefone: string;
  empresa: string;
  mensagem: string;
  captcha: string;
}
export const formSchema:Joi.ObjectSchema<ContactForm> = Joi.object({
  nomeCompleto: Joi.string()
    .max(100)
    .required()
    .messages({
      "string.empty": "Nome é obrigatório",
      "string.max": "Nome deve ter no máximo {#limit} caracteres",
    }),

  email: Joi.string()
    .email({ tlds: false })
    .required()
    .messages({
      "string.email": "E-mail inválido",
      "string.empty": "E-mail é obrigatório",
    }),

  telefone: Joi.string()
    .required()
    .messages({
      "string.empty": "Telefone é obrigatório",
    }),

  empresa: Joi.string()
    .max(100)
    .required()
    .messages({
      "string.empty": "Empresa é obrigatória",
      "string.max": "Empresa deve ter no máximo {#limit} caracteres",
    }),

  mensagem: Joi.string().allow("").messages({
    "string.base": "Mensagem deve ser um texto",
  }),
  captcha: Joi.string().required().messages({
    "string.empty": "Captcha é obrigatório",
    "any.required": "Captcha é obrigatório",
    "string.base": "Captcha é obrigatório",
  }),
});
