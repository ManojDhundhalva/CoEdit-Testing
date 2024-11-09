import { emailRegex } from './regex';

export const isValidEmail = (email) => emailRegex.test(email);
