import { Metadata } from 'next';

// components
import Master from '@components/Layout/Master';
import Section from '@components/Section/Section';
import Heading from '@components/Heading/Heading';
import NewsCard from '@components/Card/NewsCard';

export const metadata: Metadata = {
  title: 'Próximos Eventos en Colombia',
  description: 'QRTixsPro - Sistema de venta de boletos para eventos en Colombia',
  keywords: 'eventos colombia, conciertos, festivales, boletos, entradas',
  alternates: { canonical: 'https://qrtixspro.com/news' },
  openGraph: {
    title: 'Próximos Eventos en Colombia',
    description: 'QRTixsPro - Sistema de venta de boletos para eventos en Colombia',
    url: 'https://qrtixspro.com/news',
    siteName: 'QRTixsPro',
    locale: 'es_CO',
    type: 'website',
  },
};

export default function Page() {
  return (
    <Master>
      <Section className='white-background'>
        <div className='container'>
          <div className='padding-bottom center'>
            <Heading type={1} color='gray' text='Próximos Eventos' />
            <p className='gray'>Eventos y conciertos próximos en Colombia</p>
          </div>
        </div>
      </Section>

      {/* Sección de Festivales */}
      <Section className='list-cards'>
        <div className='container'>
          <div className='section-header'>
            <Heading type={2} color='red' text='Festivales' />
          </div>
          <div
            className='events-row'
            style={{ display: 'flex', overflowX: 'auto', gap: '20px', padding: '10px 0' }}
          >
            <NewsCard
              url='1'
              color='red'
              when='Sáb, Oct 30, 2024 20:00'
              name='Festival Estéreo Picnic 2024'
              image='https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?q=80&w=400&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
            />
            <NewsCard
              url='3'
              color='green'
              when='Dom, Dic 05, 2024 16:00'
              name='Festival Vallenato - Valledupar'
              image='https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=400&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
            />
            <NewsCard
              url='5'
              color='orange'
              when='Vie, Ene 10, 2025 18:00'
              name='Festival de Jazz - Medellín'
              image='https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=400&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
            />
          </div>
        </div>
      </Section>

      {/* Sección de Conciertos */}
      <Section className='list-cards'>
        <div className='container'>
          <div className='section-header'>
            <Heading type={2} color='blue' text='Conciertos' />
          </div>
          <div
            className='events-row'
            style={{ display: 'flex', overflowX: 'auto', gap: '20px', padding: '10px 0' }}
          >
            <NewsCard
              url='2'
              color='blue'
              when='Vie, Nov 15, 2024 19:00'
              name='Concierto Juanes - Bogotá'
              image='https://images.unsplash.com/photo-1501386761578-eac5c94b800a?q=80&w=400&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
            />
            <NewsCard
              url='6'
              color='red'
              when='Sáb, Feb 14, 2025 20:30'
              name='Concierto Shakira - Barranquilla'
              image='https://images.unsplash.com/photo-1531058020387-3be344556be6?q=80&w=400&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
            />
          </div>
        </div>
      </Section>

      {/* Sección de Eventos Especiales */}
      <Section className='list-cards'>
        <div className='container'>
          <div className='section-header'>
            <Heading type={2} color='purple' text='Eventos Especiales' />
          </div>
          <div
            className='events-row'
            style={{ display: 'flex', overflowX: 'auto', gap: '20px', padding: '10px 0' }}
          >
            <NewsCard
              url='4'
              color='purple'
              when='Sáb, Nov 20, 2024 21:00'
              name='Rock al Parque - Bogotá'
              image='https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?q=80&w=400&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
            />
          </div>
        </div>
      </Section>
    </Master>
  );
}
