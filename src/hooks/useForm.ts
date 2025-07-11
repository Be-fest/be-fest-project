import { useState, ChangeEvent } from 'react';

interface UseFormProps<T> {
  initialValues: T;
}

export function useForm<T>({ initialValues }: UseFormProps<T>) {
  const [values, setValues] = useState<T>(initialValues);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setValues(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  return {
    values,
    handleChange,
  };
}
