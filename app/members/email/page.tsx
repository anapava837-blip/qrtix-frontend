import { type Metadata } from 'next';

// components
import Master from '@components/Layout/Master';
import Section from '@components/Section/Section';
import Heading from '@components/Heading/Heading';

import Form from './components/Form';

const Page: React.FC = () => (
  <Master>
    <Section className='white-background'>
      <div className='container'>
        <div className='center'>
          <Heading type={1} color='gray' text='Cambiar correo electrónico' />
          <p className='gray form-information'>
            Introduce tu nueva dirección de correo electrónico. Recibirás un correo de verificación
            con tu código de activación. Tu dirección actual es <strong>diego@gmail.com</strong>
          </p>
        </div>
        <Form />
      </div>
    </Section>
  </Master>
);

const title = 'Change e-mail';
const canonical = 'https://modern-ticketing.com/members/email';
const description = 'La venta de entradas moderna es una solución de venta de entradas moderna';

export const metadata: Metadata = {
  title,
  description,
  keywords: 'modern ticketing',
  alternates: { canonical },
  openGraph: {
    title,
    description,
    url: canonical,
    type: 'website',
    siteName: 'Modern Ticketing',
    images: 'https://modern-ticketing.com/logo192.png',
  },
};

export default Page;
