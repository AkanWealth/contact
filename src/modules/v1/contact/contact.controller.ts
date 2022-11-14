import mongoose from 'mongoose';
import { success } from '../../common/utils';
import Contact from '../../../database/models/contact.model';
import { NextFunction, Request, Response } from 'express';
import Logging from '../../common/Logging';
import { Contacts, ContactsDetailsRow, ExcludedAttribs } from '../../../types';
import assert from 'assert';
import { parse } from 'csv-parse';
// import { uploadCsv } from '../../shared/ContactUpload';
import fs from 'fs';
import * as path from 'path';
import * as csv from 'fast-csv';

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
  res: Response
  // next: NextFunction
) => {
  try {
    fs.createReadStream(path.resolve(__dirname, 'assets', req.file.filename))
      .pipe(csv.parse({ headers: true }))
      // pipe the parsed input into a csv formatter
      .pipe(csv.format<Contacts, ContactsDetailsRow>({ headers: true }))
      // Using the transform function from the formatting stream
      .transform((row, next): void => {
        Contact.findById(row.phoneNumber, (err: any, contact: []) => {
          return next(null, {
            contactName: row.contactName,
            phoneNumber: row.phoneNumber,
          });
        });
        // console.log('data', row);
        // Contact.create(row);
      })
      .pipe(process.stdout)
      .on('end', () => process.exit());
    res.status(201).json('Contact uploaded');
    // fs.unlinkSync(path.resolve(__dirname, 'assets', req.file.filename));
  } catch (err) {
    console.log(err);
    // next();
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

export const bulkUpdate = async (
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  try {
    fs.createReadStream(path.resolve(__dirname, 'assets', req.file.filename))
      .pipe(csv.parse({ headers: true }))
      // pipe the parsed input into a csv formatter
      .pipe(csv.format<Contacts, ContactsDetailsRow>({ headers: true }))
      // Using the transform function from the formatting stream
      .transform((row, next): void => {
        const arr = [];
        const { phoneNumber } = req.body;
        Contact.findOne({ phoneNumber }, (err: any, contact: Contacts) => {
          if (contact) {
            arr.push(contact);
            console.log("contact", contact)
          }
          return next(null, {
            contactName: row.contactName,
            phoneNumber: row.phoneNumber,
          });
        });
        console.log('data', row);
        Contact.updateOne(row);
      })
      .pipe(process.stdout)
      .on('end', () => process.exit());
    res.status(201).json('Contact uploaded');
  } catch (err) {
    console.log(err);
    // next();
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
