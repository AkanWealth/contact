import { body } from 'express-validator';

export const contactCreationRules = () =>{
	return [
		body("contactName").isString(),
		body("phoneNumber").isString().notEmpty(),
	];
}

export const contactUpdateRules = () => {
	return [
		body("contactName").isString(),
		body("phoneNumber").isString().notEmpty(),
	];
}