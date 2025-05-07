import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import { TransactionModel } from '@/models/transaction.model';

export async function GET() {
  try {
    await connectDB();
    
    const transactions = await TransactionModel.find({})
      .sort({ date: -1, createdAt: -1 })
      .limit(50);
    
    return NextResponse.json({ success: true, transactions }, { status: 200 });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Unknown error occurred while fetching transactions';
      
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    const data = await req.json();
    
    // Generate a unique ID if not provided
    if (!data.id) {
      data.id = new Date().getTime().toString();
    }

    // Set transaction type based on amount
    data.transactionType = data.amount < 0 ? 'expense' : 'income';
    
    const newTransaction = await TransactionModel.create(data);
    
    return NextResponse.json(
      { success: true, transaction: newTransaction },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating transaction:', error);
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Unknown error occurred while creating transaction';
      
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}