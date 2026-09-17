import { type Metadata } from 'next';

// components
import Master from '@components/Layout/Master';
import Section from '@components/Section/Section';
import Heading from '@components/Heading/Heading';
import Box from '@components/Box/Box';
import CardGroup from '@components/Card/CardGroup';
import NewsCard from '@components/Card/NewsCard';
import ButtonLink from '@components/Button/ButtonLink';

// data centralizado
import { newsData } from '@data/news';

interface PageProps {
  params: Promise<{
    url: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const event = newsData[resolvedParams.url as keyof typeof newsData];

  if (!event) {
    return {
      title: 'Evento no encontrado',
      description: 'QRTixsPro - Sistema de venta de boletos para eventos en Colombia',
    };
  }

  return {
    title: `${event.title} - QRTixsPro`,
    description: event.content.substring(0, 160),
  };
}

const Page = async ({ params }: PageProps) => {
  const resolvedParams = await params;
  const eventId = resolvedParams.url;
  const event = newsData[eventId as keyof typeof newsData];

  // Si no se encuentra el evento, mostrar página de error
  if (!event) {
    return (
      <Master>
        <Section>
          <div className="container">
            <div className="center">
              <Heading type={1} color="gray" text="Evento no encontrado" />
              <p className="gray">El evento que estás buscando no existe o ha sido eliminado.</p>
              <ButtonLink color="blue" text="Volver a eventos" url="/eventos" />
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
            backgroundImage: `url("${event.image}")`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
          className='event-cover cover-image flex flex-v-center flex-h-center'
        />
        <div className='cover-info'>
          <div
            style={{
              backgroundImage: `url("${event.image}")`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
            className='cover-image image'
          />
          <Heading type={1} color='white' text={event.title} />
          <Heading type={5} color='white' text={event.date} />
          <Heading type={6} color='white' text={event.location} />
        </div>
      </div>

      <Section className='white-background'>
        <div className='container'>
          <div className='event-details'>
            <div className='row'>
              <div className='col-md-8'>
                <Box className="content-box">
                  <Heading type={4} color='gray' text='Detalles del Evento' />
                  <div className='paragraph-container gray'>
                    <p style={{ whiteSpace: 'pre-line', lineHeight: '1.6', fontSize: '16px' }}>
                      {event.content}
                    </p>
                  </div>
                </Box>

                <Box className="info-box mt-20">
                  <div className='info-details'>
                    <div className='info-item'>
                      <span className="material-symbols-outlined">calendar_month</span>
                      <div>
                        <Heading type={6} color='gray' text='Fecha y Hora' />
                        <p className='gray'>{event.date}</p>
                      </div>
                    </div>
                    <div className='info-item'>
                      <span className="material-symbols-outlined">location_on</span>
                      <div>
                        <Heading type={6} color='gray' text='Ubicación' />
                        <p className='gray'>{event.location}</p>
                      </div>
                    </div>
                    <div className='info-item'>
                      <span className="material-symbols-outlined">payments</span>
                      <div>
                        <Heading type={6} color='gray' text='Precio' />
                        <p className='gray'>{event.price}</p>
                      </div>
                    </div>
                  </div>
                </Box>

                <div className='buttons-container' style={{ marginTop: '30px' }}>
                  <ButtonLink color="gray-overlay" text="Volver a eventos" url="/news" />
                </div>
              </div>

              <div className='col-md-4'>
                <Box className="ticket-box">
                  <Heading type={4} color='gray' text='Más Información' />
                  <p className="gray">Para más información sobre este evento, contáctanos a través de nuestra página de contacto.</p>
                  <div className="mt-20">
                    <ButtonLink color="blue" text="Contactar" url="/contact" />
                  </div>
                </Box>
              </div>
            </div>
          </div>
        </div>
      </Section>

      <CardGroup
        title="Eventos relacionados"
        color={event.color}
        gridClassName="events-grid"
      >
        {Object.entries(newsData)
          .filter(([id]) => id !== eventId)
          .slice(0, 3)
          .map(([id, relatedEvent]) => (
            <NewsCard
              key={id}
              url={id}
              color={relatedEvent.color}
              when={relatedEvent.date}
              name={relatedEvent.title}
              image={relatedEvent.image}
            />
          ))
        }
      </CardGroup>
    </Master>
  );
};

export default Page;
