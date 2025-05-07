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

// Check if the model already exists to prevent "OverwriteModelError"
export const TransactionModel = 
  mongoose.models.Transaction || 
  mongoose.model<ITransaction>('Transaction', TransactionSchema);
