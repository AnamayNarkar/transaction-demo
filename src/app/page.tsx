"use client";

import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, DollarSign, BarChart4, TrendingDown, TrendingUp } from "lucide-react";
import PastTransactions from "@/myComponents/pastTranscations";
import CategoriesOfPastTransactionsPieChart from "@/myComponents/categoriesOfPastTransactionsPieChart";
import MonthlyExpensesBarChart from "@/myComponents/monthlyExpensesBarChart";
import CategoryBudgetForm from "@/myComponents/categoryBudgetForm";
import BudgetVsActualChart from "@/myComponents/budgetVsActualChart";
import { TransactionModal } from "@/components/ui/transaction-modal";
import TransactionForm from "@/forms/transactions/TransactionForm";

// Define transaction interface
interface Transaction {
  id: string;
  amount: number;
  description: string;
  category: string;
  date: string;
  transactionType: "income" | "expense";
}

interface TransactionSummary {
  totalTransactions: number;
  totalSpent: number;
  totalIncome: number;
  netBalance: number;
}

export default function HomePage() {
  const [summary, setSummary] = useState<TransactionSummary>({
    totalTransactions: 0,
    totalSpent: 0,
    totalIncome: 0,
    netBalance: 0,
  });
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const fetchSummary = useCallback(async () => {
    try {
      console.log("🔄 Fetching transaction summary data...");
      const response = await fetch("/api/transactions", {
        // Add cache busting to prevent stale data
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      const data = await response.json();
      
      if (data.transactions) {
        const transactions: Transaction[] = data.transactions;
        
        // Calculate totals using absolute values
        const totalSpent = transactions
          .filter(t => t.amount < 0)
          .reduce((sum, t) => sum + Math.abs(t.amount), 0);
          
        const totalIncome = transactions
          .filter(t => t.amount > 0)
          .reduce((sum, t) => sum + t.amount, 0);
          
        setSummary({
          totalTransactions: transactions.length,
          totalSpent,
          totalIncome,
          netBalance: totalIncome - totalSpent,
        });
        
        console.log("💰 Dashboard summary updated:", {
          transactions: transactions.length,
          expenses: totalSpent,
          income: totalIncome
        });
      }
    } catch (error) {
      console.error("Error fetching summary:", error);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  // Refresh when refreshTrigger changes
  useEffect(() => {
    console.log(`🔄 Dashboard refresh triggered (${refreshTrigger})`);
    fetchSummary();
  }, [refreshTrigger, fetchSummary]);

  // Listen for the transaction events (deletion and update)
  useEffect(() => {
    const handleTransactionEvent = () => {
      console.log("🔄 Transaction update/deletion detected via event, triggering global refresh");
      setRefreshTrigger(prev => prev + 1);
    };
    
    window.addEventListener('transaction-deleted', handleTransactionEvent);
    window.addEventListener('transaction-updated', handleTransactionEvent);
    
    return () => {
      window.removeEventListener('transaction-deleted', handleTransactionEvent);
      window.removeEventListener('transaction-updated', handleTransactionEvent);
    };
  }, []);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  // Refresh all components when a transaction is added, edited, or deleted
  const handleTransactionUpdate = useCallback(() => {
    // Increment the refresh trigger to force all components to update
    console.log("🔄 Transaction change detected, triggering global refresh");
    setRefreshTrigger(prev => prev + 1);
  }, []);

  return (
    <main className="min-h-screen bg-slate-800 text-white">
      <div className="container mx-auto py-8 px-4">
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-bold mb-4">Transaction Management System</h1>
          <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
            Track your finances, monitor spending patterns, and make informed financial decisions with our easy-to-use dashboard.
          </p>
          <Button 
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => setIsAddModalOpen(true)}
          >
            <PlusCircle className="mr-2 h-5 w-5" />
            Add New Transaction
          </Button>
        </header>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <Card className="p-6 bg-gradient-to-br from-blue-900 to-blue-800 border-blue-700">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-blue-300 mb-1">Total Balance</p>
                <h3 className="text-2xl font-bold">{formatCurrency(summary.netBalance)}</h3>
              </div>
              <div className="bg-blue-700 p-3 rounded-lg">
                <DollarSign className="h-6 w-6 text-blue-200" />
              </div>
            </div>
          </Card>
          
          <Card className="p-6 bg-gradient-to-br from-red-900 to-red-800 border-red-700">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-red-300 mb-1">Total Expenses</p>
                <h3 className="text-2xl font-bold">{formatCurrency(summary.totalSpent)}</h3>
              </div>
              <div className="bg-red-700 p-3 rounded-lg">
                <TrendingDown className="h-6 w-6 text-red-200" />
              </div>
            </div>
          </Card>
          
          <Card className="p-6 bg-gradient-to-br from-green-900 to-green-800 border-green-700">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-green-300 mb-1">Total Income</p>
                <h3 className="text-2xl font-bold">{formatCurrency(summary.totalIncome)}</h3>
              </div>
              <div className="bg-green-700 p-3 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-200" />
              </div>
            </div>
          </Card>
          
          <Card className="p-6 bg-gradient-to-br from-purple-900 to-purple-800 border-purple-700">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-purple-300 mb-1">Transactions</p>
                <h3 className="text-2xl font-bold">{summary.totalTransactions}</h3>
              </div>
              <div className="bg-purple-700 p-3 rounded-lg">
                <BarChart4 className="h-6 w-6 text-purple-200" />
              </div>
            </div>
          </Card>
        </div>

        {/* Budget vs Actual and Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
          {/* Budget vs Actual Chart */}
          <BudgetVsActualChart onTransactionUpdate={refreshTrigger} />
          
          {/* Monthly Category Budgets */}
          <CategoryBudgetForm onBudgetChange={handleTransactionUpdate} />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Spending by Category */}
          <div>
            <h2 className="text-xl font-bold mb-4">Expense Categories</h2>
            <CategoriesOfPastTransactionsPieChart onTransactionUpdate={refreshTrigger} />
          </div>
          
          {/* Monthly Expenses Bar Chart */}
          <div>
            <h2 className="text-xl font-bold mb-4">Monthly Expenses</h2>
            <MonthlyExpensesBarChart onTransactionUpdate={refreshTrigger} />
          </div>
        </div>
        
        {/* Recent Transactions */}
        <div>
          <PastTransactions onTransactionUpdate={refreshTrigger} />
        </div>

        {/* Add Transaction Modal */}
        <TransactionModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
        >
          <TransactionForm
            mode="create"
            onSuccess={() => {
              setIsAddModalOpen(false);
              handleTransactionUpdate(); 
            }}
            onCancel={() => setIsAddModalOpen(false)}
          />
        </TransactionModal>
      </div>
    </main>
  );
}
