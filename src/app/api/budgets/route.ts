import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import { BudgetModel } from '@/models/budget.model';

// GET: Fetch all budgets for a specific month and year
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
    
    // Fetch budgets for the specified month and year
    const budgets = await BudgetModel.find({ month, year });
    
    return NextResponse.json({ success: true, budgets }, { status: 200 });
  } catch (error) {
    console.error('Error fetching budgets:', error);
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Unknown error occurred while fetching budgets';
      
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

// POST: Create or update a budget for a category
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    const data = await req.json();
    
    // Validate required fields
    if (!data.category || !data.amount || !data.month || !data.year) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields (category, amount, month, year)' },
        { status: 400 }
      );
    }
    
    // Validate month and amount
    if (data.month < 1 || data.month > 12 || data.amount < 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid month or amount' },
        { status: 400 }
      );
    }
    
    // Check if budget already exists for this category, month, and year
    const existingBudget = await BudgetModel.findOne({
      category: data.category,
      month: data.month,
      year: data.year
    });
    
    let budget;
    
    if (existingBudget) {
      // Update existing budget
      existingBudget.amount = data.amount;
      budget = await existingBudget.save();
    } else {
      // Create new budget with a unique ID
      const id = `${data.category}-${data.month}-${data.year}-${Date.now()}`;
      budget = await BudgetModel.create({
        ...data,
        id
      });
    }
    
    return NextResponse.json(
      { success: true, budget },
      { status: existingBudget ? 200 : 201 }
    );
  } catch (error) {
    console.error('Error creating/updating budget:', error);
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Unknown error occurred while creating/updating budget';
      
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}