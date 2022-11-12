import mongoose, { Document, Schema } from 'mongoose';

export interface IContact {
  contactName: string;
  phoneNumber: string;
}

export interface IContactModel extends IContact, Document {}

const ContactSchema: Schema = new Schema({
  contactName: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
});

export default mongoose.model<IContactModel>('Contact', ContactSchema);
