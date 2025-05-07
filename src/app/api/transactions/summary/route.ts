import { NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import { TransactionModel } from '@/models/transaction.model';

export async function GET() {
  try {
    await connectDB();
    
    // Get all transactions
    const transactions = await TransactionModel.find({ transactionType: 'expense' });
    
    // Count total transactions
    const totalTransactions = transactions.length;
    
    // Calculate spending by category
    const categorySummary = transactions.reduce((acc: Record<string, number>, transaction) => {
      const { category, amount } = transaction;
      
      // Initialize category if it doesn't exist
      if (!acc[category]) {
        acc[category] = 0;
      }
      
      // Add the absolute amount since we know these are all expenses
      acc[category] += Math.abs(Number(amount));
      
      return acc;
    }, {});
    
    // Convert to array format for the chart
    const summary = Object.entries(categorySummary).map(([name, value]) => ({
      name,
      value,
    }));
    
    return NextResponse.json({ 
      success: true, 
      summary,
      totalTransactions
    }, { status: 200 });
  } catch (error) {
    console.error('Error generating transaction summary:', error);
    
    // Improved error message with more details
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Unknown error occurred while generating transaction summary';
      
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}