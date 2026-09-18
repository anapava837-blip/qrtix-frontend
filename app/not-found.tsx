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
          <Heading type={1} color='gray' text='404' />
          <p className='gray form-information'>
            La página solicitada no se encuentra en nuestro servidor. Por favor, vuelva a nuestra
            página principal y búsquela de nuevo.
          </p>

          <div className='button-container'>
            <ButtonLink color='blue-filled' text='Volver al inicio' url='' />
          </div>
        </div>
      </div>
    </Section>
  </Master>
);

export default Page;
