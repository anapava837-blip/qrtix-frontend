// ============================================================
//  VENUES DATA - data statica de lugares (escenarios / estadios)
// ============================================================
//  Antes estaba exportado desde app/venues/page.tsx PERO
//  Next.js 15 NO PERMITE exports que no sean metadata / default Page.
//  Por eso lo movemos acá para reutilizar en:
//  - app/venues/page.tsx (listado)
//  - app/venue/[url]/page.tsx (detalle)
// ============================================================

export interface Venue {
  name: string;
  location: string;
  image: string;
  description: string;
  capacity: string;
  address: string;
  website: string;
}

export const venuesData: Record<string, Venue> = {
  '1': {
    name: 'Movistar Arena',
    location: 'Bogotá, Colombia',
    image: 'https://images.unsplash.com/photo-1667323567047-434d8bc4aca2?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    description: 'El Movistar Arena es un recinto cubierto multiusos ubicado en Bogotá, Colombia. Con capacidad para más de 14,000 espectadores, es sede de conciertos, eventos deportivos y espectáculos de primer nivel. Su moderna infraestructura y excelente acústica lo convierten en uno de los mejores escenarios para eventos en Colombia.',
    capacity: '14,000 espectadores',
    address: 'Diagonal 61c #26-36, Bogotá',
    website: 'www.movistararena.co',
  },
  '2': {
    name: 'Estadio El Campín',
    location: 'Bogotá, Colombia',
    image: 'https://images.unsplash.com/photo-1654111922009-74dbebd0a70f?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    description: 'El Estadio Nemesio Camacho El Campín es el principal estadio de fútbol de Bogotá y uno de los más importantes de Colombia. Además de partidos de fútbol, ha sido escenario de grandes conciertos internacionales y eventos masivos. Su capacidad y ubicación lo convierten en un lugar emblemático para eventos de gran magnitud.',
    capacity: '36,343 espectadores',
    address: 'Carrera 30 entre Calles 57 y 53, Bogotá',
    website: 'www.idrd.gov.co',
  },
  '3': {
    name: 'Teatro Jorge Eliécer Gaitán',
    location: 'Bogotá, Colombia',
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    description: 'El Teatro Jorge Eliécer Gaitán es uno de los teatros más importantes de Bogotá. Con una arquitectura única y excelente acústica, es sede de obras teatrales, conciertos, danza y diversos eventos culturales. Su ubicación en el centro de la ciudad lo hace accesible y emblemático.',
    capacity: '1,700 espectadores',
    address: 'Carrera 7 #22-47, Bogotá',
    website: 'www.teatrojorgeeliecer.gov.co',
  },
  '4': {
    name: 'Parque Simón Bolívar',
    location: 'Bogotá, Colombia',
    image: 'https://images.unsplash.com/photo-1507901747481-84a4f64fda6d?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    description: 'El Parque Metropolitano Simón Bolívar es el parque urbano más grande de Bogotá y uno de los más extensos de Latinoamérica. Es sede de grandes festivales musicales como Rock al Parque y diversos eventos al aire libre. Su amplio espacio verde permite la realización de conciertos masivos y actividades culturales de gran escala.',
    capacity: 'Más de 100,000 personas',
    address: 'Calle 63 y 53 entre Carreras 48 y 68, Bogotá',
    website: 'www.idrd.gov.co',
  },
  '5': {
    name: 'Plaza de Toros La Santamaría',
    location: 'Bogotá, Colombia',
    image: 'https://images.unsplash.com/photo-1521334726092-b509a19597c6?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    description: 'La Plaza de Toros La Santamaría es un recinto histórico de Bogotá que, además de su uso taurino original, se ha convertido en un importante escenario para conciertos y eventos culturales. Su estructura circular ofrece una experiencia única para los espectadores.',
    capacity: '14,500 espectadores',
    address: 'Carrera 6 #26-50, Bogotá',
    website: 'www.idrd.gov.co',
  },
  '6': {
    name: 'Estadio Atanasio Girardot',
    location: 'Medellín, Colombia',
    image: 'https://images.unsplash.com/photo-1526041092449-209d556f7a32?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    description: 'El Estadio Atanasio Girardot es el principal escenario deportivo de Medellín y uno de los más modernos de Colombia. Además de eventos deportivos, ha sido sede de importantes conciertos internacionales y festivales musicales. Su infraestructura y ubicación lo convierten en un lugar ideal para eventos masivos.',
    capacity: '45,943 espectadores',
    address: 'Calle 48 #73-10, Medellín',
    website: 'www.inder.gov.co',
  },
  '7': {
    name: 'Teatro Metropolitano de Medellín',
    location: 'Medellín, Colombia',
    image: 'https://images.unsplash.com/photo-1531058020387-3be344556be6?q=80&w=400&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    description: 'El Teatro Metropolitano José Gutiérrez Gómez es el principal teatro de Medellín. Con una arquitectura moderna y excelente acústica, es sede de conciertos, óperas, ballet y diversos eventos culturales. Su diseño y capacidad lo convierten en uno de los mejores teatros de Colombia.',
    capacity: '1,634 espectadores',
    address: 'Calle 41 #57-30, Medellín',
    website: 'www.teatrometropolitano.com',
  },
};
