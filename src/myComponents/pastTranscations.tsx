"use client";

import React from 'react'

interface Transaction {
    id: string;
    amount: number;
    description: string;
    category: string;
    date: string;
}

const PastTranscations = () => {

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

  return (
    <div className='bg-slate-800 min-h-screen p-8'>
        <h1 className='text-2xl font-bold text-white mb-4'>Past Transactions</h1>
        <table className='min-w-full bg-white'>
            <thead>
                <tr>
                    <th className='py-2 px-4 border-b'>ID</th>
                    <th className='py-2 px-4 border-b'>Amount</th>
                    <th className='py-2 px-4 border-b'>Description</th>
                    <th className='py-2 px-4 border-b'>Category</th>
                    <th className='py-2 px-4 border-b'>Date</th>
                </tr>
            </thead>
            <tbody>
                {pastTranscations.map(transaction => (
                    <tr key={transaction.id}>
                        <td className='py-2 px-4 border-b'>{transaction.id}</td>
                        <td className='py-2 px-4 border-b'>{transaction.amount}</td>
                        <td className='py-2 px-4 border-b'>{transaction.description}</td>
                        <td className='py-2 px-4 border-b'>{transaction.category}</td>
                        <td className='py-2 px-4 border-b'>{transaction.date}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
  )
}

export default PastTranscations
