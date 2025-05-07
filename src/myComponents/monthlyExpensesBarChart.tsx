"use client"

import { useState, useEffect, useCallback } from "react"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

const initialChartData = [
  { month: "January", expenses: 0, income: 0 },
  { month: "February", expenses: 0, income: 0 },
  { month: "March", expenses: 0, income: 0 },
  { month: "April", expenses: 0, income: 0 },
  { month: "May", expenses: 0, income: 0 },
  { month: "June", expenses: 0, income: 0 },
]

const chartConfig = {
  expenses: {
    label: "Expenses",
    color: "hsl(var(--chart-1))",
  },
  income: {
    label: "Income",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

interface MonthlyExpensesChartProps {
  onTransactionUpdate?: () => void;
}

interface Transaction {
    id: string;
    amount: number;
    date: string;
    transactionType: string;
    description: string;
    category: string;
  }

export default function MonthlyExpensesBarChart({ onTransactionUpdate }: MonthlyExpensesChartProps) {
  const [chartData, setChartData] = useState(initialChartData)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const currentYear = new Date().getFullYear()

  const processTransactionsByMonth = useCallback((transactions: Transaction[]) => {
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ]
    
    const monthlyData = months.map(month => ({
      month,
      expenses: 0,
      income: 0,
    }))
    
    transactions.forEach((transaction) => {
      const date = new Date(transaction.date)
      const monthIndex = date.getMonth()
      
      if (date.getFullYear() === currentYear) {
        if (transaction.amount < 0) {
          monthlyData[monthIndex].expenses += Math.abs(transaction.amount)
        } else {
          monthlyData[monthIndex].income += transaction.amount
        }
      }
    })
    
    return monthlyData.slice(0, 6)
  }, [currentYear])

  const fetchMonthlyData = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/transactions')
      
      if (!response.ok) {
        throw new Error('Failed to fetch transactions')
      }
      
      const data = await response.json()
      const transactions = data.transactions || []
      
      const monthlyData = processTransactionsByMonth(transactions)
      setChartData(monthlyData)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load monthly data')
      console.error('Error fetching monthly expense data:', error)
    } finally {
      setLoading(false)
    }
  }, [processTransactionsByMonth])

  // Initial fetch
  useEffect(() => {
    fetchMonthlyData()
  }, [fetchMonthlyData])

  // Refresh when transactions are updated
  useEffect(() => {
    if (onTransactionUpdate) {
      fetchMonthlyData();
    }
  }, [onTransactionUpdate, fetchMonthlyData]);

  if (loading) {
    return (
      <Card className="p-6 bg-slate-700 text-white h-[400px]">
        <CardHeader className="px-0 pb-0">
          <CardTitle>Monthly Expenses</CardTitle>
          <CardDescription>Loading data...</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center p-0 mt-4 h-[300px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="p-6 bg-slate-700 text-white h-[400px]">
        <CardHeader className="px-0 pb-0">
          <CardTitle>Monthly Expenses</CardTitle>
          <CardDescription>Error loading chart</CardDescription>
        </CardHeader>
        <CardContent className="p-0 mt-4">
          <div className="bg-red-900/20 border border-red-800 text-red-300 rounded p-3 text-sm">
            {error}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="p-6 bg-slate-700 text-white h-[400px]">
      <CardHeader className="px-0 pb-0">
        {/* <CardTitle>Monthly Expenses</CardTitle> */}
        <CardDescription>January - June {currentYear}</CardDescription>
      </CardHeader>
      <CardContent className="p-0 mt-4 h-[300px]">
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tick={{ fill: 'white' }}
                tickFormatter={(value) => value.slice(0, 3)}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dashed" />}
              />
              <Bar 
                dataKey="expenses" 
                fill="hsl(var(--chart-1))" 
                radius={4} 
                barSize={24}
              />
              <Bar 
                dataKey="income" 
                fill="hsl(var(--chart-2))" 
                radius={4} 
                barSize={24}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}