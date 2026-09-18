import { type Metadata } from 'next';

// components
import Master from '@components/Layout/Master';
import Section from '@components/Section/Section';
import Heading from '@components/Heading/Heading';
import EventCard from '@components/Card/EventCard';
import CardGroup from '@components/Card/CardGroup';
import Box from '@components/Box/Box';

// Importar los datos de lugares desde data centralizado
import { venuesData } from '@data/venues';

interface PageProps {
  params: Promise<{
    url: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const venue = venuesData[resolvedParams.url as keyof typeof venuesData];

  if (!venue) {
    return {
      title: 'Lugar no encontrado - QRTixsPro',
      description: 'QRTixsPro - Sistema de venta de boletos para eventos en Colombia',
    };
  }

  return {
    title: `${venue.name} - QRTixsPro`,
    description: venue.description.substring(0, 160),
  };
}

const Page = async ({ params }: PageProps) => {
  const resolvedParams = await params;
  const venueId = resolvedParams.url;
  const venue = venuesData[venueId as keyof typeof venuesData];

  // Si no se encuentra el lugar, mostrar página de error
  if (!venue) {
    return (
      <Master>
        <Section>
          <div className='container'>
            <div className='center'>
              <Heading type={1} color='gray' text='Lugar no encontrado' />
              <p className='gray'>El lugar que estás buscando no existe o ha sido eliminado.</p>
            </div>
          </div>
        </Section>
      </Master>
    );
  }

  return (
    <Master>
      <div className='blur-cover'>
        <div
          style={{
            backgroundImage: `url("${venue.image}")`,
          }}
          className='event-cover cover-image flex flex-v-center flex-h-center'
        />
        <div className='cover-info'>
          <div
            style={{
              backgroundImage: `url("${venue.image}")`,
            }}
            className='cover-image image'
          />
          <Heading type={1} color='white' text={venue.name} />
          <Heading type={6} color='white' text={venue.location} />
        </div>
      </div>
      <Section className='white-background'>
        <div className='container'>
          <div className='venue-details'>
            <Box className='content-box'>
              <Heading type={4} color='gray' text='Detalles Del Lugar' />
              <div className='paragraph-container gray'>
                <p>{venue.description}</p>
              </div>
            </Box>

            <Box className='info-box mt-20'>
              <div className='info-details'>
                <div className='info-item'>
                  <span className='material-symbols-outlined'>people</span>
                  <div>
                    <Heading type={6} color='gray' text='Capacidad' />
                    <p className='gray'>{venue.capacity}</p>
                  </div>
                </div>
                <div className='info-item'>
                  <span className='material-symbols-outlined'>location_on</span>
                  <div>
                    <Heading type={6} color='gray' text='Dirección' />
                    <p className='gray'>{venue.address}</p>
                  </div>
                </div>
                <div className='info-item'>
                  <span className='material-symbols-outlined'>language</span>
                  <div>
                    <Heading type={6} color='gray' text='Sitio Web' />
                    <p className='gray'>{venue.website}</p>
                  </div>
                </div>
              </div>
            </Box>
          </div>
        </div>
      </Section>

      <Section className='white-background'>
        <div className='container'>
          <Heading type={6} color='gray' text='Address' />
          <div className='paragraph-container'>
            <p className='gray'>Lorem ipsum dolor sit amet consecteteur adispicing elit.</p>
          </div>
          <Heading type={6} color='gray' text='How to get there?' />
          <div className='paragraph-container'>
            <p className='gray'>Lorem ipsum dolor sit amet consecteteur adispicing elit.</p>
            <p className='gray'>
              <a target='_blank' href='/' className='blue'>
                Get directions
              </a>
              &nbsp; &bull; &nbsp;
              <a target='_blank' href='/' className='blue'>
                Show in map
              </a>
            </p>
          </div>
          <Heading type={6} color='gray' text='Accesibility information' />
          <div className='paragraph-container'>
            <p className='gray'>Lorem ipsum dolor sit amet consecteteur adispicing elit.</p>
          </div>
        </div>
      </Section>

      <CardGroup url='list' title='Eventos en este Lugar' color='gray' background='gray'>
        <EventCard
          url='1'
          from='20'
          color='orange'
          when='Tue, Sep 21, 2024 19:00'
          name='Event name goes here'
          venue={venue.name}
          image='https://images.unsplash.com/photo-1531058020387-3be344556be6?q=80&w=400&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
        />
        <EventCard
          url='1'
          from='25'
          color='orange'
          when='Wed, Aug 9, 2024 22:00'
          name='Event name goes here'
          venue={venue.name}
          image='https://images.unsplash.com/photo-1472691681358-fdf00a4bfcfe?q=80&w=400&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
        />
        <EventCard
          url='1'
          from='10'
          color='orange'
          when='Sun, Mar 14, 2024 15:00'
          name='Event name goes here'
          venue={venue.name}
          image='https://images.unsplash.com/photo-1561489396-888724a1543d?q=80&w=400&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
        />
        <EventCard
          url='1'
          from='60'
          color='orange'
          when='Mon, Jul 2, 2024 20:00'
          name='Event name goes here'
          venue={venue.name}
          image='https://images.unsplash.com/photo-1505373877841-8d25f7d46678?q=80&w=400&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
        />
        <EventCard
          url='1'
          from='20'
          color='orange'
          when='Tue, Sep 21, 2024 19:00'
          name='Event name goes here'
          venue={venue.name}
          image='https://images.unsplash.com/photo-1531058020387-3be344556be6?q=80&w=400&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
        />
        <EventCard
          url='1'
          from='25'
          color='orange'
          when='Wed, Aug 9, 2024 22:00'
          name='Event name goes here'
          venue={venue.name}
          image='https://images.unsplash.com/photo-1472691681358-fdf00a4bfcfe?q=80&w=400&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
        />
      </CardGroup>
    </Master>
  );
};

export default Page;
