"use client";

import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import categories from "@/forms/transactions/schema/categories.json";

interface BudgetComparisonItem {
  category: string;
  budgetAmount: number;
  actual: number;
  remaining: number;
  percentUsed: number;
  isOverBudget: boolean;
}

export default function BudgetVsActualChart() {
  const [comparisonData, setComparisonData] = useState<BudgetComparisonItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const fetchComparisonData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(
        `/api/budgets/comparison?month=${selectedMonth}&year=${selectedYear}`
      );
      
      if (!response.ok) {
        throw new Error("Failed to fetch budget comparison data");
      }
      
      const data = await response.json();
      
      // Sort by budget amount (descending)
      const sortedData = [...data.comparison].sort((a, b) => b.budgetAmount - a.budgetAmount);
      
      setComparisonData(sortedData);
    } catch (error) {
      console.error("Error fetching budget comparison:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to load budget comparison"
      );
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    fetchComparisonData();
  }, [fetchComparisonData]);

  const getCategoryLabel = (categoryId: string) => {
    const category = categories.categories.find(c => c.id === categoryId);
    return category ? category.label : categoryId;
  };

  const getMonthName = (month: number) => {
    const date = new Date(2000, month - 1, 1);
    return date.toLocaleString("default", { month: "long" });
  };

  // Format data for the chart
  const chartData = comparisonData.map(item => ({
    name: getCategoryLabel(item.category),
    Budget: item.budgetAmount,
    Actual: item.actual,
    categoryId: item.category
  }));

  // Function to generate month options
  const getMonthOptions = () => {
    const options = [];
    for (let i = 1; i <= 12; i++) {
      options.push(
        <option key={i} value={i}>
          {getMonthName(i)}
        </option>
      );
    }
    return options;
  };

  // Function to generate year options
  const getYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const options = [];
    
    for (let i = 0; i < 5; i++) {
      const year = currentYear + i;
      options.push(
        <option key={year} value={year}>
          {year}
        </option>
      );
    }
    
    return options;
  };

  // Custom tooltip for the chart
  interface TooltipProps {
    active?: boolean;
    payload?: Array<{
      value: number;
    }>;
    label?: string;
  }

  const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
    if (active && payload && payload.length) {
      const budgetAmount = payload[0]?.value || 0;
      const actualAmount = payload[1]?.value || 0;
      const remaining = budgetAmount - actualAmount;
      const isOverBudget = actualAmount > budgetAmount;
      
      return (
        <div className="bg-slate-900 p-3 border border-slate-700 rounded-md shadow-lg text-white">
          <p className="font-medium mb-1">{label}</p>
          <p className="text-blue-400">Budget: ${budgetAmount.toFixed(2)}</p>
          <p className="text-green-400">Actual: ${actualAmount.toFixed(2)}</p>
          <p className={isOverBudget ? "text-red-400" : "text-emerald-400"}>
            {isOverBudget ? "Over by" : "Under by"}: ${Math.abs(remaining).toFixed(2)}
          </p>
        </div>
      );
    }
    
    return null;
  };

  return (
    <Card className="p-6 bg-slate-700 text-white h-[650px] flex flex-col">
      <h2 className="text-xl font-bold mb-4">Budget vs Actual</h2>
      
      {error && (
        <div className="bg-red-800 text-white p-3 rounded-md mb-4">
          {error}
        </div>
      )}
      
      <div className="mb-4 flex gap-4">
        <div className="w-1/2">
          <label className="block text-sm font-medium mb-1">Month</label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            className="w-full p-2 bg-slate-800 border border-slate-600 rounded-md text-white"
            disabled={loading}
          >
            {getMonthOptions()}
          </select>
        </div>
        
        <div className="w-1/2">
          <label className="block text-sm font-medium mb-1">Year</label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="w-full p-2 bg-slate-800 border border-slate-600 rounded-md text-white"
            disabled={loading}
          >
            {getYearOptions()}
          </select>
        </div>
      </div>
      
      {loading ? (
        <div className="flex items-center justify-center flex-grow">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
            <p className="mt-2 text-gray-400">Loading comparison data...</p>
          </div>
        </div>
      ) : comparisonData.length === 0 ? (
        <div className="text-center flex-grow flex items-center justify-center">
          <div className="text-gray-400">
            <p>No budget data available for this period.</p>
            <p className="mt-2 text-sm">Set budgets to see comparison.</p>
          </div>
        </div>
      ) : (
        <div className="flex-grow overflow-hidden">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
              barGap={0}
              barSize={20}
            >
              <XAxis 
                dataKey="name" 
                tick={{ fill: 'white' }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                tickFormatter={(value) => `$${value}`}
                tick={{ fill: 'white' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ paddingTop: '10px' }} />
              <Bar dataKey="Budget" fill="#3B82F6" name="Budget" />
              <Bar dataKey="Actual" fill="#10B981" name="Actual" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}