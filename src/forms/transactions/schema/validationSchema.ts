import * as Yup from 'yup';

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
    .required('Date is required'),
  transactionType: Yup.string()
    .required('Transaction type is required')
    .oneOf(['income', 'expense'], 'Must be either income or expense')
});

export default validationSchema;