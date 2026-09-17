'use client';

import { useState, useRef, useEffect } from 'react';

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
import CapturedPhoto from '@components/Profile/CapturedPhoto';

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
  const [photoDataUrl, setPhotoDataUrl] = useState<string>('');
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Validaciones
  const { errors, validateSingleField, validateForm } = useFormValidation(commonValidationRules.signin);

  /**
   * Activa la cámara del dispositivo.
   */
  const startCamera = async (): Promise<void> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (err) {
      showAlert({ type: 'error', text: 'No se pudo activar la cámara' });
    }
  };

  /**
   * Captura una foto desde el stream de video.
   */
  const takePhoto = (): void => {
    const video = videoRef.current;
    if (!video) {
      showAlert({ type: 'error', text: 'Cámara no disponible' });
      return;
    }
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/png');
      setPhotoDataUrl(dataUrl);
    }
  };

  /**
   * Limpia el stream al desmontar.
   */
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    };
  }, []);

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
   * hides any existing alert, sets the loading state to true, sends a POST request to the signin/login endpoint,
   * and handles the response. If the response status is 200, it shows a success message. If the status is not 200, it shows an error alert.
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

    if (photoDataUrl === '') {
      showAlert({ type: 'error', text: 'Por favor, toma una foto para validar' });
      return;
    }

    setLoading(true);

    const parameters: IRequest = {
      url: 'v1/signin/login',
      method: 'POST',
      postData: {
        email: formValues.email,
        password: formValues.password,
        photo: photoDataUrl,
      },
    };

    const req: IResponse = await Request.getResponse(parameters);

    const { status, data } = req;

    if (status === 200) {
      // Crear objeto de usuario con los datos del login exitoso
      const userData = {
        id: data.results?.userId || 'temp-id',
        name: data.results?.name || 'Usuario',
        lastname: data.results?.lastname || '',
        email: formValues.email,
        photo: photoDataUrl,
        cedula: data.results?.cedula || '',
        telefono: data.results?.telefono || '',
      };

      // Guardar datos del usuario en el contexto
      login(userData);

      showAlert({ type: 'success', text: 'Inicio de sesión exitoso' });
      
      // Redirigir a la página principal después de un breve delay
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
            {errors.email && <span className='error-text' style={{ color: 'red', fontSize: '12px' }}>{errors.email}</span>}
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
          {errors.password && <span className='error-text' style={{ color: 'red', fontSize: '12px' }}>{errors.password}</span>}
        </div>
        <div className='form-line'>
          <div className='label-line'>
            <label htmlFor='photo'>Foto</label>
          </div>
          <div className='upload-picture'>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              style={{ width: '100%', display: 'block', borderRadius: '8px' }}
            />
          </div>
          <div className='one-line'>
            <button type='button' className='button gray-overlay' onClick={startCamera}>Activar cámara</button>
            <button type='button' className='button blue-filled' onClick={takePhoto}>Tomar foto</button>
          </div>
          {photoDataUrl !== '' && (
            <CapturedPhoto image={photoDataUrl} size='large' alt='Foto para verificación' />
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
