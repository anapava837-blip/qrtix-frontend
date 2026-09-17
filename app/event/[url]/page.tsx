import Link from 'next/link';
import { notFound } from 'next/navigation';

import { type Metadata } from 'next';

// components
import Master from '@components/Layout/Master';
import Section from '@components/Section/Section';
import Heading from '@components/Heading/Heading';

// data
import { getEventById } from '@data/events';

import TicketForm from './components/TicketForm';
import SeatSelectorWrapper from './components/SeatSelectorWrapper';

interface PageProps {
  params: Promise<{
    url: string;
  }>;
}

const Page: React.FC<PageProps> = async ({ params }) => {
  const resolvedParams = await params;
  const event = getEventById(resolvedParams.url);
  
  if (!event) {
    notFound();
  }

  return (
  <Master>
      <div className='blur-cover'>
        <div
          style={{
            backgroundImage: `url("${event.image}")`,
          }}
          className='event-cover cover-image flex flex-v-center flex-h-center'
        />
        <div className='cover-info'>
          <div
            style={{
              backgroundImage: `url("${event.image}")`,
            }}
            className='cover-image image'
          />
          <Heading type={1} color='white' text={event.name} />
          <Heading type={5} color='white' text={event.date} />
          <Heading type={6} color='white' text={event.venue} />
        </div>
      </div>
    <Section className='white-background'>
      <div className='container'>
        <div className='event-details'>
          <div>
            <Heading type={4} color='gray' text='Detalles de Eventos' />
            <div className='paragraph-container gray'>
              <p style={{ whiteSpace: 'pre-line' }}>
                {event.description}
              </p>
            </div>
          </div>

        </div>
      </div>
    </Section>
    
    <Section className='white-background'>
      <div className='container'>
        <Heading type={4} color='gray' text='Selecciona tus asientos' />
        <SeatSelectorWrapper event={event} />
      </div>
    </Section>

    <Section className='white-background'>
      <div className='container'>
        <Heading type={4} color='gray' text={event.venueDetails.name} />

        <Heading type={6} color='gray' text='Correo Electronico' />
        <div className='paragraph-container'>
          <p className='gray'>{event.venueDetails.email}</p>
        </div>
        <Heading type={6} color='gray' text='Como llegar?' />
        <div className='paragraph-container'>
          <p className="gray">
           <a 
              href={event.venueDetails.mapLink} 
              target="_blank" 
              rel="noopener noreferrer"
              >
                {event.venueDetails.mapLink}
             </a>
           </p>
          <p className='gray'>
            <Link href='/venue/1' className='blue'>
              Detalles del lugar
            </Link>
            &nbsp; &bull; &nbsp;
            <a target='_blank' href='/' className='blue'>
              Obtener direcciones
            </a>
            &nbsp; &bull; &nbsp;
            <a target='_blank' href='/' className='blue'>
              Mostrar en el mapa
            </a>
          </p>
        </div>
      </div>
    </Section>


    </Master>
  );
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const event = getEventById(resolvedParams.url);
  
  if (!event) {
    return {
      title: 'Evento no encontrado',
      description: 'El evento solicitado no existe',
    };
  }

  const title = event.name;
  const canonical = `https://modern-ticketing.com/event/${event.id}`;
  const description = event.description.substring(0, 160) + '...';

  return {
    title,
    description,
    keywords: 'modern ticketing, eventos, ' + event.name,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      type: 'website',
      siteName: 'Modern Ticketing',
      images: event.image,
    },
  };
}

export default Page;
