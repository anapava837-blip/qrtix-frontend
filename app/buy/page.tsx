import Link from 'next/link';
import { Suspense } from 'react';

import { type Metadata } from 'next';

// components
import Master from '@components/Layout/Master';
import Section from '@components/Section/Section';
import Heading from '@components/Heading/Heading';

import Form from './components/Form';
import EventDetails from './components/EventDetails';

const Page: React.FC = () => (
  <Master>
    <Section className='white-background'>
      <div className='container'>
        <div className='center'>
          <Heading type={1} color='gray' text='Comprar Tickets' />
          <p className='gray'>
            Introduce tus datos personales y de pago. Emitiremos y enviaremos tus entradas a tu
            correo electrónico de inmediato.
          </p>
        </div>
        <div className='padding-top center'>
          <div className='padding-top'>
            <Heading type={5} color='gray' text='Detalles' />
            <Suspense fallback={<div>Cargando detalles del evento...</div>}>
              <EventDetails />
            </Suspense>
          </div>
        </div>
        <div className='form shrink'>
          <table className='table'>
            <thead>
              <tr>
                <th className='left'>Nombre</th>
                <th className='center'>Cantidad.</th>
                <th className='right'>Precio</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className='left'>Niños</td>
                <td className='center'>2</td>
                <td className='right'>$23</td>
              </tr>
              <tr>
                <td className='left'>Adultos</td>
                <td className='center'>2</td>
                <td className='right'>$23</td>
              </tr>
              <tr>
                <td className='right' colSpan={3}>
                  <strong>Total : </strong> $23
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <Form />
        <div className='paragraph-container center'>
          <p>
            Al hacer clic en el botón Realizar pago.
            <Link href='/legal/terms-of-service' className='blue'>
              Terms of service
            </Link>
          </p>
        </div>
      </div>
    </Section>
  </Master>
);

const title = 'Comprar tickets';
const canonical = 'https://modern-ticketing.com/buy';
const description = 'Modern ticketing is a modern ticketing solution';

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
