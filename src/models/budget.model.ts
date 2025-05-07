import mongoose, { Schema, Document } from 'mongoose';

export interface IBudget extends Document {
  id: string;
  category: string;
  amount: number;
  month: number; // 1-12
  year: number;
}

const BudgetSchema: Schema<IBudget> = new Schema({
  id: { type: String, required: true, unique: true },
  category: { type: String, required: true },
  amount: { type: Number, required: true },
  month: { type: Number, required: true, min: 1, max: 12 },
  year: { type: Number, required: true }
});

// Create a compound index for unique category budget per month/year
BudgetSchema.index({ category: 1, month: 1, year: 1 }, { unique: true });

// Check if the model already exists to prevent "OverwriteModelError"
export const BudgetModel = 
  mongoose.models.Budget || 
  mongoose.model<IBudget>('Budget', BudgetSchema);