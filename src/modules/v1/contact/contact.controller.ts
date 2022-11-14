import mongoose from 'mongoose';
import { success } from '../../common/utils';
import Contact from '../../../database/models/contact.model';
import { NextFunction, Request, Response } from 'express';
import Logging from '../../common/Logging';
import { Contacts, ContactsDetailsRow, ExcludedAttribs } from '../../../types';
import assert from 'assert';
// import { parse } from 'csv-parse';
// import { uploadCsv } from '../../shared/ContactUpload';
import fs from 'fs';
import * as path from 'path';
import * as csv from 'fast-csv';
import { EOL } from 'os';
import { parse } from '@fast-csv/parse';

interface MulterRequest extends Request {
  file: any;
}
// type Props = Omit<Books, ExcludedAttribs>;

export const createContact = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { contactName, phoneNumber } = req.body;
    console.log(contactName, phoneNumber);

    new Contact({
      _id: new mongoose.Types.ObjectId(),
      contactName,
      phoneNumber,
    });
    const createdContact = await Contact.insertMany(req.body);
    return res
      .status(201)
      .json(success('Contact created successfully', createdContact));
  } catch (error) {
    Logging.error(error);
    console.log(error);
    return next(error);
  }
};

export const BulkUpload = async (
  req: MulterRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    fs.createReadStream(path.resolve(__dirname, 'assets', req.file.filename))
      .pipe(csv.parse({ headers: true }))
      .on('error', (error) => console.error(error))
      .on('data', async (row) => {
        const contacts = await Contact.findOne({
          phoneNumber: row.phoneNumber,
        });
        if (contacts) {
          console.log('contacts', contacts);
          await Contact.updateOne(
            { phoneNumber: row.phoneNumber },
            { ...row },
            { new: true }
          );
        } else {
          const val = await new Contact(row).save();
          console.log('val', val);
        }
      });
    res.status(201).json({ message: 'Contact uploaded' });
  } catch (err) {
    console.log(err);
    next();
  }
};

export const getContact = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { contactId } = req.params;
    const contact = await Contact.findById(contactId);
    return res
      .status(200)
      .json(success('Contact retrieved successfully', { contact }));
  } catch (error) {
    return next(error);
  }
};

export const allContact = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const allBook = await Contact.find();
    return res
      .status(200)
      .json(success('Books retrieved successfully', allBook));
  } catch (error) {
    return next(error);
  }
};

export const bulkDelete = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { phoneNumbers } = req.body;
  try {
    const phones = phoneNumbers as string[];
    const deletedContacts = phones.map(async (item) => {
      await Contact.deleteOne({ phoneNumber: item });
    });
    return res.status(200).json(deletedContacts);
  } catch (error) {
    next(error);
  }
};

export const updateContact = async (
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  const { contactId } = req.params;
  return await Contact.findById(contactId)
    .then((contact) => {
      if (contact) {
        contact.set(req.body);

        return contact
          .save()
          .then((contact) =>
            res.status(201).json(success('Contact updated', { contact }))
          )
          .catch((error) => res.status(500).json({ error }));
      } else {
        return res.status(404).json({ message: 'not found' });
      }
    })
    .catch((error) => res.status(500).json({ error }));
};

export const deleteContact = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { contactId } = req.params;
    const removeContact = await Contact.findByIdAndDelete(contactId);
    return res.status(200).json(success('Contact deleted', { removeContact }));
  } catch (error) {
    next();
  }
};
