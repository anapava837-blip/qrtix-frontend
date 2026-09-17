import { type Metadata } from 'next';

// components
import Master from '@components/Layout/Master';
import Section from '@components/Section/Section';
import Heading from '@components/Heading/Heading';
import EventCard from '@components/Card/EventCard';

// data
import { getAllEvents } from '@data/events';

const Page: React.FC = () => {
  const events = getAllEvents();
  
  return (
    <Master>
      <Section className='white-background'>
        <div className='container'>
          <div className='padding-bottom center'>
            <Heading type={1} color='gray' text='Eventos' />
            <p className='gray'>Descubre, busca y filtra los mejores eventos de Colombia.</p>
          </div>
        </div>
      </Section>

      <Section className='list-cards'>
        <div className='container center'>
          {events.map((event) => (
            <EventCard
              key={event.id}
              url={event.id}
              from={event.priceFrom}
              color={event.color}
              when={event.date}
              name={event.name}
              venue={event.venue}
              image={event.image}
            />
          ))}
        </div>
      </Section>
    </Master>
  );
};

const title = 'Eventos en Colombia | QRTixsPro';
const canonical = 'https://qrtixspro.com/list';
const description = 'Descubre los mejores eventos en Colombia con QRTixsPro';

export const metadata: Metadata = {
  title,
  description,
  keywords: 'eventos Colombia, conciertos, festivales, entradas, QRTixsPro',
  alternates: { canonical },
  openGraph: {
    title,
    description,
    url: canonical,
    type: 'website',
    siteName: 'QRTixsPro',
    images: 'https://qrtixspro.com/logo192.png',
  },
};

export default Page;
