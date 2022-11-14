import mongoose, { Document, Schema } from 'mongoose';

export interface IContact {
  contactName: string;
  phoneNumber: string;
}

export interface IContactModel extends IContact, Document {}

const ContactSchema: Schema = new Schema({
  contactName: {
    type: String,
    required: "Please provide contact name",
  },
  phoneNumber: {
    type: String,
    required: "Please provide a phone number"
  },
},{
  timestamps: true
});

export default mongoose.model<IContactModel>('Contact', ContactSchema);
