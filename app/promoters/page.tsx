import { type Metadata } from 'next';

// components
import Box from '@components/Box/Box';
import Master from '@components/Layout/Master';
import Slider from '@components/Slider/Slider';
import Section from '@components/Section/Section';
import Heading from '@components/Heading/Heading';
import ButtonLink from '@components/Button/ButtonLink';

const Page: React.FC = () => (
  <Master>
    <Section className='white-background'>
      <div className='container'>
        <div className='padding-bottom center'>
          <Heading type={1} color='gray' text='Promotores' />
          <p className='gray form-information'>
            Ya sea que estés vendiendo una entrada o cien mil, la infraestructura de QRTixsPro está diseñada 
            para satisfacer todas tus necesidades en Colombia. ¡Además, no hay tarifas adicionales ni 
            sorpresas añadidas más tarde!
          </p>
        </div>
      </div>
    </Section>

    <Section>
      <div className='container'>
        <div className='center'>
          <Heading type={5} color='gray' text='Gestiona todo con una sola aplicación' />
          <p className='gray form-information'>
            Con nuestra aplicación especialmente diseñada para Promotores, puedes seguir las ventas de entradas 
            en tiempo real y admitir clientes en la puerta con tu escáner de código QR. Perfecta para eventos 
            en Bogotá, Medellín, Cali y todo Colombia. ¡Además, es gratis!
          </p>
          <div className='button-container'>
            <ButtonLink
              text='Comenzar'
              color='gray-filled'
              rightIcon='arrow_forward'
              url='contact'
            />
          </div>
        </div>
      </div>
    </Section>

    <Section className='white-background'>
      <div className='container'>
        <div className='center'>
          <Heading type={5} color='gray' text='Venta de entradas sostenible' />
          <p className='gray form-information'>
            Páginas impresionantes con tu marca para promocionar tu evento. Para comenzar a vender entradas 
            en línea con QRTixsPro, primero crearás un hermoso sitio web para promocionar tu evento en 
            cualquier ciudad de Colombia, desde conciertos en el Movistar Arena hasta festivales en Cartagena.
          </p>
          <div className='button-container'>
            <ButtonLink
              text='Comenzar'
              color='gray-filled'
              rightIcon='arrow_forward'
              url='contact'
            />
          </div>
        </div>
      </div>
    </Section>

    <Section>
      <div className='container'>
        <div className='center'>
          <Heading type={5} color='gray' text='¿Cómo funciona?' />
          <p className='gray'>100% garantía de QRTixsPro para eventos en Colombia.</p>
        </div>
      </div>

      <div className='carousel padding-top'>
        <Slider>
          <Box className='gray'>
            <span className='material-symbols-outlined gray'>today</span>
            <p>Integración perfecta entre marketing, diseño y desarrollo</p>
          </Box>
          <Box className='gray'>
            <span className='material-symbols-outlined gray'>stacked_bar_chart</span>
            <p>Respaldado por seguridad de nivel empresarial</p>
          </Box>
          <Box className='gray'>
            <span className='material-symbols-outlined gray'>area_chart</span>
            <p>Nos asociamos contigo para garantizar el éxito de tus eventos en Colombia</p>
          </Box>
          <Box className='gray'>
            <span className='material-symbols-outlined gray'>table_chart_view</span>
            <p>Rendimiento de clase mundial para eventos de cualquier tamaño</p>
          </Box>
          <Box className='gray'>
            <span className='material-symbols-outlined gray'>database</span>
            <p>Aprovecha el poder de la tecnología sin necesidad de programar</p>
          </Box>
          <Box className='gray'>
            <span className='material-symbols-outlined gray'>pie_chart</span>
            <p>Tienes un equipo dedicado a atender a tus clientes individualmente</p>
          </Box>
        </Slider>
      </div>

      <div className='button-container center'>
        <ButtonLink
          text='Comenzar'
          color='gray-filled'
          rightIcon='arrow_forward'
          url='contact'
        />
      </div>
    </Section>
  </Master>
);

const title = 'Promotores | QRTixsPro';
const canonical = 'https://qrtixspro.com/promoters';
const description = 'QRTixsPro es la solución moderna de venta de entradas para eventos en Colombia';

export const metadata: Metadata = {
  title,
  description,
  keywords: 'venta de entradas, eventos Colombia, promotores, QRTixsPro',
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
