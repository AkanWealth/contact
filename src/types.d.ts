import { Request } from 'express';

type ExcludedAttribs = "createdAt" | "updatedAt" | "deletedAt";

interface Contacts {
  _id?: string;
  contactName: string;
  phoneNumber: string;
}

interface ContactsDetailsRow {
  _id?: string;
  contactName: string;
  phoneNumber: string;
}

type CreateErr = (message: string, code?: number, validations?: object) => Error;

type AppError = Error & {
  code: number;
  name?: string;
  message: string;
  validations?: object | null;
};

type Fix = any;
