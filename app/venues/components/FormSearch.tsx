'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

// hooks
import useAlert from '@hooks/useAlert';

// components
import Input from '@components/Form/Input';

interface IFormProps {
  keyword: string;
}

const FormSearch: React.FC = () => {
  const { showAlert } = useAlert();
  const router = useRouter();

  const [formValues, setFormValues] = useState<IFormProps>({
    keyword: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;

    setFormValues({
      ...formValues,
      [name]: value,
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();

    const { keyword } = formValues;

    if (keyword === '' || keyword.length < 2) {
      showAlert({ type: 'error', text: 'Por favor, introduzca al menos 2 caracteres para buscar.' });
      return;
    }

    router.push(`/list?q=${encodeURIComponent(keyword.trim())}`);
  };

  return (
    <form noValidate onSubmit={handleSubmit}>
      <div className='search-inputs flex flex-h-center flex-space-between'>
        <Input
          type='text'
          name='keyword'
          value={formValues.keyword}
          maxLength={64}
          placeholder='Nombre evento, lugar, ubicación'
          required
          onChange={handleChange}
        />
        <button type='submit' aria-label='Buscar'>
          <span className='material-symbols-outlined'>search</span>
        </button>
      </div>
    </form>
  );
};

export default FormSearch;
