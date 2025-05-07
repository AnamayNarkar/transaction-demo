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
          <Link href="/">
            <Button variant="outline" className="border-slate-600 text-white hover:bg-slate-700">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
        
        <div className="max-w-2xl mx-auto">
          <TransactionForm />
        </div>
      </div>
    </main>
  );
}