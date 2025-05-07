"use client";

import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import categories from "@/forms/transactions/schema/categories.json";

interface BudgetItem {
  id?: string;
  category: string;
  amount: number;
  month: number;
  year: number;
}

interface CategoryBudgetFormProps {
  onBudgetChange?: () => void;
}

export default function CategoryBudgetForm({ onBudgetChange }: CategoryBudgetFormProps) {
  const [budgets, setBudgets] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const fetchBudgets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(
        `/api/budgets?month=${selectedMonth}&year=${selectedYear}`
      );
      
      if (!response.ok) throw new Error("Failed to fetch budgets");
      
      const data = await response.json();
      const budgetMap: Record<string, number> = {};
      
      data.budgets.forEach((budget: BudgetItem) => {
        budgetMap[budget.category] = budget.amount;
      });
      
      setBudgets(budgetMap);
    } catch (error) {
      console.error("Error fetching budgets:", error);
      setError(error instanceof Error ? error.message : "Failed to load budgets");
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    fetchBudgets();
  }, [fetchBudgets]);

  const handleInputChange = (categoryId: string, value: string) => {
    const amount = value === "" ? 0 : parseFloat(value);
    if (!isNaN(amount)) {
      setBudgets({ ...budgets, [categoryId]: amount });
    }
  };

  // Emit a custom budget update event when budgets are saved successfully
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      setSuccess(false);
      
      const saveBudgetPromises = Object.entries(budgets).map(
        async ([category, amount]) => {
          if (amount <= 0) return null;
          const response = await fetch("/api/budgets", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ category, amount, month: selectedMonth, year: selectedYear }),
          });
          if (!response.ok) throw new Error(`Failed to save budget for ${getCategoryLabel(category)}`);
          return response.json();
        }
      );
      
      await Promise.all(saveBudgetPromises.filter(Boolean));
      setSuccess(true);
      
      // Dispatch a custom event for budget updates
      window.dispatchEvent(new CustomEvent('budget-updated', {
        detail: { month: selectedMonth, year: selectedYear }
      }));
      
      // Call the callback function if provided
      if (onBudgetChange) onBudgetChange();
    } catch (error) {
      console.error("Error saving budgets:", error);
      setError(error instanceof Error ? error.message : "Failed to save budgets");
      setSuccess(false);
    } finally {
      setSaving(false);
    }
  };

  const getCategoryLabel = (categoryId: string) => {
    return categories.categories.find(c => c.id === categoryId)?.label || categoryId;
  };

  const getMonthName = (month: number) => {
    return new Date(2000, month - 1, 1).toLocaleString("default", { month: "long" });
  };

  // Auto-hide success message after 3 seconds
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    if (success) {
      timeoutId = setTimeout(() => {
        setSuccess(false);
      }, 3000); // 3 seconds
    }
    
    // Clean up the timeout when component unmounts or success state changes
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [success]);

  return (
    <Card className="p-6 bg-slate-700 text-white h-[650px] flex flex-col">
      <div className="flex flex-col h-full">
        <h2 className="text-xl font-bold mb-4">Monthly Category Budgets</h2>
        
        {error && (
          <div className="bg-red-800 text-white p-3 rounded-md mb-4">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-800 text-white p-3 rounded-md mb-4">
            Budgets saved successfully!
          </div>
        )}
        
        <div className="mb-4 flex gap-4">
          <div className="w-1/2">
            <label className="block text-sm font-medium mb-1">Month</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="w-full p-2 bg-slate-800 border border-slate-600 rounded-md text-white"
              disabled={loading || saving}
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                <option key={month} value={month}>
                  {getMonthName(month)}
                </option>
              ))}
            </select>
          </div>
          
          <div className="w-1/2">
            <label className="block text-sm font-medium mb-1">Year</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="w-full p-2 bg-slate-800 border border-slate-600 rounded-md text-white"
              disabled={loading || saving}
            >
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() + i).map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex-grow flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
              <p className="mt-2 text-gray-400">Loading budgets...</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col h-full overflow-hidden">
            <div className="flex-grow overflow-y-auto pr-2 pb-4">
              <div className="space-y-2">
                {categories.categories.map((category) => (
                  <div key={category.id} className="flex items-center p-3 bg-slate-800 rounded-lg">
                    <div className="flex-1">
                      <label htmlFor={`budget-${category.id}`} className="font-medium">
                        {category.label}
                      </label>
                    </div>
                    <div className="w-1/3">
                      <div className="relative">
                        <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">$</span>
                        <input
                          id={`budget-${category.id}`}
                          type="number"
                          min="0"
                          step="0.01"
                          value={budgets[category.id] || ""}
                          onChange={(e) => handleInputChange(category.id, e.target.value)}
                          className="w-full p-2 pl-8 bg-slate-900 border border-slate-600 rounded-md text-white"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="pt-4 border-t border-slate-600 mt-auto">
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Budgets"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </Card>
  );
}