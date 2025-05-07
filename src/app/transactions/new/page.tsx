"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import TransactionForm from "@/forms/transactions/TransactionForm";

export default function NewTransactionPage() {
  return (
    <main className="min-h-screen bg-slate-800 text-white">
      <div className="container mx-auto py-8 px-4">
        <div className="mb-6">
          <Link href="/transactions">
            <Button variant="outline" className="border-slate-600 text-white hover:bg-slate-700">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Transactions
            </Button>
          </Link>
        </div>
        
        <div className="max-w-2xl mx-auto">
          <TransactionForm />
          
          <div className="mt-8 p-4 bg-slate-700 border border-slate-600 rounded-lg">
            <h3 className="text-lg font-medium mb-2">Quick Tips</h3>
            <ul className="space-y-2 text-sm text-slate-300">
              <li>• Use negative amounts for expenses and positive for income</li>
              <li>• Categorize transactions accurately for better insights</li>
              <li>• Add detailed descriptions to easily identify transactions later</li>
              <li>• The date defaults to today but can be changed</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}