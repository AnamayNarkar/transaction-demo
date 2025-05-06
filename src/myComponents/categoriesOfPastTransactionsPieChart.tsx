"use client"

import React from 'react'
import { TrendingUp } from "lucide-react"
import { Label, Pie, PieChart } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

const categoriesOfPastTransactionsPieChart = () => {

    interface Transaction {
        id: string;
        amount: number;
        description: string;
        category: string;
        date: string;
    }

    const pastTranscations : Transaction[] = [
        {
            id: '1',
            amount: 100,
            description: 'Groceries',
            category: 'Food',
            date: '2023-10-01'
        },
        {
            id: '2',
            amount: 50,
            description: 'Gas',
            category: 'Transport',
            date: '2023-10-02'
        },
        {
            id: '3',
            amount: 200,
            description: 'Rent',
            category: 'Housing',
            date: '2023-10-03'
        }
    ]

    const PieChartData = [
        { name: 'Food', value: 100 },
        { name: 'Transport', value: 50 },
        { name: 'Housing', value: 200 },
    ]

    const pieChartConfig = {
        Food: {
            label: "Food",
            color: "hsl(var(--chart-1))",
        },
        Transport: {
            label: "Transport",
            color: "hsl(var(--chart-2))",
        },
        Housing: {
            label: "Housing",
            color: "hsl(var(--chart-3))",
        },
    }

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Pie Chart - Donut with Text</CardTitle>
        <CardDescription>January - June 2024</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 pb-0">
            <ChartContainer
                config={pieChartConfig}
                className="mx-auto aspect-square max-h-[250px]"
            >
                <PieChart>
                <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                />
                <Pie
                    data={PieChartData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={60}
                    strokeWidth={5}
                >
                    <Label
                    content={(props: any) => {
                        // For PieChart, the viewBox is a PolarViewBox which has cx and cy properties
                        const { viewBox } = props;
                        if (!viewBox) return null;
                        
                        // PolarViewBox has cx and cy directly
                        const centerX = viewBox.cx;
                        const centerY = viewBox.cy;
                        
                        return (
                            <text
                            x={centerX}
                            y={centerY}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            >
                            <tspan
                                x={centerX}
                                y={centerY}
                                className="fill-foreground text-3xl font-bold"
                            >
                                {pastTranscations.length.toLocaleString()}
                            </tspan>
                            <tspan
                                x={centerX}
                                y={centerY + 24}
                                className="fill-muted-foreground"
                            >
                                Transactions
                            </tspan>
                            </text>
                        );
                    }}
                    />
                </Pie>
                </PieChart>
            </ChartContainer>
        </CardContent>
        <CardFooter className="flex-col gap-2 text-sm">
            <div className="flex items-center gap-2 font-medium leading-none">
                Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
            </div>
            <div className="leading-none text-muted-foreground">
                Showing total transactions for the last 6 months
            </div>
        </CardFooter>
    </Card>
  )
}

export default categoriesOfPastTransactionsPieChart