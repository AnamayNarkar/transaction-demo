import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import { BudgetModel } from '@/models/budget.model';
import { TransactionModel } from '@/models/transaction.model';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    // Get query parameters
    const url = new URL(req.url);
    const month = parseInt(url.searchParams.get('month') || new Date().getMonth() + 1 + '');
    const year = parseInt(url.searchParams.get('year') || new Date().getFullYear() + '');
    
    // Validate month and year
    if (isNaN(month) || month < 1 || month > 12 || isNaN(year)) {
      return NextResponse.json(
        { success: false, error: 'Invalid month or year parameter' },
        { status: 400 }
      );
    }
    
    // Step 1: Fetch all budgets for the specified month and year
    const budgets = await BudgetModel.find({ month, year });
    
    // Step 2: Fetch all transactions for the specified month and year
    // Convert month and year to date range
    const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0];
    const endDate = new Date(year, month, 0).toISOString().split('T')[0]; // Last day of month
    
    const transactions = await TransactionModel.find({
      date: { 
        $gte: startDate,
        $lte: endDate 
      }
    });
    
    // Step 3: Calculate actual spending by category
    const actualSpending: Record<string, number> = {};
    
    transactions.forEach(transaction => {
      // Only consider expenses (negative amounts)
      if (transaction.amount < 0) {
        const { category, amount } = transaction;
        
        if (!actualSpending[category]) {
          actualSpending[category] = 0;
        }
        
        // Add the absolute value of the amount (since expenses are negative)
        actualSpending[category] += Math.abs(Number(amount));
      }
    });
    
    // Step 4: Create a comparison object with budget vs. actual for each category
    const budgetComparison = budgets.map(budget => {
      const actual = actualSpending[budget.category] || 0;
      const budgetAmount = budget.amount;
      const remaining = budgetAmount - actual;
      const percentUsed = actual > 0 ? (actual / budgetAmount) * 100 : 0;
      
      return {
        category: budget.category,
        budgetAmount,
        actual,
        remaining,
        percentUsed: Math.min(percentUsed, 100), // Cap at 100% for display purposes
        isOverBudget: actual > budgetAmount
      };
    });
    
    // Also include categories with spending but no budget
    Object.keys(actualSpending).forEach(category => {
      const hasBudget = budgetComparison.some(item => item.category === category);
      
      if (!hasBudget) {
        budgetComparison.push({
          category,
          budgetAmount: 0,
          actual: actualSpending[category],
          remaining: -actualSpending[category],
          percentUsed: 100, // If no budget, show as 100% used
          isOverBudget: true
        });
      }
    });
    
    return NextResponse.json({ 
      success: true, 
      month,
      year,
      comparison: budgetComparison
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching budget comparison:', error);
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Unknown error occurred while generating budget comparison';
      
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}