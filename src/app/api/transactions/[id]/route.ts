import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import { TransactionModel } from '@/models/transaction.model';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
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

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
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