import mongoose, { Schema, Document } from 'mongoose';

export interface ITransaction extends Document {
  id: string;
  amount: number;
  description: string;
  category: string;
  date: string;
  transactionType: string; // 'income' or 'expense'
  createdAt: Date;
}

const TransactionSchema: Schema<ITransaction> = new Schema({
  id: { type: String, required: true, unique: true },
  amount: { type: Number, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  date: { type: String, required: true },
  transactionType: { type: String, required: true, enum: ['income', 'expense'] },
  createdAt: { type: Date, default: Date.now }
});

// Check if the model already exists to prevent "OverwriteModelError"
export const TransactionModel = 
  mongoose.models.Transaction || 
  mongoose.model<ITransaction>('Transaction', TransactionSchema);
