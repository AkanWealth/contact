import {parse} from 'csv-parse';
import { NextFunction, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import File from '../../../database/models/contactUpload.model';
import { success } from '../../common/utils';

/**********EXPORTING FUNCTION FOR View ROUTE******************/
export const fileUpload = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log('view');
  console.log(req.params.file);
  const filePATH = await File.findOne({ file: req.params.file });
  console.log(filePATH);
  console.log(filePATH.filePath);
  const results = [];
  const header = [];
  fs.createReadStream(filePATH.filePath)
    .pipe(parse())
    .on('headers', (headers) => {
      headers.map((head) => {
        header.push(head);
      });
      console.log(header);
    })
    .on('data', (data) => results.push(data))
    .on('end', () => {
      console.log(header);
      console.log(results.length);
      console.log(results);
      return res
        .send(201)
        .json(
          success('Contact upload successful', {
            title: filePATH.originalName,
            head: header,
            data: results,
            length: results.length,
          })
        );
    });
  } catch (error) {
    next();
  }
};
