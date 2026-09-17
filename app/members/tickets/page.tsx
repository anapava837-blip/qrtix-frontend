import Link from 'next/link';

import { type Metadata } from 'next';

// components
import Master from '@components/Layout/Master';
import Section from '@components/Section/Section';
import Heading from '@components/Heading/Heading';
import ButtonGroup from '@components/Button/ButtonGroup';
import ButtonGroupItem from '@components/Button/ButtonGroupItem';

const Page: React.FC = () => (
  <Master>
    <Section className='white-background'>
      <div className='container'>
        <div className='center'>
          <Heading type={1} color='gray' text='Mis Tickets' />
          <p className='gray form-information'>
            Puedes acceder a las entradas que compraste desde esta página en cualquier momento. Puedes descargarlas o enviarlas. Nota: En esta página no podrás ver las entradas de eventos que ya hayan finalizado o cancelado.
          </p>
          <div className='button-container'>
            <ButtonGroup color='gray'>
              <ButtonGroupItem url='members/tickets' text='Mis Tickets' active />
              <ButtonGroupItem url='members/account' text='Mi cuenta' />
            </ButtonGroup>
          </div>
        </div>
      </div>
    </Section>
    <Section className='white-background'>
      <div className='container'>
        <div className='ticket-item'>
          <div className='item-right'>
            <h2>21</h2>
            <p>Septiembre</p>
            <span className='material-symbols-outlined'>código qr_2</span>
            <strong>21EX9P</strong>
            <span className='up-border'></span>
            <span className='down-border'></span>
          </div>
          <div className='item-left'>
            <h5>Evento de ejemplo</h5>
            <p>
              <span className='material-symbols-outlined'>Evento</span>
              Fecha del evento
            </p>
            <p>
              <span className='material-symbols-outlined'>Departamento</span>
              Lugar del evento
            </p>
            <div className='actions'>
              <Link href='/members/tickets' title='Descargar Tickets'>
                <span className='material-symbols-outlined'>Descargar</span>
              </Link>
              <Link href='/members/tickets' title='enviar Tickets'>
                <span className='material-symbols-outlined'>reenviar a la bandeja de entrada</span>
              </Link>
            </div>
          </div>
        </div>

        <div className='ticket-item'>
          <div className='item-right'>
            <h2>21</h2>
            <p>Septiembre</p>
            <span className='material-symbols-outlined'>código qr_2</span>
            <strong>21EX9P</strong>
            <span className='up-border'></span>
            <span className='down-border'></span>
          </div>
          <div className='item-left'>
            <h5>Event name goes here</h5>
            <p>
              <span className='material-symbols-outlined'>Evento</span>
              Viernes, Sep 21, 2025 19:00
            </p>
            <p>
              <span className='material-symbols-outlined'>Departamento</span>
              Royal Albert Hall
            </p>
            <div className='actions'>
              <Link href='/members/tickets' title='Descargar tickets'>
                <span className='material-symbols-outlined'>Descargar</span>
              </Link>
              <Link href='/members/tickets' title='Enviar Tickets'>
                <span className='material-symbols-outlined'>reenviar a la bandeja de entrada</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Section>
  </Master>
);

const title = 'Mis Tickets';
const canonical = 'https://modern-ticketing.com/members/tickets';
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
