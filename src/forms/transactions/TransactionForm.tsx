"use client";

import { Formik, Form, Field, ErrorMessage } from 'formik';
import { useState } from 'react';
import * as Yup from 'yup';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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
  transactionType: 'income' | 'expense';
}

interface TransactionFormProps {
  initialData?: {
    id?: string;
    amount: string;
    description: string;
    category: string;
    date: string;
  };
  onSuccess?: () => void;
  onCancel?: () => void;
  mode?: 'create' | 'edit';
}

export const TransactionForm = ({ initialData, onSuccess, onCancel, mode = 'create' }: TransactionFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const initialValues: TransactionFormValues = {
    amount: initialData?.amount || '',
    description: initialData?.description || '',
    category: initialData?.category || '',
    date: initialData?.date || new Date().toISOString().slice(0, 10),
    transactionType: initialData?.amount && Number(initialData.amount) > 0 ? 'income' : 'expense',
  };

  const handleSubmit = async (
    values: TransactionFormValues, 
    { resetForm }: { resetForm: () => void }
  ) => {
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      const url = mode === 'edit' && initialData?.id 
        ? `/api/transactions/${initialData.id}`
        : '/api/transactions';
      
      const method = mode === 'edit' ? 'PUT' : 'POST';
      
      const amount = values.transactionType === 'expense' 
        ? -Math.abs(Number(values.amount))
        : Math.abs(Number(values.amount));

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...values,
          amount,
          id: initialData?.id // Include the ID when editing
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || `Failed to ${mode} transaction`);
      }

      setSubmitSuccess(true);
      
      // Always call onSuccess after successful submission
      // This will trigger the refresh of all components
      if (onSuccess) {
        onSuccess();
      }

      if (mode === 'create') {
        resetForm();
      }
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'An error occurred');
      console.error('Transaction submit error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="bg-slate-700 p-6 shadow-lg border-slate-600">
      <h2 className="text-2xl font-bold mb-6 text-white">
        {mode === 'edit' ? 'Edit Transaction' : 'Add New Transaction'}
      </h2>
      
      {submitSuccess && (
        <div className="bg-green-800 text-white p-3 rounded-md mb-4">
          Transaction {mode === 'edit' ? 'updated' : 'added'} successfully!
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
        enableReinitialize
      >
        {({ isValid, touched }) => (
          <Form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Transaction Type
              </label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <Field
                    type="radio"
                    name="transactionType"
                    value="expense"
                    className="mr-2 bg-slate-800 border-slate-600"
                  />
                  <span className="text-sm text-gray-200">Expense</span>
                </label>
                <label className="flex items-center">
                  <Field
                    type="radio"
                    name="transactionType"
                    value="income"
                    className="mr-2 bg-slate-800 border-slate-600"
                  />
                  <span className="text-sm text-gray-200">Income</span>
                </label>
              </div>
            </div>

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
            
            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={isSubmitting || (!isValid && Object.keys(touched).length > 0)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white transition-colors"
              >
                {isSubmitting ? 'Saving...' : mode === 'edit' ? 'Update Transaction' : 'Add Transaction'}
              </Button>
              
              {mode === 'edit' && onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  className="border-slate-600 text-white hover:bg-slate-700"
                >
                  Cancel
                </Button>
              )}
            </div>
          </Form>
        )}
      </Formik>
    </Card>
  );
}

export default TransactionForm;