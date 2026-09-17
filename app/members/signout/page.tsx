import { type Metadata } from 'next';

// components
import Master from '@components/Layout/Master';
import Section from '@components/Section/Section';
import Heading from '@components/Heading/Heading';
import ButtonLink from '@components/Button/ButtonLink';

const Page: React.FC = () => (
  <Master>
    <Section className='white-background'>
      <div className='container'>
        <div className='center'>
          <Heading type={1} color='gray' text='Cerrado sesión' />
          <p className='gray form-information'>
            Ha cerrado sesión correctamente y puede regresar de forma segura a la página de inicio..
          </p>

          <div className='button-container'>
            <ButtonLink color='gray-overlay' text='volver a casa' url='' />
            &nbsp; &nbsp;
            <ButtonLink color='blue-filled' text='Iniciar sesión nuevamente' url='members/signin' />
          </div>
        </div>
      </div>
    </Section>
  </Master>
);

const title = 'Desconectar';
const canonical = 'https://modern-ticketing.com/members/signout';
const description = 'La venta de entradas moderna es una solución de venta de entradas moderna';

export const metadata: Metadata = {
  title,
  description,
  keywords: 'modern ticketing',
  alternates: { canonical },
  openGraph: {
    title,
    description,
    url: canonical,
    type: 'website',
    siteName: 'Modern Ticketing',
    images: 'https://modern-ticketing.com/logo192.png',
  },
};

export default Page;
