"use client";

import { Formik, Form, Field, ErrorMessage } from 'formik';
import { useState, useEffect } from 'react';
import * as Yup from 'yup';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import transactionSchema from './schema/validationSchema';
import categories from './schema/categories.json';

const validationSchema = Yup.object({
  amount: Yup.number()
    .required('Amount is required')
    .positive('Amount must be positive'),
  description: Yup.string()
    .required('Description is required')
    .min(3, 'Description must be at least 3 characters'),
  category: Yup.string()
    .required('Category is required'),
  date: Yup.string()
    .required('Date is required')
});

interface CategoryOption {
  id: string;
  label: string;
  description: string;
}

interface TransactionFormValues {
  amount: string;
  description: string;
  category: string;
  date: string;
}

export const TransactionForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const router = useRouter();

  const initialValues: TransactionFormValues = {
    amount: '',
    description: '',
    category: '',
    date: new Date().toISOString().slice(0, 10), // Default to today's date
  };

  const handleSubmit = async (
    values: TransactionFormValues, 
    { resetForm }: any
  ) => {
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...values,
          amount: Number(values.amount),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create transaction');
      }

      setSubmitSuccess(true);
      resetForm();
      router.refresh();
      
      // Notify parent component if needed
      // onTransactionAdded();
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="bg-slate-700 p-6 shadow-lg border-slate-600">
      <h2 className="text-2xl font-bold mb-6 text-white">Add New Transaction</h2>
      
      {submitSuccess && (
        <div className="bg-green-800 text-white p-3 rounded-md mb-4">
          Transaction added successfully!
        </div>
      )}
      
      {submitError && (
        <div className="bg-red-800 text-white p-3 rounded-md mb-4">
          {submitError}
        </div>
      )}
      
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isValid, touched, errors }) => (
          <Form className="space-y-4">
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-200 mb-1">
                Amount
              </label>
              <Field
                type="number"
                id="amount"
                name="amount"
                placeholder="0.00"
                step="0.01"
                className="w-full p-2 bg-slate-800 border border-slate-600 rounded-md text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <ErrorMessage name="amount" component="div" className="mt-1 text-sm text-red-500" />
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-200 mb-1">
                Description
              </label>
              <Field
                type="text"
                id="description"
                name="description"
                placeholder="Transaction description"
                className="w-full p-2 bg-slate-800 border border-slate-600 rounded-md text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <ErrorMessage name="description" component="div" className="mt-1 text-sm text-red-500" />
            </div>
            
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-200 mb-1">
                Category
              </label>
              <Field
                as="select"
                id="category"
                name="category"
                className="w-full p-2 bg-slate-800 border border-slate-600 rounded-md text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select a category</option>
                {categories.categories.map((category: CategoryOption) => (
                  <option key={category.id} value={category.id}>
                    {category.label}
                  </option>
                ))}
              </Field>
              <ErrorMessage name="category" component="div" className="mt-1 text-sm text-red-500" />
            </div>
            
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-200 mb-1">
                Date
              </label>
              <Field
                type="date"
                id="date"
                name="date"
                className="w-full p-2 bg-slate-800 border border-slate-600 rounded-md text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <ErrorMessage name="date" component="div" className="mt-1 text-sm text-red-500" />
            </div>
            
            <Button
              type="submit"
              disabled={isSubmitting || (!isValid && Object.keys(touched).length > 0)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white transition-colors"
            >
              {isSubmitting ? 'Adding...' : 'Add Transaction'}
            </Button>
          </Form>
        )}
      </Formik>
    </Card>
  );
}

export default TransactionForm;