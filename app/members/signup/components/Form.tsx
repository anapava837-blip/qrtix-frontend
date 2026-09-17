'use client';

import { useState, useRef, useEffect } from 'react';

import Link from 'next/link';

// hooks
import useAlert from '@hooks/useAlert';
import { useFormValidation, commonValidationRules } from '@hooks/useFormValidation';

// components
import Input from '@components/Form/Input';
import Switch from '@components/Form/Switch';
import Button from '@components/Button/Button';
import Loader from '@components/Loader/Loader';
import CapturedPhoto from '@components/Profile/CapturedPhoto';

// utils
import Request, { type IRequest, type IResponse } from '@utils/Request';

// interfaces
interface IFormProps {
  tos: boolean;
  name: string;
  email: string;
  lastname: string;
  password: string;
  cedula: string;
  telefono: string;
}

const Form: React.FC = () => {
  const { showAlert, hideAlert } = useAlert();

  const [loading, setLoading] = useState<boolean>(false);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [photoDataUrl, setPhotoDataUrl] = useState<string>('');
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Validaciones
  const { errors, validateForm, validateSingleField, clearFieldError } = useFormValidation({
    ...commonValidationRules.signup,
    tos: {
      custom: (value: string) => {
        // Para el checkbox, verificamos si está marcado
        return formValues.tos ? null : 'Debe aceptar los términos y condiciones';
      },
    },
  });

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  /**
   * Activa la cámara del dispositivo.
   */
  const startCamera = async (): Promise<void> => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Tu navegador no permite acceso a la cámara o no estás en HTTPS.');
      }
      // Solicitar cámara con mayor resolución para mejor detección facial
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user', // Cámara frontal
        },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : '';
      let userMsg = '⚠️ No se pudo activar la cámara.\n';
      if (msg.toLowerCase().includes('permission') || msg.toLowerCase().includes('denied')) {
        userMsg += '📌 Haz CLICK en el 🔒 CANDELADO (arriba-izq antes de la URL) → Permitir CÁMARA → Actualiza la página (F5).';
      } else if (msg.toLowerCase().includes('not found') || msg.toLowerCase().includes('device')) {
        userMsg += '📌 Tu dispositivo no tiene cámara o está siendo usada por otra app (Zoom, Meet).';
      } else {
        userMsg += '📌 Usa el candado 🔒 arriba-izq para PERMITIR la CÁMARA, luego actualiza (F5).\nSi no puedes usar la cámara: puedes REGISTRARTE sin foto (luego la subes/activas en tu perfil).';
      }
      showAlert({ type: 'error', text: userMsg });
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
    // Usar resolución más alta para mejor detección
    canvas.width = video.videoWidth || 800;
    canvas.height = video.videoHeight || 600;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Mejorar la calidad de la imagen
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      // Usar JPEG con alta calidad para mejor compresión y detección
      const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
      setPhotoDataUrl(dataUrl);
    }
  };

  const [formValues, setFormValues] = useState<IFormProps>({
    name: '',
    email: '',
    lastname: '',
    password: '',
    cedula: '',
    telefono: '',
    tos: false,
  });

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

    // Validar el campo cuando el usuario escribe
    if (value.trim() !== '') {
      validateSingleField(name, value, { ...formValues, [name]: value });
    } else {
      clearFieldError(name);
    }
  };

  /**
   * Handles the change event for checkbox fields in the form.
   *
   * This function is called when the value of a checkbox field in the form changes. It updates the state of the form values with the new value.
   *
   * @param {React.ChangeEvent<HTMLInputElement>} e - The change event.
   */
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, checked } = e.target;

    setFormValues({
      ...formValues,
      [name]: checked,
    });

    // Validar el checkbox
    if (name === 'tos') {
      if (checked) {
        clearFieldError('tos');
      }
    }
  };

  /**
   * Handles the form submission event.
   *
   * This function is called when the form is submitted. It prevents the default form submission behavior,
   * hides any existing alert, sets the loading state to true, sends a POST request to the signin/password endpoint,
   * and handles the response. If the response status is 200, it redirects the user to the account activation page.
   * If the status is not 200, it shows an error alert. Finally, it sets the loading state back to false.
   *
   * @param {React.FormEvent<HTMLFormElement>} e - The form submission event.
   * @returns {Promise<any>} A promise that resolves when the request is complete.
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<any> => {
    e.preventDefault();

    hideAlert();

    // Validar el formulario antes de enviar
    const isValid = validateForm(formValues);

    // La foto AHORA ES OPCIONAL (no bloquea el registro)
    if (photoDataUrl === '') {
      showAlert({ type: 'warning', text: '💡 Registrándote SIN reconocimiento facial. (Recomendamos activar la cámara con el 🔒 candado arriba para mayor seguridad).' });
    }

    if (!isValid) {
      showAlert({ type: 'error', text: 'Por favor, corrija los errores en el formulario' });
      return;
    }

    setLoading(true);

    const parameters: IRequest = {
      url: 'v1/signin/password',
      method: 'POST',
      postData: {
        name: formValues.name,
        lastname: formValues.lastname,
        cedula: formValues.cedula,
        telefono: formValues.telefono,
        email: formValues.email,
        password: formValues.password,
        photo: photoDataUrl !== '' ? photoDataUrl : null,
        tos: formValues.tos,
      },
    };

    const req: IResponse = await Request.getResponse(parameters);

    const { status, data } = req;

    if (status === 200) {
      window.location.href = '/members/activate/account';
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
              <span>Regístrate con Google</span>
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
            {errors.name && (
              <span className='error-text' style={{ color: 'red', fontSize: '12px' }}>
                {errors.name}
              </span>
            )}
          </div>
        </div>
        <div className='form-line'>
          <div className='one-line'>
            <div className='label-line'>
              <label htmlFor='lastname'>Apellido</label>
            </div>
            <Input
              type='text'
              name='lastname'
              value={formValues.lastname}
              maxLength={48}
              placeholder='Introduce tu apellido'
              required
              onChange={handleChange}
            />
            {errors.lastname && (
              <span className='error-text' style={{ color: 'red', fontSize: '12px' }}>
                {errors.lastname}
              </span>
            )}
          </div>
        </div>
        <div className='form-line'>
          <div className='one-line'>
            <div className='label-line'>
              <label htmlFor='cedula'>Cédula</label>
            </div>
            <Input
              type='text'
              name='cedula'
              value={formValues.cedula}
              maxLength={20}
              placeholder='Introduce tu cédula'
              required
              onChange={handleChange}
            />
            {errors.cedula && (
              <span className='error-text' style={{ color: 'red', fontSize: '12px' }}>
                {errors.cedula}
              </span>
            )}
          </div>
        </div>
        <div className='form-line'>
          <div className='one-line'>
            <div className='label-line'>
              <label htmlFor='telefono'>Teléfono</label>
            </div>
            <Input
              type='tel'
              name='telefono'
              value={formValues.telefono}
              maxLength={20}
              placeholder='Introduce tu teléfono'
              required
              onChange={handleChange}
            />
            {errors.telefono && (
              <span className='error-text' style={{ color: 'red', fontSize: '12px' }}>
                {errors.telefono}
              </span>
            )}
          </div>
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
          <div className='label-line'>
            <label htmlFor='password'>Contraseña</label>
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
        <div className='form-line'>
          <div className='label-line'>
            <label htmlFor='tos'>Acuerdos</label>
          </div>
          <Switch name='tos' color='blue' onChange={handleCheckboxChange}>
            Estoy de acuerdo con el{' '}
            <Link href='/legal/privacy-policy' className='blue'>
              Política de privacidad
            </Link>{' '}
            y{' '}
            <Link href='/legal/terms-of-service' className='blue'>
              TOS
            </Link>
          </Switch>
          {errors.tos && (
            <span className='error-text' style={{ color: 'red', fontSize: '12px' }}>
              {errors.tos}
            </span>
          )}
        </div>

        {/* Sección de Cámara */}
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
            <button type='button' className='button gray-overlay' onClick={startCamera}>
              Activar cámara
            </button>
            <button type='button' className='button blue-filled' onClick={takePhoto}>
              Tomar foto
            </button>
          </div>
          {photoDataUrl !== '' && (
            <CapturedPhoto image={photoDataUrl} size='large' alt='Foto para verificación' />
          )}
        </div>

        <div className='form-buttons'>
          <Button type='submit' color='blue-filled' text='Inscribirse' />
        </div>
      </div>
    </form>
  );
};

export default Form;
