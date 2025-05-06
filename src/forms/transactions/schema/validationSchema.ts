import * as Yup from 'yup';

export const transactionSchema = Yup.object().shape({
  amount: Yup.number()
    .required('Amount is required')
    .positive('Amount must be positive')
    .typeError('Amount must be a number'),
  description: Yup.string()
    .required('Description is required')
    .max(100, 'Description must be less than 100 characters'),
  category: Yup.string()
    .required('Category is required'),
  date: Yup.date()
    .required('Date is required')
    .max(new Date(), 'Date cannot be in the future')
    .typeError('Please enter a valid date')
});

export default transactionSchema;