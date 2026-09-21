import type { Metadata } from 'next';
import { Suspense } from 'react';

import Loader from '@components/Loader/Loader';
import ListClient from './components/ListClient';

const title = 'Eventos - QRTIXPRO';
const canonical = 'https://modern-ticketing.com/list';
const description = 'Descubre, busca y filtra los mejores eventos de Colombia con QRTIXPRO';

export const metadata: Metadata = {
  title,
  description,
  keywords: 'eventos, conciertos, boletas, entradas, colombia',
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

const Page: React.FC = () => (
  <Suspense fallback={<Loader type='inline' color='gray' text='Cargando eventos...' />}>
    <ListClient />
  </Suspense>
);

export default Page;
