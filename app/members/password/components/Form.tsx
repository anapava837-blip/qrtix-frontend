'use client';

import { useState } from 'react';

// hooks
import useAlert from '@hooks/useAlert';
import { useFormValidation, commonValidationRules } from '@hooks/useFormValidation';

// components
import Input from '@components/Form/Input';
import Button from '@components/Button/Button';
import Loader from '@components/Loader/Loader';
import ButtonLink from '@components/Button/ButtonLink';

// utils
import Request, { type IRequest, type IResponse } from '@utils/Request';

// interfaces
interface IFormProps {
  password: string;
  newPassword: string;
  newPasswordAgain: string;
}

const Form: React.FC = () => {
  const { showAlert, hideAlert } = useAlert();

  const [loading, setLoading] = useState<boolean>(false);
  const [formValues, setFormValues] = useState<IFormProps>({
    password: '',
    newPassword: '',
    newPasswordAgain: '',
  });

  // Validaciones
  const { errors, validateSingleField, validateForm } = useFormValidation(commonValidationRules.passwordChange);

  /**
   * Handles the change event for input fields in the form.
   *
   * This function is called when the value of an input field in the form changes. It updates the state of the form values with the new value.
   *
   * @param {React.ChangeEvent<HTMLInputElement>} e - The change event.
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
   * Handles the form submission event.
   *
   * This function is called when the form is submitted. It prevents the default form submission behavior,
   * hides any existing alert, sets the loading state to true, sends a POST request to the signin/password endpoint,
   * and handles the response. If the response status is 200, it does nothing. If the status is not 200, it shows an error alert.
   * Finally, it sets the loading state back to false.
   *
   * @param {React.FormEvent<HTMLFormElement>} e - The form submission event.
   * @returns {Promise<any>} A promise that resolves when the request is complete.
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

    // Validar que las contraseñas nuevas coincidan
    if (formValues.newPassword !== formValues.newPasswordAgain) {
      showAlert({ type: 'error', text: 'Las contraseñas nuevas no coinciden' });
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
        <div className='form-line'>
          <div className='label-line'>
            <label htmlFor='password'>Contraseña actual</label>
          </div>
          <Input
            type='password'
            name='password'
            value={formValues.password}
            maxLength={64}
            placeholder='Ingrese su contraseña actual'
            required
            onChange={handleChange}
          />
          {errors.password && <span className='error-text' style={{ color: 'red', fontSize: '12px' }}>{errors.password}</span>}
        </div>
        <div className='form-line'>
          <div className='label-line'>
            <label htmlFor='newPassword'>Nueva contraseña</label>
          </div>
          <Input
            type='password'
            name='newPassword'
            value={formValues.newPassword}
            maxLength={64}
            placeholder='Ingresa tu nueva contraseña'
            required
            onChange={handleChange}
          />
          {errors.newPassword && <span className='error-text' style={{ color: 'red', fontSize: '12px' }}>{errors.newPassword}</span>}
        </div>
        <div className='form-line'>
          <div className='label-line'>
            <label htmlFor='newPasswordAgain'>Confirmar nueva contraseña</label>
          </div>
          <Input
            type='password'
            name='newPasswordAgain'
            value={formValues.newPasswordAgain}
            maxLength={64}
            placeholder='Vuelva a ingresar su nueva contraseña'
            required
            onChange={handleChange}
          />
          {errors.newPasswordAgain && <span className='error-text' style={{ color: 'red', fontSize: '12px' }}>{errors.newPasswordAgain}</span>}
        </div>
        <div className='form-buttons'>
          <ButtonLink color='gray-overlay' text='Volver' url='members/account' />
          &nbsp; &nbsp;
          <Button type='submit' color='blue-filled' text='Entregar' />
        </div>
      </div>
    </form>
  );
};

export default Form;
