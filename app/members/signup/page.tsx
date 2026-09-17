import Link from 'next/link';

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
          <Heading type={1} color='gray' text='Sign up' />
          <p className='gray form-information'>
            Crea una cuenta para personalizar tu experiencia en tu viaje de compra de entradas.{' '}
            <Link href='/members/signin' className='blue'>
              haga clic aquí
            </Link>{' '}
            para iniciar sesión si ya tienes una cuenta.
          </p>
        </div>
        <Form />
      </div>
    </Section>
  </Master>
);

const title = 'Inscribirse';
const canonical = 'https://modern-ticketing.com/members/signup';
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
