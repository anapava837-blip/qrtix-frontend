import { type Metadata } from 'next';

// components
import Master from '@components/Layout/Master';
import Section from '@components/Section/Section';
import Heading from '@components/Heading/Heading';
import ButtonLink from '@components/Button/ButtonLink';

const Page: React.FC = () => (
  <Master>
    <div className='blur-cover'>
      <div
        style={{
          backgroundImage: `url("https://images.unsplash.com/photo-1506521781263-d8422e82f27a?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D")`,
        }}
        className='event-cover cover-image flex flex-v-center flex-h-center'
      />
      <div className='cover-info'>
        <div
          style={{
            backgroundImage: `url("https://images.unsplash.com/photo-1506521781263-d8422e82f27a?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D")`,
          }}
          className='cover-image image'
        />
        <Heading type={1} color='white' text='Contacta con Nosotros' />
        <Heading type={5} color='white' text='QRTixsPro - Sistema de Venta de Tickets' />
        <Heading type={6} color='white' text='Tu solución integral para la gestión de eventos y venta de boletos' />
      </div>
    </div>
    <Section className='white-background'>
      <div className='container'>
        <div className='contact-content enhanced-contact'>
          <div className='row'>
            <div className='col-md-6'>
              <div className='contact-info feature-box'>
                <div className="feature-icon">
                  <span className="material-symbols-outlined">confirmation_number</span>
                </div>
                <Heading type={2} color='gray' text='QRTixsPro - Sistema de Venta de Tickets' />
                <p className='gray subtitle'>
                  Tu solución integral para la gestión de eventos y venta de boletos
                </p>
                <p className='gray'>
                  QRTixsPro es una plataforma avanzada para la venta y gestión de tickets para eventos en Colombia. Ofrecemos una solución completa para organizadores de eventos, promotores y recintos que desean optimizar su proceso de venta de boletos.
                </p>
                <p className='gray feature-heading'>
                  Nuestras características incluyen:
                </p>
                <ul className='gray feature-list'>
                  <li><span className="material-symbols-outlined">qr_code_scanner</span> Venta de boletos en línea con códigos QR seguros</li>
                  <li><span className="material-symbols-outlined">event</span> Gestión de eventos y control de aforo</li>
                  <li><span className="material-symbols-outlined">monitoring</span> Informes y análisis en tiempo real</li>
                  <li><span className="material-symbols-outlined">share</span> Integración con redes sociales y marketing</li>
                  <li><span className="material-symbols-outlined">smartphone</span> Aplicación móvil para validación de entradas</li>
                </ul>
              </div>
            </div>
            <div className='col-md-6'>
              <div className='contact-form contact-box'>
                <Heading type={3} color='gray' text='Contacta con Nosotros' />
                <div className='contact-details'>
                  <div className='contact-item'>
                    <div className="contact-icon">
                      <span className="material-symbols-outlined">support_agent</span>
                    </div>
                    <Heading type={5} color='gray' text='Atención al Cliente' />
                    <p className='gray'>
                      <strong>Email:</strong> soporte@qrtixspro.com
                    </p>
                    <p className='gray'>
                      <strong>Email de Soporte:</strong> ayuda@qrtixspro.com
                    </p>
                    <p className='gray'>
                      <strong>Horario:</strong> Lunes a Viernes, 8:00 AM - 6:00 PM
                    </p>
                  </div>
                  <div className='contact-item'>
                    <div className="contact-icon">
                      <span className="material-symbols-outlined">help</span>
                    </div>
                    <Heading type={5} color='gray' text='Ayuda' />
                    <p className='gray'>
                      Si tienes alguna pregunta sobre nuestros servicios, visita nuestro centro de ayuda o contáctanos directamente.
                    </p>
                    <div className='buttons-container'>
                      <ButtonLink color='blue' text='Centro de Ayuda' url='/help' />
                    </div>
                  </div>
                  <div className='contact-item'>
                    <div className="contact-icon">
                      <span className="material-symbols-outlined">call</span>
                    </div>
                    <Heading type={5} color='gray' text='Comunicación' />
                    <p className='gray'>
                      <strong>Teléfono:</strong> +57 601 123 4567
                    </p>
                    <p className='gray'>
                      <strong>Dirección:</strong> Calle 85 #11-53, Oficina 401, Bogotá, Colombia
                    </p>
                    <div className='buttons-container'>
                      <ButtonLink color='blue' text='Solicitar Demostración' url='/demo' />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Section>
    <Section className='gray-background'>
      <div className='container'>
        <div className='promoter-section cta-box'>
          <div className='row'>
            <div className='col-md-8'>
              <Heading type={2} color='gray' text='¿Organizas eventos?' />
              <p className='gray'>
                QRTixsPro ofrece soluciones completas para organizadores de eventos. Desde la venta de boletos hasta el control de acceso, tenemos todo lo que necesitas para hacer de tu evento un éxito.
              </p>
            </div>
            <div className='col-md-4'>
              <div className='buttons-container cta-buttons'>
                <ButtonLink color='blue' text='Área de Promotores' url='/promoters' />
                <ButtonLink color='gray-overlay' text='Centro de Ayuda' url='/help' />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Section>
  </Master>
);

const title = 'Contacta con Nosotros - Sistema de Gestión de Parqueaderos';
const mainUrl = 'https://www.sistemaparqueadero.com';
const canonical = `${mainUrl}/contact`;
const description = 'Sistema integral para la gestión eficiente de parqueaderos y estacionamientos';

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
    images: `${mainUrl}/logo192.png`,
  },
};

export default Page;
