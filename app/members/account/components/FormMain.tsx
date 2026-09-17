'use client';

import { useState } from 'react';

import Link from 'next/link';

// hooks
import useAlert from '@hooks/useAlert';
import useUser from '@hooks/useUser';
import { useFormValidation, commonValidationRules } from '@hooks/useFormValidation';

// components
import Input from '@components/Form/Input';
import Button from '@components/Button/Button';
import Loader from '@components/Loader/Loader';
import ButtonLink from '@components/Button/ButtonLink';
import ProfilePhoto from '@components/Profile/ProfilePhoto';

// utils
import Request, { type IRequest, type IResponse } from '@utils/Request';

// interfaces
interface IProps {
  data?: {
    name: string;
    email: string;
    lastname: string;
    cedula: string;
    telefono: string;
  };
}

interface IFormProps {
  name: string;
  email: string;
  lastname: string;
  cedula: string;
  telefono: string;
  password: string;
}

const FormMain: React.FC<IProps> = ({ data }) => {
  const { showAlert, hideAlert } = useAlert();
  const { user } = useUser();

  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [formValues, setFormValues] = useState<IFormProps>({
    name: data?.name || user?.name || '',
    email: data?.email || user?.email || '',
    lastname: data?.lastname || user?.lastname || '',
    cedula: data?.cedula || user?.cedula || '',
    telefono: data?.telefono || user?.telefono || '',
    password: '', // Campo password inicializado vacío
  });

  // Validaciones
  const { errors, validateSingleField, validateForm } = useFormValidation(commonValidationRules.account);

  /**
   * Handles the change event for input fields in the form.
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

  const buscarDatos = async () => {
    console.log('🔍 Iniciando búsqueda con cédula:', formValues.cedula);
    
    if (!formValues.cedula) {
      alert('Por favor ingresa una cédula para buscar');
      return;
    }

    try {
      const url = `http://localhost:8001/v1/user/search/${formValues.cedula}`;
      console.log('📡 Haciendo fetch a:', url);
      
      const response = await fetch(url);
      console.log('📥 Respuesta recibida:', response.status, response.statusText);
      
      if (response.ok) {
        const userData = await response.json();
        console.log('✅ Datos del usuario:', userData);
        
        setFormValues({
          cedula: userData.cedula || '',
          name: userData.name || '',
          lastname: userData.lastname || '',
          telefono: userData.telefono || '',
          email: userData.email || '',
          password: userData.password || '' // Ahora mostrar la contraseña encontrada
        });
        alert('Datos encontrados y cargados exitosamente');
      } else if (response.status === 404) {
        console.log('❌ Usuario no encontrado');
        alert('Usuario no encontrado con esa cédula');
      } else {
        console.log('❌ Error del servidor:', response.status);
        alert('Error al buscar los datos del usuario');
      }
    } catch (error) {
      console.error('❌ Error de conexión:', error);
      alert('Error de conexión al buscar los datos');
    }
  };

  const borrarDatos = async () => {
    if (!formValues.cedula) {
      alert('Por favor ingresa una cédula para eliminar');
      return;
    }

    if (!confirm('¿Estás seguro de que quieres eliminar este usuario? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:8001/v1/user/delete/${formValues.cedula}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setFormValues({
          cedula: '',
          name: '',
          lastname: '',
          telefono: '',
          email: '',
          password: '', // Campo password incluido
        });
        alert('Usuario eliminado exitosamente');
      } else if (response.status === 404) {
        alert('Usuario no encontrado con esa cédula');
      } else {
        alert('Error al eliminar el usuario');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error de conexión al eliminar el usuario');
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validar formulario antes de enviar
    const isValid = validateForm(formValues);
    if (!isValid) {
      showAlert({ type: 'error', text: 'Por favor, corrige los errores en el formulario' });
      return;
    }

    if (!formValues.cedula) {
      alert('Por favor ingresa una cédula');
      return;
    }

    try {
      const postData = {
        cedula: formValues.cedula,
        name: formValues.name,
        lastname: formValues.lastname,
        email: formValues.email,
        telefono: formValues.telefono
      };

      const response = await fetch('http://localhost:8001/v1/user/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      });

      if (response.ok) {
        alert('Datos actualizados exitosamente');
      } else if (response.status === 404) {
        alert('Usuario no encontrado con esa cédula');
      } else {
        alert('Error al actualizar los datos del usuario');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error de conexión al actualizar los datos');
    }
  };

  if (loading) {
    return <Loader type='inline' color='gray' text='Espera un segundo' />;
  }

  return (
    <div>
      {/* Sección de imagen del usuario */}
      <div className='form-elements' style={{ marginBottom: '2rem' }}>
        <div className='center'>
          <ProfilePhoto 
            image={user?.photo || 'https://www.cenksari.com/content/profile.jpg'} 
            size='large' 
            alt={`Foto de ${user?.name || 'Usuario'}`} 
          />
          <h3 style={{ marginTop: '1rem', color: '#666' }}>
            {user?.name} {user?.lastname}
          </h3>
        </div>
      </div>

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
              <div className='label-line'>
                <label htmlFor='cedula'>Cédula</label>
              </div>
              <Input
                type='text'
                name='cedula'
                value={formValues.cedula}
                maxLength={20}
                placeholder='Introduce la cédula para buscar'
                required
                onChange={handleChange}
              />
              {errors.cedula && <span className='error-text' style={{ color: 'red', fontSize: '12px' }}>{errors.cedula}</span>}
            </div>
          </div>
          <div className='form-buttons' style={{ marginBottom: '2rem' }}>
            <Button 
              type='button' 
              color='blue-filled' 
              text='Buscar Datos' 
              onClick={buscarDatos}
            />
            &nbsp; &nbsp;
            <Button 
              type='button' 
              color='red-filled' 
              text='Borrar Datos' 
              onClick={borrarDatos}
            />
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
                maxLength={64}
                placeholder='Introduce tu nombre'
                required
                onChange={handleChange}
              />
              {errors.name && <span className='error-text' style={{ color: 'red', fontSize: '12px' }}>{errors.name}</span>}
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
                maxLength={64}
                placeholder='Introduce tu apellido'
                required
                onChange={handleChange}
              />
              {errors.lastname && <span className='error-text' style={{ color: 'red', fontSize: '12px' }}>{errors.lastname}</span>}
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
              {errors.telefono && <span className='error-text' style={{ color: 'red', fontSize: '12px' }}>{errors.telefono}</span>}
            </div>
          </div>
          <div className='form-line'>
            <div className='one-line'>
              <div className='label-line flex flex-v-center flex-space-between'>
                <label htmlFor='email'>Dirección de correo electrónico</label>
                <Link href='/members/email' className='blue'>
                  Cambiar correo electrónico
                </Link>
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
              <Link href='/members/password' className='blue'>
                Cambiar la contraseña
              </Link>
            </div>
            <div style={{ position: 'relative' }}>
              <Input
                type={showPassword ? 'text' : 'password'}
                name='password'
                value={formValues.password}
                maxLength={64}
                placeholder='Introduce tu contraseña'
                required
                onChange={handleChange}
              />
              <button
                type='button'
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '18px',
                  color: '#666'
                }}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>
          <div className='form-buttons'>
            <ButtonLink color='gray-overlay' text='Desconectar' url='members/signout' />
            &nbsp; &nbsp;
            <Button type='submit' color='blue-filled' text='Actualizar Datos' />
          </div>
        </div>
      </form>
    </div>
  );
};

export default FormMain;
