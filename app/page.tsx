// components
import Master from '@components/Layout/Master';
import Section from '@components/Section/Section';
import Heading from '@components/Heading/Heading';
import EventCard from '@components/Card/EventCard';
import CardGroup from '@components/Card/CardGroup';

// data
import { getAllEvents } from '@data/events';

import FormSearch from './home/components/FormSearch';
import CircleButtons from './home/components/CircleButtons';

const Page: React.FC = () => {
  const events = getAllEvents();

  return (
    <Master>
      <Section className='hero-section'>
        <div className='hero-overlay'>
          <div className='container'>
            <div className='center hero-content'>
              <Heading type={1} color='white' text='QRTIXPRO' />
              <p className='white hero-subtitle'>Más que boletos, momentos inolvidables</p>
              <div className='top-search'>
                <FormSearch />
              </div>
            </div>
          </div>
        </div>
        <div className='circle-buttons'>
          <CircleButtons />
        </div>
      </Section>

      <Section className='white-background'>
        <div className='container'>
          <div className='section-header'>
            <h2 className='section-title blue'>Últimos eventos</h2>
            <a href='/list' className='view-all'>
              Ver todos
            </a>
          </div>
          <div className='horizontal-scroll-container'>
            <div className='horizontal-scroll-wrapper'>
              {events.slice(0, 6).map((event) => (
                <div className='horizontal-card-item' key={event.id}>
                  <EventCard
                    url={event.id}
                    color={event.color}
                    when={event.date}
                    name={event.name}
                    venue={event.venue}
                    image={event.image}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      <Section className='white-background'>
        <div className='container'>
          <div className='section-header'>
            <h2 className='section-title red'>Más eventos</h2>
            <a href='/list' className='view-all'>
              Ver todos
            </a>
          </div>
          <div className='horizontal-scroll-container'>
            <div className='horizontal-scroll-wrapper'>
              {events.slice(0, 8).map((event) => (
                <div className='horizontal-card-item' key={`more-${event.id}`}>
                  <EventCard
                    url={event.id}
                    color='red'
                    when={event.date}
                    name={event.name}
                    venue={event.venue}
                    image={event.image}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      <Section className='gray-background'>
        <div className='container'>
          <div className='section-header'>
            <h2 className='section-title orange'>Elecciones de los Editores</h2>
            <a href='/list' className='view-all'>
              Ver todos
            </a>
          </div>
          <div className='horizontal-scroll-container'>
            <div className='horizontal-scroll-wrapper'>
              {events.slice(0, 8).map((event) => (
                <div className='horizontal-card-item' key={`editor-${event.id}`}>
                  <EventCard
                    url={event.id}
                    color='orange'
                    when={event.date}
                    name={event.name}
                    venue={event.venue}
                    image={event.image}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      <Section className='white-background'>
        <div className='container'>
          <div className='section-header'>
            <h2 className='section-title purple'>Eventos Populares</h2>
            <a href='/list' className='view-all'>
              Ver todos
            </a>
          </div>
          <div className='horizontal-scroll-container'>
            <div className='horizontal-scroll-wrapper'>
              {events.slice(0, 8).map((event) => (
                <div className='horizontal-card-item' key={`popular-${event.id}`}>
                  <EventCard
                    url={event.id}
                    color='purple'
                    when={event.date}
                    name={event.name}
                    venue={event.venue}
                    image={event.image}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>
    </Master>
  );
};

export default Page;
