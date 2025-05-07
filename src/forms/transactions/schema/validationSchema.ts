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
    .required('Date is required')
});

export default validationSchema;