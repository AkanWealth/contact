import express from 'express';
import { validate } from '../../common/utils';
import { contactCreationRules } from './contact.validation';
import { contactUpdateRules } from '../contact/contact.validation';
import {
  createContact,
  getContact,
  allContact,
  updateContact,
  deleteContact,
} from '../contact/contact.controller';

const app = express.Router();

app.get('/', allContact);
app.get('/:contactId', getContact);
app.delete('/:contactId', deleteContact);
app.post('/', contactCreationRules(), validate, createContact);
app.patch(
  '/:contactId',
  contactUpdateRules(),
  validate,
  updateContact
);

export = app;
