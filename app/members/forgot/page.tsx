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
          <Heading type={1} color='gray' text='Has olvidado tu contraseña' />
          <p className='gray form-information'>
           Introduce tu dirección de correo electrónico registrada. Las instrucciones para restablecer tu contraseña se habrán enviado a tu correo electrónico. Si no lo ves en unos minutos, revisa tu carpeta de correo no deseado o spam.
          </p>
        </div>
        <Form />
      </div>
    </Section>
  </Master>
);

const title = 'Has olvidado tu contraseña';
const canonical = 'https://modern-ticketing.com/members/forgot';
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
