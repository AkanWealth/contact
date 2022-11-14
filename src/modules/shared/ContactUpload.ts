// import fs from 'fs';
// import csv from 'fast-csv';
import * as fs from 'fs';
import * as path from 'path';
import * as csv from 'fast-csv';
import Contact from '../../database/models/contact.model';

export const uploadCsv = (uriFile: any) => {
  console.log("hh")
  let stream = fs.createReadStream(uriFile);
  let csvDataColl = [];
  let fileStream = csv
    .parse()
    .on('data', function (data) {
      csvDataColl.push(data);
    })
    .on('end', function () {
      csvDataColl.shift();

      // Contact.insertMany(csvDataColl);
      console.log(csvDataColl);

      // fs.unlinkSync(uriFile);1
    });

  stream.pipe(fileStream);
};
