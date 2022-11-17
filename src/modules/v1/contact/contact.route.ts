import express from 'express';
import { contactCreationRules } from './contact.validation';
import { contactUpdateRules } from '../contact/contact.validation';
import {
  createContact,
  getContact,
  allContact,
  updateContact,
  deleteContact,
  BulkUpload,
} from '../contact/contact.controller';
import multer from 'multer';
// const upload = multer({ dest: 'src/modules/v1/contact/assets/' });
const upload = multer({ dest: 'assets' });

const app = express.Router();

app.get('/', allContact);
app.get('/:contactId', getContact);
app.delete('/:contactId', deleteContact);
app.post('/', createContact);
app.post('/upload', upload.single('file'), BulkUpload);
app.put('/:contactId', contactUpdateRules(), updateContact);

export = app;
