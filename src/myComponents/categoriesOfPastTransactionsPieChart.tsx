"use client";

import { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardDescription, CardContent } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import categories from '@/forms/transactions/schema/categories.json';

interface CategoryData {
  name: string;
  value: number;
}

interface CategoriesChartProps {
  onTransactionUpdate?: number | (() => void);
}

// Color palette for the pie chart
const COLORS = [
  '#3B82F6', // blue-500
  '#10B981', // emerald-500
  '#F59E0B', // amber-500
  '#EF4444', // red-500
  '#8B5CF6', // violet-500
  '#EC4899', // pink-500
  '#06B6D4', // cyan-500
  '#F97316', // orange-500
  '#6366F1', // indigo-500
  '#84CC16', // lime-500
];

export default function CategoriesOfPastTransactionsPieChart({ onTransactionUpdate }: CategoriesChartProps) {
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [refreshCounter, setRefreshCounter] = useState(0);

  const fetchCategorySummary = useCallback(async () => {
    try {
      console.log("🔄 Fetching category summary data...");
      setLoading(true);
      const response = await fetch('/api/transactions/summary', {
        // Add cache busting to prevent caching
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch category summary');
      }
      
      const data = await response.json();
      
      // Map category IDs to their labels
      const formattedData = data.summary?.map((item: CategoryData) => ({
        name: getCategoryLabel(item.name),
        value: item.value,
        categoryId: item.name
      })) || [];
      
      console.log("📊 Updated category data received:", formattedData);
      setCategoryData(formattedData);
      setTotalTransactions(data.totalTransactions || 0);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load category summary');
      console.error('Error fetching category summary:', error);
    } finally {
      setLoading(false);
    }
  }, [refreshCounter]); // Add refreshCounter to dependencies

  // Initial fetch
  useEffect(() => {
    fetchCategorySummary();
  }, [fetchCategorySummary]);

  // Refresh when transactions are updated
  useEffect(() => {
    if (onTransactionUpdate) {
      console.log("🔄 Pie Chart: Refresh triggered");
      // Force a refresh by incrementing refresh counter
      setRefreshCounter(prev => prev + 1);
    }
  }, [onTransactionUpdate]);

  const getCategoryLabel = (categoryId: string) => {
    const category = categories.categories.find(c => c.id === categoryId);
    return category ? category.label : categoryId;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'INR'
    }).format(value);
  };

  // Define tooltip props interface
  interface PieTooltipProps {
    active?: boolean;
    payload?: Array<{
      name: string;
      value: number;
    }>;
  }

  const CustomTooltip = ({ active, payload }: PieTooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 p-2 border border-slate-700 rounded-md shadow-lg text-white">
          <p className="font-medium">{payload[0].name}</p>
          <p>{formatCurrency(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <Card className="min-h-[400px] p-6 bg-slate-700 text-white h-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="min-h-[400px] p-6 bg-slate-700 text-white">
        <h2 className="text-xl font-bold mb-4">Spending by Category</h2>
        <div className="bg-red-800 text-white p-4 rounded-md">
          {error}
        </div>
      </Card>
    );
  }

  if (categoryData.length === 0) {
    return (
      <Card className="min-h-[400px] p-6 bg-slate-700 text-white">
        <h2 className="text-xl font-bold mb-4">Spending by Category</h2>
        <div className="text-center p-6 text-gray-400">
          No transaction data available to display.
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-slate-700 text-white h-[400px]">
      <CardHeader className="px-0 pb-0">
        <CardDescription>Expense Categories</CardDescription>
      </CardHeader>
      <CardContent className="p-0 mt-4 h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={categoryData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {categoryData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend layout="vertical" align="right" verticalAlign="middle" />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
      <div className="text-center text-sm text-gray-400 mt-4">
        Based on {totalTransactions} transaction{totalTransactions !== 1 ? 's' : ''}
      </div>
    </Card>
  );
}