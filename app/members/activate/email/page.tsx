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
          <Heading type={1} color='gray' text='Activación por correo electrónico' />
          <p className='gray form-information'>
            Debes activar tu nueva dirección de correo electrónico con el código que te enviamos. Si
            no ves el correo en unos minutos, revisa tu carpeta de correo no deseado o spam. Puedes
            hacerlo más tarde con el enlace de tu correo.
          </p>
        </div>
        <Form />
      </div>
    </Section>
  </Master>
);

const title = 'Activación por correo electrónico';
const canonical = 'https://modern-ticketing.com/members/activate/email';
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
