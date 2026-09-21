import type { Metadata } from 'next';

import TicketsClient from './components/TicketsClient';

const title = 'Mis Tickets - QRTIXPRO';
const canonical = 'https://modern-ticketing.com/members/tickets';
const description = 'Accede a tus boletas y entradas compradas en QRTIXPRO. Descarga tus entradas en PDF.';

export const metadata: Metadata = {
  title,
  description,
  keywords: 'mis tickets, boletas, entradas, descargar pdf, qrtixpro',
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

const Page: React.FC = () => <TicketsClient />;

export default Page;
