'use client';

import { useSearchParams } from 'next/navigation';
import { getAllEvents } from '@data/events';

const EventDetails: React.FC = () => {
  const searchParams = useSearchParams();
  const eventId = searchParams.get('eventId');

  const events = getAllEvents();
  const event = events.find((e) => e.id === eventId);

  if (!event) {
    return (
      <div>
        <p>
          <strong>Evento</strong> No especificado
        </p>
        <p>
          <strong>Lugar</strong> No especificado
        </p>
        <p>
          <strong>Fecha</strong> No especificada
        </p>
      </div>
    );
  }

  return (
    <div>
      <p>
        <strong>Evento</strong> {event.name}
      </p>
      <p>
        <strong>Lugar</strong> {event.venue}
      </p>
      <p>
        <strong>Fecha</strong> {event.date}
      </p>
    </div>
  );
};

export default EventDetails;
