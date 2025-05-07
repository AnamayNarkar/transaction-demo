import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import { TransactionModel } from '@/models/transaction.model';

type Props = {
  params: {
    id: string;
  };
};

export async function GET(
  request: NextRequest,
  context: Props
) {
  // Clone the params to avoid reference issues
  const params = { ...context.params };
  
  try {
    await connectDB();
    
    const transaction = await TransactionModel.findOne({ id: params.id });
    
    if (!transaction) {
      return NextResponse.json(
        { success: false, error: 'Transaction not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, transaction }, { status: 200 });
  } catch (error) {
    console.error('Error fetching transaction:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch transaction' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: Props
) {
  // Clone the params to avoid reference issues
  const params = { ...context.params };
  
  try {
    await connectDB();
    const data = await request.json();
    
    // Set amount based on transaction type and ensure it's a number
    const amount = data.transactionType === 'expense' 
      ? -Math.abs(Number(data.amount))
      : Math.abs(Number(data.amount));

    const update = {
      ...data,
      amount,
      transactionType: amount < 0 ? 'expense' : 'income'
    };
    
    const transaction = await TransactionModel.findOneAndUpdate(
      { id: params.id },
      update,
      { new: true }
    );
    
    if (!transaction) {
      return NextResponse.json(
        { success: false, error: 'Transaction not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, transaction }, { status: 200 });
  } catch (error) {
    console.error('Error updating transaction:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update transaction' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: Props
) {
  // Clone the params to avoid reference issues
  const params = { ...context.params };
  
  try {
    await connectDB();
    
    const transaction = await TransactionModel.findOneAndDelete({ id: params.id });
    
    if (!transaction) {
      return NextResponse.json(
        { success: false, error: 'Transaction not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { success: true, message: 'Transaction deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting transaction:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete transaction' },
      { status: 500 }
    );
  }
}