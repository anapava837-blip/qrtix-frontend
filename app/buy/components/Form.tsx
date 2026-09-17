'use client';

import { useState } from 'react';

// hooks
import useAlert from '@hooks/useAlert';
import { useFormValidation, commonValidationRules } from '@hooks/useFormValidation';

// components
import Input from '@components/Form/Input';
import Button from '@components/Button/Button';
import Loader from '@components/Loader/Loader';
import Heading from '@components/Heading/Heading';

// utils
import Request, { type IRequest, type IResponse } from '@utils/Request';

// interfaces
interface IFormProps {
  name: string;
  email: string;
  cardCvc: string;
  cardName: string;
  cardNumber: string;
  cardExpiration: string;
}

const Form: React.FC = () => {
  const { showAlert, hideAlert } = useAlert();
  const { errors, validateSingleField, validateForm } = useFormValidation(commonValidationRules.purchase);

  const [loading, setLoading] = useState<boolean>(false);
  const [formValues, setFormValues] = useState<IFormProps>({
    name: '',
    email: '',
    cardCvc: '',
    cardName: '',
    cardNumber: '',
    cardExpiration: '',
  });

  /**
   * Handles changes to form input fields.
   *
   * @param {React.ChangeEvent<HTMLInputElement>} e - The event object from the input change.
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;

    setFormValues({
      ...formValues,
      [name]: value,
    });

    // Validar el campo cuando cambie
    validateSingleField(name, value);
  };

  /**
   * Handles form submission.
   *
   * @param {React.FormEvent<HTMLFormElement>} e - The event object from the form submission.
   * @return {Promise<any>} - The result of the form submission.
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<any> => {
    e.preventDefault();

    hideAlert();

    // Validar formulario antes de enviar
    const isValid = validateForm(formValues);
    if (!isValid) {
      showAlert({ type: 'error', text: 'Por favor, corrige los errores en el formulario' });
      return;
    }

    setLoading(true);

    const parameters: IRequest = {
      url: 'v1/signin/password',
      method: 'POST',
      postData: {
        email: '',
        password: '',
      },
    };

    const req: IResponse = await Request.getResponse(parameters);

    const { status, data } = req;

    if (status === 200) {
      //
    } else {
      showAlert({ type: 'error', text: data.title ?? '' });
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
        <div className='form-line padding-top'>
          <Heading type={5} color='gray' text='
            información del comprador' />
        </div>
        <div className='form-line'>
          <div className='flex flex-v-center flex-space-between'>
            <div className='two-line'>
              <div className='label-line'>
                <label htmlFor='name'>Nombre</label>
              </div>
              <Input
                type='text'
                name='name'
                value={formValues.name}
                maxLength={48}
                placeholder='Introduce tu nombre'
                required
                onChange={handleChange}
              />
              {errors.name && <span className='error-text' style={{ color: 'red', fontSize: '12px' }}>{errors.name}</span>}
            </div>
            <div className='two-line'>
              <div className='label-line'>
                <label htmlFor='email'>Dirección de correo electrónico</label>
              </div>
              <Input
                type='text'
                name='email'
                value={formValues.email}
                maxLength={64}
                placeholder='Introduzca su dirección de correo electrónico'
                required
                onChange={handleChange}
              />
              {errors.email && <span className='error-text' style={{ color: 'red', fontSize: '12px' }}>{errors.email}</span>}
            </div>
          </div>
        </div>
        <div className='form-line padding-top'>
          <Heading type={5} color='gray' text='Detalles de pago' />
        </div>
        <div className='form-line'>
          <div className='flex flex-v-center flex-space-between'>
            <div className='two-line'>
              <div className='label-line'>
                <label htmlFor='cardName'>Nombre de la tarjeta</label>
              </div>
              <Input
                type='text'
                name='cardName'
                value={formValues.cardName}
                maxLength={48}
                placeholder='Introduzca el nombre de la tarjeta'
                required
                onChange={handleChange}
              />
              {errors.cardName && <span className='error-text' style={{ color: 'red', fontSize: '12px' }}>{errors.cardName}</span>}
            </div>
            <div className='two-line'>
              <div className='label-line'>
                <label htmlFor='cardNumber'>Número de tarjeta</label>
              </div>
              <Input
                type='text'
                name='cardNumber'
                value={formValues.cardNumber}
                maxLength={16}
                placeholder='Introduce tu número de tarjeta'
                required
                onChange={handleChange}
              />
              {errors.cardNumber && <span className='error-text' style={{ color: 'red', fontSize: '12px' }}>{errors.cardNumber}</span>}
            </div>
          </div>
        </div>
        <div className='form-line'>
          <div className='flex flex-v-center flex-space-between'>
            <div className='two-line'>
              <div className='label-line'>
                <label htmlFor='cardExpiration'>Fecha de expiración</label>
              </div>
              <Input
                type='text'
                name='cardExpiration'
                value={formValues.cardExpiration}
                maxLength={4}
                placeholder="Ingrese la fecha de vencimiento de su tarjeta"
                required
                onChange={handleChange}
              />
              {errors.cardExpiration && <span className='error-text' style={{ color: 'red', fontSize: '12px' }}>{errors.cardExpiration}</span>}
            </div>
            <div className='two-line'>
              <div className='label-line'>
                <label htmlFor='cardCvc'>Número de seguridad</label>
              </div>
              <Input
                type='text'
                name='cardCvc'
                value={formValues.cardCvc}
                maxLength={3}
                placeholder="Ingrese el número de seguridad de su tarjeta"
                required
                onChange={handleChange}
              />
              {errors.cardCvc && <span className='error-text' style={{ color: 'red', fontSize: '12px' }}>{errors.cardCvc}</span>}
            </div>
          </div>
        </div>
        <div className='form-buttons'>
          <Button type='submit' color='blue-filled' text='Realizar pagos y emitir tickets' />
        </div>
      </div>
    </form>
  );
};

export default Form;
