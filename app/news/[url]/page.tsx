import { type Metadata } from 'next';

// components
import Master from '@components/Layout/Master';
import Section from '@components/Section/Section';
import Heading from '@components/Heading/Heading';
import Box from '@components/Box/Box';
import CardGroup from '@components/Card/CardGroup';
import NewsCard from '@components/Card/NewsCard';
import ButtonLink from '@components/Button/ButtonLink';

// Datos de ejemplo para las noticias
const newsData = {
  '1': {
    title: 'Festival Estéreo Picnic 2024',
    date: 'Sábado, Octubre 30, 2024 20:00',
    image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    content: 'El Festival Estéreo Picnic es uno de los eventos musicales más importantes de Colombia. Con más de una década de trayectoria, este festival multitudinario reúne a artistas nacionales e internacionales de diversos géneros musicales. La edición 2024 promete ser una de las más grandes hasta la fecha, con un cartel estelar que incluye bandas de rock, pop, electrónica y música alternativa. Los asistentes podrán disfrutar de múltiples escenarios, zonas gastronómicas y actividades complementarias durante los días del evento.',
    location: 'Parque Simón Bolívar, Bogotá',
    price: 'Desde $250.000 COP',
    color: 'red'
  },
  '2': {
    title: 'Concierto Juanes - Bogotá',
    date: 'Viernes, Noviembre 15, 2024 19:00',
    image: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    content: 'Juanes regresa a Bogotá con su nueva gira mundial presentando sus éxitos de siempre y las canciones de su más reciente álbum. Una noche llena de rock, pop y folclor colombiano que no te puedes perder.',
    location: 'Movistar Arena, Bogotá',
    price: 'Desde $180.000 COP',
    color: 'blue'
  },
  '3': {
    title: 'Festival Vallenato - Valledupar',
    date: 'Domingo, Diciembre 05, 2024 16:00',
    image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    content: 'El Festival de la Leyenda Vallenata es el evento más importante de la música vallenata en Colombia. Reúne a los mejores acordeoneros del país en una competencia que busca coronar al Rey Vallenato del año.',
    location: 'Parque de la Leyenda Vallenata, Valledupar',
    price: 'Desde $120.000 COP',
    color: 'green'
  },
  '4': {
    title: 'Rock al Parque - Bogotá',
    date: 'Sábado, Noviembre 20, 2024 21:00',
    image: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    content: 'Rock al Parque es el festival gratuito de rock más grande de Latinoamérica. Durante tres días, bandas nacionales e internacionales se presentan en diferentes escenarios del Parque Simón Bolívar.',
    location: 'Parque Simón Bolívar, Bogotá',
    price: 'Entrada Gratuita',
    color: 'purple'
  },
  '5': {
    title: 'Festival de Jazz - Medellín',
    date: 'Viernes, Enero 10, 2025 18:00',
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    content: 'El Festival de Jazz de Medellín reúne a los mejores exponentes del género a nivel nacional e internacional. Una experiencia musical única en uno de los teatros más emblemáticos de la ciudad.',
    location: 'Teatro Metropolitano, Medellín',
    price: 'Desde $150.000 COP',
    color: 'orange'
  },
  '6': {
    title: 'Concierto Shakira - Barranquilla',
    date: 'Sábado, Febrero 14, 2025 20:30',
    image: 'https://images.unsplash.com/photo-1531058020387-3be344556be6?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    content: 'Shakira regresa a su ciudad natal para presentar su nueva gira mundial. Un concierto lleno de energía, baile y los éxitos que han marcado su carrera internacional.',
    location: 'Estadio Metropolitano Roberto Meléndez, Barranquilla',
    price: 'Desde $200.000 COP',
    color: 'red'
  }
};

export const generateMetadata = ({ params }: { params: { url: string } }): Metadata => {
  const event = newsData[params.url as keyof typeof newsData];
  
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
};

const Page = ({ params }: { params: { url: string } }) => {
  const eventId = params.url;
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