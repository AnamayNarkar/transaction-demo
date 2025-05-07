"use client";

import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Edit2 } from "lucide-react";
import categories from "@/forms/transactions/schema/categories.json";
import TransactionForm from "@/forms/transactions/TransactionForm";
import { TransactionModal } from "@/components/ui/transaction-modal";

interface Transaction {
  id: string;
  amount: number;
  description: string;
  category: string;
  date: string;
}

interface PastTransactionsProps {
  onTransactionUpdate?: number | (() => void);
}

export default function PastTransactions({ onTransactionUpdate }: PastTransactionsProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [refreshCounter, setRefreshCounter] = useState(0);

  const fetchTransactions = useCallback(async () => {
    try {
      console.log("🔄 Fetching recent transactions...");
      setLoading(true);
      const response = await fetch("/api/transactions", {
        // Add cache busting to prevent stale data
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      if (!response.ok) {
        throw new Error("Failed to fetch transactions");
      }

      const data = await response.json();
      if (data.success && Array.isArray(data.transactions)) {
        console.log(`📋 Retrieved ${data.transactions.length} transactions`);
        setTransactions(data.transactions);
      }
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to load transactions"
      );
      console.error("Error fetching transactions:", error);
    } finally {
      setLoading(false);
    }
  }, [refreshCounter]); // Include refreshCounter in dependencies

  // Initial fetch
  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Handle transaction updates - triggers when either a function is called or the number changes
  useEffect(() => {
    console.log("🔄 Recent Transactions: Refresh check triggered", typeof onTransactionUpdate);
    
    if (typeof onTransactionUpdate === 'number') {
      console.log(`🔄 Recent Transactions: Refresh triggered by number change (${onTransactionUpdate})`);
      setRefreshCounter(prev => prev + 1);
    } else if (typeof onTransactionUpdate === 'function') {
      console.log("🔄 Recent Transactions: Refresh triggered by function");
      setRefreshCounter(prev => prev + 1);
    }
  }, [onTransactionUpdate]);

  const handleRefresh = useCallback(() => {
    console.log("🔄 Recent Transactions: Manual refresh triggered");
    setRefreshCounter(prev => prev + 1);
    
    // Trigger refresh in parent components if it's a function
    if (typeof onTransactionUpdate === 'function') {
      onTransactionUpdate();
    }
  }, [onTransactionUpdate]);

  const handleDelete = async (id: string) => {
    try {
      console.log(`🗑️ Deleting transaction: ${id}`);
      setIsDeleting(id);
      
      const response = await fetch(`/api/transactions/${id}`, {
        method: "DELETE",
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      if (!response.ok) {
        throw new Error("Failed to delete transaction");
      }

      const data = await response.json();
      console.log("🔄 Delete operation completed, refreshing data", data);
      
      // Update the local transactions state immediately for a faster UI response
      setTransactions(prev => prev.filter(t => t.id !== id));
      
      // Force a global refresh instead of just local refresh
      if (typeof onTransactionUpdate === 'number') {
        // If onTransactionUpdate is a number (refreshTrigger from parent), 
        // we need to manually trigger the parent's refresh function
        window.dispatchEvent(new CustomEvent('transaction-deleted'));
      } else if (typeof onTransactionUpdate === 'function') {
        // If it's a function, call it directly
        onTransactionUpdate();
      }
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to delete transaction"
      );
      console.error("Error deleting transaction:", error);
    } finally {
      setIsDeleting(null);
    }
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
  };

  const handleEditSuccess = () => {
    setEditingTransaction(null);
    console.log("✏️ Edit operation completed, refreshing data");
    
    // Force a global refresh for edits similar to how we handle deletions
    if (typeof onTransactionUpdate === 'number') {
      // If onTransactionUpdate is a number (refreshTrigger from parent), 
      // we need to manually trigger the parent's refresh function
      window.dispatchEvent(new CustomEvent('transaction-updated'));
    } else if (typeof onTransactionUpdate === 'function') {
      // If it's a function, call it directly
      onTransactionUpdate();
    }
  };

  const getCategoryLabel = (categoryId: string) => {
    const category = categories.categories.find((c) => c.id === categoryId);
    return category ? category.label : categoryId;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  if (loading) {
    return (
      <Card className="p-6 bg-slate-700 text-white">
        <h2 className="text-xl font-bold mb-4">Recent Transactions</h2>
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6 bg-slate-700 text-white">
        <h2 className="text-xl font-bold mb-4">Recent Transactions</h2>
        <div className="bg-red-800 text-white p-4 rounded-md">{error}</div>
      </Card>
    );
  }

  return (
    <>
      <Card className="p-6 bg-slate-700 text-white">
        <h2 className="text-xl font-bold mb-4">Recent Transactions</h2>

        {transactions.length === 0 ? (
          <div className="text-center p-6 text-gray-400">
            No transactions found. Add some to get started!
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-3 bg-slate-800 rounded-lg border border-slate-600 hover:bg-slate-750 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="text-sm font-medium truncate">
                      {transaction.description}
                    </h3>
                    <span className={`text-sm font-bold ml-2 whitespace-nowrap ${transaction.amount < 0 ? 'text-red-400' : 'text-green-400'}`}>
                      {formatAmount(transaction.amount)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>{getCategoryLabel(transaction.category)}</span>
                    <span>{formatDate(transaction.date)}</span>
                  </div>
                </div>
                <div className="flex gap-2 ml-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-gray-400 hover:text-blue-500"
                    onClick={() => handleEdit(transaction)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-gray-400 hover:text-red-500"
                    onClick={() => handleDelete(transaction.id)}
                    disabled={isDeleting === transaction.id}
                  >
                    {isDeleting === transaction.id ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Edit Transaction Modal */}
      <TransactionModal
        isOpen={!!editingTransaction}
        onClose={() => setEditingTransaction(null)}
      >
        {editingTransaction && (
          <TransactionForm
            mode="edit"
            initialData={{
              id: editingTransaction.id,
              amount: Math.abs(editingTransaction.amount).toString(),
              description: editingTransaction.description,
              category: editingTransaction.category,
              date: editingTransaction.date,
            }}
            onSuccess={handleEditSuccess}
            onCancel={() => setEditingTransaction(null)}
          />
        )}
      </TransactionModal>
    </>
  );
}
