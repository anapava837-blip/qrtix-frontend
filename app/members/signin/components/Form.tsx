'use client';

import { useState } from 'react';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

// hooks
import useAlert from '@hooks/useAlert';
import useUser from '@hooks/useUser';
import { useFormValidation, commonValidationRules } from '@hooks/useFormValidation';

// components
import Input from '@components/Form/Input';
import Button from '@components/Button/Button';
import Loader from '@components/Loader/Loader';

// utils
import Request, { type IRequest, type IResponse } from '@utils/Request';

// interfaces
interface IFormProps {
  email: string;
  password: string;
}

const Form: React.FC = () => {
  const { showAlert, hideAlert } = useAlert();
  const { login } = useUser();
  const router = useRouter();

  const [loading, setLoading] = useState<boolean>(false);
  const [formValues, setFormValues] = useState<IFormProps>({
    email: '',
    password: '',
  });

  const { errors, validateSingleField, validateForm } = useFormValidation(
    commonValidationRules.signin
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;

    setFormValues({
      ...formValues,
      [name]: value,
    });

    validateSingleField(name, value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<any> => {
    e.preventDefault();

    hideAlert();

    const isValid = validateForm(formValues);
    if (!isValid) {
      showAlert({ type: 'error', text: 'Por favor, corrige los errores en el formulario' });
      return;
    }

    setLoading(true);

    const parameters: IRequest = {
      url: 'v1/signin/login',
      method: 'POST',
      postData: {
        email: formValues.email,
        password: formValues.password,
      },
    };

    const req: IResponse = await Request.getResponse(parameters);

    const { status, data } = req;

    if (status === 200) {
      const userData = {
        id: data.results?.userId || 'temp-id',
        name: data.results?.name || 'Usuario',
        lastname: data.results?.lastname || '',
        email: formValues.email,
        photo: '',
        cedula: data.results?.cedula || '',
        telefono: data.results?.telefono || '',
      };

      login(userData);

      showAlert({ type: 'success', text: 'Inicio de sesión exitoso' });

      setTimeout(() => {
        router.push('/');
      }, 1500);
    } else {
      const message = (data && (data.detail || data.title)) || 'Error en inicio de sesión';
      showAlert({ type: 'error', text: message });
    }

    setLoading(false);
  };

  if (loading) {
    return <Loader type='inline' color='gray' text='Espera un segundo' />;
  }

  return (
    <form
      className='form shrink'
      noValidate
      onSubmit={(e) => {
        void handleSubmit(e);
      }}
    >
      <div className='form-elements'>
        <div className='form-line'>
          <div className='one-line'>
            <button type='button' className='google-button'>
              <svg
                version='1.1'
                xmlns='http://www.w3.org/2000/svg'
                width='18px'
                height='18px'
                viewBox='0 0 48 48'
              >
                <g>
                  <path
                    fill='#EA4335'
                    d='M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z'
                  />
                  <path
                    fill='#4285F4'
                    d='M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z'
                  />
                  <path
                    fill='#FBBC05'
                    d='M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z'
                  />
                  <path
                    fill='#34A853'
                    d='M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z'
                  />
                  <path fill='none' d='M0 0h48v48H0z' />
                </g>
              </svg>
              <span>Iniciar Sesión Con Google</span>
            </button>
          </div>
        </div>
        <div className='or-line'>
          <hr />
          <span>O</span>
        </div>
        <div className='form-line'>
          <div className='one-line'>
            <div className='label-line'>
              <label htmlFor='email'>Dirección de correo electrónico</label>
            </div>
            <Input
              type='email'
              name='email'
              value={formValues.email}
              maxLength={128}
              placeholder='Introduzca su dirección de correo electrónico'
              required
              onChange={handleChange}
            />
            {errors.email && (
              <span className='error-text' style={{ color: 'red', fontSize: '12px' }}>
                {errors.email}
              </span>
            )}
          </div>
        </div>
        <div className='form-line'>
          <div className='label-line flex flex-v-center flex-space-between'>
            <label htmlFor='password'>Contraseña</label>
            <Link href='/members/forgot' className='blue'>
              ¿Has olvidado tu contraseña?
            </Link>
          </div>
          <Input
            type='password'
            name='password'
            value={formValues.password}
            maxLength={64}
            placeholder='Introduce tu contraseña'
            required
            onChange={handleChange}
          />
          {errors.password && (
            <span className='error-text' style={{ color: 'red', fontSize: '12px' }}>
              {errors.password}
            </span>
          )}
        </div>
        <div className='form-buttons'>
          <Button type='submit' color='blue-filled' text='Iniciar sesión' />
        </div>
      </div>
    </form>
  );
};

export default Form;
