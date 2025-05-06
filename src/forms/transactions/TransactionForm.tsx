"use client";

import { useEffect, useState } from 'react';
import { Formik, Form, Field, ErrorMessage, FormikHelpers } from 'formik';
import transactionSchema from './schema/validationSchema';
import { Button } from '@/components/ui/button';

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
  const [categories, setCategories] = useState<CategoryOption[]>([]);

  useEffect(() => {
    // In a real application, you might fetch this from an API
    const loadCategories = async () => {
      try {
        const categoriesData = await import('./schema/categories.json');
        setCategories(categoriesData.categories);
      } catch (error) {
        console.error('Failed to load categories:', error);
      }
    };
    
    loadCategories();
  }, []);

  const initialValues: TransactionFormValues = {
    amount: '',
    description: '',
    category: '',
    date: '',
  };

  const handleSubmit = (values: TransactionFormValues, { resetForm }: FormikHelpers<TransactionFormValues>) => {
    console.log('Form submitted with values:', values);
    // Here you would typically save the transaction to your backend
    alert('Transaction submitted successfully!');
    resetForm();
  };

  return (
      
      <Formik
        initialValues={initialValues}
        validationSchema={transactionSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }: { isSubmitting: boolean }) => (
          <Form className="space-y-4">
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                Amount
              </label>
              <Field
                type="number"
                id="amount"
                name="amount"
                placeholder="0.00"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <ErrorMessage name="amount" component="div" className="mt-1 text-sm text-red-600" />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <Field
                type="text"
                id="description"
                name="description"
                placeholder="What was this transaction for?"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <ErrorMessage name="description" component="div" className="mt-1 text-sm text-red-600" />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <Field
                as="select"
                id="category"
                name="category"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.label}
                  </option>
                ))}
              </Field>
              <ErrorMessage name="category" component="div" className="mt-1 text-sm text-red-600" />
            </div>

            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <Field
                type="date"
                id="date"
                name="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <ErrorMessage name="date" component="div" className="mt-1 text-sm text-red-600" />
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full"
            >
              {isSubmitting ? 'Submitting...' : 'Add Transaction'}
            </Button>
          </Form>
        )}
      </Formik>
  );
};

export default TransactionForm;