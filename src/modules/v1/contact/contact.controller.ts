import mongoose from 'mongoose';
import { success } from '../../common/utils';
import Contact from '../../../database/models/contact.model';
import { NextFunction, Request, Response } from 'express';
// import { Books, ExcludedAttribs } from '../../../types';x

// type Props = Omit<Books, ExcludedAttribs>;

 export const createContact = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { contactName, phoneNumber } = req.body;

    const contact = new Contact({
      _id: new mongoose.Types.ObjectId(),
      contactName,
      phoneNumber,
    });
    await contact.save();
    return res.status(201).json(success('Book created successfully', contact));
  } catch (error) {
    return next(error);
  }
};

export const getContact = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const contactId = req.params.bookId;
    const book = await Contact.findById(contactId);
    return res
      .status(200)
      .json(success('Contact retrieved successfully', { book }));
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

export const updateContact = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const contactId = req.params.bookId;
    const updateContact = await Contact.findById(contactId);
    if (updateContact) {
      updateContact.set(req.body);

      return updateContact.save();
      // .then((book) => res.status(201).json({ book }))
      // .catch((error) => res.status(500).json({ error }));
    } else {
      return res.status(404).json({ message: 'not found' });
    }
  } catch (error) {
    next();
  }
  // const contactId = req.params.bookId;

  // return await Contact.findById(contactId)
  //   .then((book) => {
  //     if (book) {
  //       book.set(req.body);

  //       return book
  //         .save()
  //         .then((book) => res.status(201).json({ book }))
  //         .catch((error) => res.status(500).json({ error }));
  //     } else {
  //       return res.status(404).json({ message: 'not found' });
  //     }
  //   })
  //   .catch((error) => res.status(500).json({ error }));
};

export const deleteContact = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const contactId = req.params.bookId;
    const removeContact = await Contact.findByIdAndDelete(contactId);
    return res.status(201).json(success('Contact deleted', { removeContact }));
  } catch (error) {
    next();
  }
  // const contactId = req.params.bookId;

  // return await Contact.findByIdAndDelete(contactId)
  //   .then((book) =>
  //     book
  //       ? res.status(201).json({ book, message: 'Deleted' })
  //       : res.status(404).json({ message: 'not found' })
  //   )
  //   .catch((error) => res.status(500).json({ error }));
};

// export default { createBook, readBook, readAll, updateBook, deleteBook };
