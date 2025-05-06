import mongoose, { Schema, Document } from 'mongoose';

export interface ITransaction extends Document {
  id: string;
  amount: number;
  description: string;
  category: string;
  date: string;
}

const TransactionSchema: Schema<ITransaction> = new Schema({
  id: { type: String, required: true, unique: true },
  amount: { type: Number, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  date: { type: String, required: true },
});

// You can optionally customize the collection name here
export const TransactionModel = mongoose.model<ITransaction>('Transaction', TransactionSchema);
