"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, PlusCircle, Trash2, Search } from "lucide-react";
import PastTransactions from '@/myComponents/pastTranscations';
import CategoriesOfPastTransactionsPieChart from '@/myComponents/categoriesOfPastTransactionsPieChart';

interface Transaction {
  _id: string;
  id: string;
  amount: number;
  description: string;
  category: string;
  date: string;
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/transactions");
      const data = await response.json();
      setTransactions(data.transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      const response = await fetch(`/api/transactions/${id}`, {
        method: "DELETE",
      });
      
      if (response.ok) {
        setTransactions(transactions.filter(transaction => transaction.id !== id));
      } else {
        console.error("Failed to delete transaction");
      }
    } catch (error) {
      console.error("Error deleting transaction:", error);
    }
  };

  const filteredTransactions = transactions.filter(transaction => 
    transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getCategoryLabel(transaction.category).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-slate-800 text-white">
      <div className="container mx-auto py-8 px-4">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Transactions</h1>
            <p className="text-gray-400">View and manage your transaction history</p>
          </div>
          <div className="flex gap-4 self-end md:self-auto">
            <Link href="/">
              <Button variant="outline" className="border-slate-600 text-white hover:bg-slate-700">
                Back to Dashboard
              </Button>
            </Link>
            <Link href="/transactions/new">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <PlusCircle className="mr-2 h-4 w-4" />
                New Transaction
              </Button>
            </Link>
          </div>
        </header>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-slate-700 border border-slate-600 rounded-lg shadow-lg p-6">
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search transactions..."
                    className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                </div>
              ) : filteredTransactions.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  {searchTerm ? "No transactions found matching your search." : "No transactions found. Add some transactions to get started!"}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredTransactions.map((transaction) => (
                    <Card key={transaction.id} className="p-4 bg-slate-800 border-slate-700">
                      <div className="flex flex-col sm:flex-row justify-between">
                        <div>
                          <div className="flex flex-wrap gap-2 items-center">
                            <span className="font-semibold text-white">{transaction.description}</span>
                            <span className={`text-sm px-2 py-1 rounded ${getCategoryColor(transaction.category)}`}>
                              {getCategoryLabel(transaction.category)}
                            </span>
                          </div>
                          <div className="text-sm text-slate-400 mt-1">{new Date(transaction.date).toLocaleDateString()}</div>
                        </div>
                        <div className="flex items-center mt-2 sm:mt-0">
                          <span className={`font-medium ${transaction.amount >= 0 ? "text-green-400" : "text-red-400"} mr-4`}>
                            {transaction.amount >= 0 ? "+" : ""}${Math.abs(transaction.amount).toFixed(2)}
                          </span>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 hover:bg-red-600/20 hover:text-red-400"
                            onClick={() => deleteTransaction(transaction.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div>
            <CategoriesOfPastTransactionsPieChart />
          </div>
        </div>
      </div>
    </main>
  );
}

// Helper function to get category label
function getCategoryLabel(categoryId: string): string {
  const categories: Record<string, string> = {
    groceries: "Groceries",
    dining: "Dining Out",
    utilities: "Utilities",
    transport: "Transportation",
    entertainment: "Entertainment",
    shopping: "Shopping",
    health: "Healthcare",
    housing: "Housing",
    education: "Education",
    miscellaneous: "Miscellaneous",
    income: "Income"
  };
  
  return categories[categoryId] || categoryId;
}

// Helper function to get category color
function getCategoryColor(categoryId: string): string {
  const colors: Record<string, string> = {
    groceries: "bg-blue-600/20 text-blue-400",
    dining: "bg-purple-600/20 text-purple-400",
    utilities: "bg-yellow-600/20 text-yellow-400",
    transport: "bg-green-600/20 text-green-400",
    entertainment: "bg-pink-600/20 text-pink-400",
    shopping: "bg-indigo-600/20 text-indigo-400",
    health: "bg-cyan-600/20 text-cyan-400",
    housing: "bg-amber-600/20 text-amber-400",
    education: "bg-lime-600/20 text-lime-400",
    miscellaneous: "bg-gray-600/20 text-gray-400",
    income: "bg-emerald-600/20 text-emerald-400"
  };
  
  return colors[categoryId] || "bg-gray-600/20 text-gray-400";
}