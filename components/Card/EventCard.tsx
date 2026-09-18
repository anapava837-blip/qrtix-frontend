import Link from 'next/link';

// components
import Badge from '@components/Badge/Badge';
import ButtonLink from '@components/Button/ButtonLink';

// interfaces
interface IProps {
  url: string;
  from?: string;
  when: string;
  name: string;
  venue: string;
  image: string;
  color: string;
}

const MONTHS_ES = [
  'ENE',
  'FEB',
  'MAR',
  'ABR',
  'MAY',
  'JUN',
  'JUL',
  'AGO',
  'SEP',
  'OCT',
  'NOV',
  'DIC',
];

const parseDateBadge = (when: string) => {
  try {
    const d = new Date(when);
    if (isNaN(d.getTime())) {
      const parts = String(when)
        .trim()
        .split(/[\s\-/]+/);
      return {
        day: parts[0]?.slice(0, 2) || '?',
        month: (parts[1] || '').slice(0, 3).toUpperCase() || '---',
      };
    }
    return {
      day: String(d.getDate()).padStart(2, '0'),
      month: MONTHS_ES[d.getMonth()] || '---',
    };
  } catch {
    return { day: '?', month: '---' };
  }
};

const EventCard: React.FC<IProps> = ({ url, from, when, name, venue, image, color }) => {
  const dateBadge = parseDateBadge(when);

  return (
    <div className='card'>
      <Link href={`/event/${url}`}>
        <div
          className='card-image'
          style={{
            backgroundImage: `url("${image}")`,
          }}
        >
          <div className='card-date-badge'>
            <span className='day'>{dateBadge.day}</span>
            <span className='month'>{dateBadge.month}</span>
          </div>
          <Badge color={color} text='DISPONIBLE' />
        </div>
        <div className='card-title'>
          <h3>{name}</h3>
        </div>
        <div className='card-info'>
          <p>
            <span className='material-symbols-outlined'>schedule</span> {when}
          </p>
          <p>
            <span className='material-symbols-outlined'>location_on</span> {venue}
          </p>
          {from && (
            <p>
              <span className='material-symbols-outlined'>local_activity</span> Desde{' '}
              <strong>${from}</strong>
            </p>
          )}
        </div>
      </Link>
      <div className='card-buttons'>
        <ButtonLink
          color={`${color}-filled`}
          text='Ver boletos'
          rightIcon='arrow_forward'
          url={`event/${url}`}
        />
      </div>
    </div>
  );
};

export default EventCard;
