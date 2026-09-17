import { type Metadata } from 'next';

// components
import Master from '@components/Layout/Master';
import Section from '@components/Section/Section';
import Heading from '@components/Heading/Heading';
import VenueCard from '@components/Card/VenueCard';
import CardGroup from '@components/Card/CardGroup';
import Box from '@components/Box/Box';

import FormSearch from './components/FormSearch';
import { venuesData } from '@data/venues';

export const metadata: Metadata = {
  title: 'Lugares para Eventos - QRTixsPro',
  description: 'Descubre los mejores lugares para eventos en Colombia',
};

const Page: React.FC = () => (
  <Master>
    <Section className='hero-section'>
      <div className='hero-overlay'>
        <div className='container'>
          <div className='center hero-content'>
            <Heading type={1} color='white' text='Lugares para Eventos' />
            <p className='white hero-subtitle'>Descubre los mejores escenarios de Colombia</p>
            <div className='top-search'>
              <FormSearch />
            </div>
          </div>
        </div>
      </div>
    </Section>

    <Section className='white-background'>
      <div className='container'>
        <Heading type={2} color='gray' text='Lugares para Eventos en Colombia' />
        <div className='card-grid'>
          {Object.entries(venuesData).map(([id, venue]) => (
            <VenueCard
              key={id}
              url={id}
              color='gray'
              name={venue.name}
              location={venue.location}
              image={venue.image}
            />
          ))}
        </div>
      </div>
    </Section>
  </Master>
);
