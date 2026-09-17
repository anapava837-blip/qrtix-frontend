export interface Event {
  id: string;
  name: string;
  description: string;
  date: string;
  venue: string;
  venueDetails: {
    name: string;
    email: string;
    address: string;
    mapLink: string;
  };
  image: string;
  color: string;
  priceFrom: string;
  tickets: Array<{
    id: number;
    name: string;
    ordering: number;
    soldout?: boolean;
    information?: string;
  }>;
}

export const DEFAULT_PRICE_FROM = '45.000';

export const events: Event[] = [
  {
    id: "1",
    name: "LLaneros 2025_2",
    description: `Club Llaneros (llamado oficialmente Llaneros Fútbol Club), es un club de fútbol de Colombia, de la ciudad de Villavicencio en el departamento del Meta, fue fundado el 20 de abril de 2012 y actualmente milita en la primera categoría, primera división del fútbol profesional colombiano.

Actualmente es conocido por ser el único equipo en el Departamento del Meta y la región de la Orinoquía que disputa competiciones oficiales de fútbol en Colombia reconocidas por la Dimayor, la Categoría Primera B y la Copa Colombia.

El club juega sus partidos de local desde 2013 en el Estadio Bello Horizonte. Durante el 2012, año de su fundación, jugó de local en el Estadio Compensar (Antigua sede del desaparecido Academia F. C.), y en la cancha del barrio la Esperanza de Villavicencio en el mismo año, mientras continuaban las obras en el estadio Bello Horizonte su actual sede.

Es el cuarto equipo que representa a la ciudad de Villavicencio en el fútbol profesional, y el quinto a la Orinoquia.`,
    date: "Viernes, Sep 21, 2025 19:00",
    venue: "Estadio Bello Horizonte - Rey Pelé",
    venueDetails: {
      name: "Estadio Bello Horizonte - Rey Pelé",
      email: "REYPELE@GMAIL.COM",
      address: "Villavicencio, Meta, Colombia",
      mapLink: "https://share.google/g27OiTau2tpFpkYB3"
    },
    image: "/imagenes/llaneros.jpg",
    color: "blue",
    priceFrom: "45.000",
    tickets: [
      {
        id: 2,
        name: "Adultos",
        ordering: 2,
      },
      {
        id: 3,
        name: "Niños",
        ordering: 3,
        information: "Information about child tickets",
      },
    ]
  },
  {
    id: "2",
    name: "FUCKS NEWS NOTICREO",
    description: `Un evento especial de noticias y entretenimiento que combina información actual con humor y análisis crítico. Este evento único presenta una perspectiva diferente sobre los acontecimientos actuales, mezclando periodismo alternativo con entretenimiento.

El evento contará con panelistas especializados, debates interactivos y segmentos de entretenimiento que mantendrán al público informado y entretenido durante toda la velada.

Una experiencia única que desafía las formas tradicionales de consumir noticias, ofreciendo un enfoque fresco y dinámico para entender el mundo que nos rodea.`,
    date: "Sabado, sep 9, 2025 22:00",
    venue: "Movistar Arena",
    venueDetails: {
      name: "Movistar Arena",
      email: "info@movistar-arena.co",
      address: "Bogotá, Colombia",
      mapLink: "https://maps.google.com/movistar-arena"
    },
image: "/imagenes/fucks.jpg",
    color: "blue",
    priceFrom: "80.000",
    tickets: [
      {
        id: 1,
        name: "General",
        ordering: 1,
      },
      {
        id: 2,
        name: "VIP",
        ordering: 2,
      },
      {
        id: 3,
        name: "Premium",
        ordering: 3,
        information: "Incluye meet & greet",
      },
    ]
  },
  {
    id: "3",
    name: "Festival Infantil Mágico",
    description: `Un evento especialmente diseñado para los más pequeños de la casa. El Festival Infantil Mágico es una experiencia llena de diversión, aprendizaje y entretenimiento para niños de todas las edades.

El festival incluye espectáculos de magia, obras de teatro interactivas, talleres creativos, juegos educativos y actividades que estimulan la imaginación y creatividad de los niños.

Con la participación de magos profesionales, payasos, cuentacuentos y artistas especializados en entretenimiento infantil, este evento promete ser una experiencia inolvidable para toda la familia.

Además, contaremos con zonas de comida saludable para niños, áreas de descanso para padres y actividades que fomentan la interacción familiar.`,
    date: "Domingo, Oct 15, 2025 15:00",
    venue: "Centro de Convenciones Infantil",
    venueDetails: {
      name: "Centro de Convenciones Infantil",
      email: "eventos@centroinfantil.co",
      address: "Medellín, Antioquia, Colombia",
      mapLink: "https://maps.google.com/centro-infantil"
    },
    image: "https://images.unsplash.com/photo-1531058020387-3be344556be6?q=80&w=400&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    color: "orange",
    priceFrom: "25.000",
    tickets: [
      {
        id: 1,
        name: "Niño",
        ordering: 1,
        information: "Para niños de 3 a 12 años",
      },
      {
        id: 2,
        name: "Adulto Acompañante",
        ordering: 2,
        information: "Entrada gratuita para un adulto por cada niño",
      },
      {
        id: 3,
        name: "Paquete Familiar",
        ordering: 3,
        information: "Incluye 2 niños + 2 adultos + snacks",
      },
    ]
  },
  {
    id: "4",
    name: "Concierto Rock Nacional",
    description: `Una noche épica de rock nacional con las mejores bandas del país. Este evento reunirá a los exponentes más destacados del rock colombiano en una sola noche llena de energía y música en vivo.

El concierto contará con efectos especiales, luces LED, y un sistema de sonido de última generación que garantizará una experiencia auditiva incomparable.

Una celebración del talento musical nacional que no te puedes perder, con sorpresas especiales y colaboraciones únicas entre artistas.`,
    date: "Viernes, Nov 10, 2025 20:00",
    venue: "Coliseo El Campín",
    venueDetails: {
      name: "Coliseo El Campín",
      email: "eventos@coliseocampin.co",
      address: "Bogotá, Colombia",
      mapLink: "https://maps.google.com/coliseo-campin"
    },
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=400&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    color: "red",
    priceFrom: "60.000",
    tickets: [
      {
        id: 1,
        name: "General",
        ordering: 1,
      },
      {
        id: 2,
        name: "Preferencial",
        ordering: 2,
      },
      {
        id: 3,
        name: "VIP",
        ordering: 3,
        information: "Incluye meet & greet con artistas",
      },
    ]
  },
  {
    id: "5",
    name: "Festival Gastronómico Internacional",
    description: `Un evento culinario que celebra la diversidad gastronómica mundial. Chefs internacionales y locales se reunirán para ofrecer una experiencia gastronómica única con sabores de todos los continentes.

El festival incluye degustaciones, talleres de cocina, competencias culinarias y showcookings en vivo con reconocidos chefs.

Una oportunidad perfecta para explorar nuevos sabores, aprender técnicas culinarias y disfrutar de la mejor gastronomía en un ambiente festivo y familiar.`,
    date: "Sábado, Nov 25, 2025 12:00",
    venue: "Centro de Exposiciones Corferias",
    venueDetails: {
      name: "Centro de Exposiciones Corferias",
      email: "eventos@corferias.com",
      address: "Bogotá, Colombia",
      mapLink: "https://maps.google.com/corferias"
    },
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=400&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    color: "green",
    priceFrom: "35.000",
    tickets: [
      {
        id: 1,
        name: "Entrada General",
        ordering: 1,
        information: "Incluye degustaciones básicas",
      },
      {
        id: 2,
        name: "Pase Premium",
        ordering: 2,
        information: "Incluye talleres y degustaciones premium",
      },
      {
        id: 3,
        name: "Experiencia Chef",
        ordering: 3,
        information: "Incluye cena con chef y clase magistral",
      },
    ]
  },
  {
    id: "6",
    name: "Teatro Musical Broadway",
    description: `Una producción teatral de clase mundial que trae lo mejor de Broadway a Colombia. Este espectáculo musical combina actuación, canto, baile y efectos especiales en una experiencia teatral inolvidable.

Con un elenco de artistas internacionales y locales, vestuario de época, y una orquesta en vivo, esta producción promete transportar al público a la magia del teatro musical.

Una oportunidad única de disfrutar del mejor teatro musical sin salir del país, con la calidad y producción de los grandes teatros internacionales.`,
    date: "Domingo, Dic 3, 2025 19:30",
    venue: "Teatro Mayor Julio Mario Santo Domingo",
    venueDetails: {
      name: "Teatro Mayor Julio Mario Santo Domingo",
      email: "taquilla@teatromayor.org",
      address: "Bogotá, Colombia",
      mapLink: "https://maps.google.com/teatro-mayor"
    },
    image: "https://images.unsplash.com/photo-1507924538820-ede94a04019d?q=80&w=400&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    color: "purple",
    priceFrom: "120.000",
    tickets: [
      {
        id: 1,
        name: "Platea",
        ordering: 1,
      },
      {
        id: 2,
        name: "Palco",
        ordering: 2,
      },
      {
        id: 3,
        name: "Palco Premium",
        ordering: 3,
        information: "Incluye copa de bienvenida y programa",
      },
    ]
  },
  {
    id: "7",
    name: "Conferencia Tech Innovation 2025",
    description: `El evento tecnológico más importante del año que reunirá a líderes de la industria, emprendedores y desarrolladores para explorar las últimas tendencias en tecnología e innovación.

La conferencia incluye keynotes inspiradores, talleres prácticos, networking sessions y exhibiciones de las startups más prometedoras del ecosistema tecnológico.

Una oportunidad única para aprender sobre inteligencia artificial, blockchain, desarrollo sostenible y las tecnologías que están transformando el mundo.`,
    date: "Miércoles, Dic 15, 2025 09:00",
    venue: "Centro de Convenciones Ágora",
    venueDetails: {
      name: "Centro de Convenciones Ágora",
      email: "eventos@agora.co",
      address: "Bogotá, Colombia",
      mapLink: "https://maps.google.com/agora-bogota"
    },
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=400&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    color: "blue",
    priceFrom: "95.000",
    tickets: [
      {
        id: 1,
        name: "Early Bird",
        ordering: 1,
        information: "Precio especial por tiempo limitado",
      },
      {
        id: 2,
        name: "Profesional",
        ordering: 2,
      },
      {
        id: 3,
        name: "Premium",
        ordering: 3,
        information: "Incluye almuerzo y materiales exclusivos",
      },
    ]
  },
  {
    id: "8",
    name: "Festival de Jazz Latinoamericano",
    description: `Una celebración del jazz latinoamericano con artistas de toda la región. Este festival presenta una fusión única entre el jazz tradicional y los ritmos latinos, creando una experiencia musical extraordinaria.

El evento contará con múltiples escenarios, jam sessions abiertas, talleres de improvisación y presentaciones de reconocidos músicos de jazz de América Latina.

Una experiencia cultural que celebra la riqueza musical de nuestra región y la evolución del jazz en el contexto latinoamericano.`,
    date: "Viernes, Ene 20, 2026 18:00",
    venue: "Parque Simón Bolívar",
    venueDetails: {
      name: "Parque Simón Bolívar",
      email: "eventos@parquesimonbolivar.gov.co",
      address: "Bogotá, Colombia",
      mapLink: "https://maps.google.com/parque-simon-bolivar"
    },
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=400&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    color: "orange",
    priceFrom: "75.000",
    tickets: [
      {
        id: 1,
        name: "Entrada General",
        ordering: 1,
      },
      {
        id: 2,
        name: "Zona VIP",
        ordering: 2,
        information: "Área preferencial cerca del escenario",
      },
      {
        id: 3,
        name: "Pase Completo",
        ordering: 3,
        information: "Acceso a todos los días del festival",
      },
    ]
  },
  {
    id: "9",
    name: "Expo Arte Contemporáneo",
    description: `Una exposición que reúne lo mejor del arte contemporáneo nacional e internacional. Artistas emergentes y consagrados presentarán sus obras más recientes en diferentes disciplinas artísticas.

La expo incluye instalaciones interactivas, performance art, talleres creativos y charlas con curadores y artistas reconocidos.

Una oportunidad única para explorar las tendencias actuales del arte contemporáneo y conectar con la comunidad artística local e internacional.`,
    date: "Sábado, Feb 5, 2026 10:00",
    venue: "Museo de Arte Moderno",
    venueDetails: {
      name: "Museo de Arte Moderno",
      email: "info@mambo.gov.co",
      address: "Bogotá, Colombia",
      mapLink: "https://maps.google.com/mambo-bogota"
    },
    image: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?q=80&w=400&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    color: "red",
    priceFrom: "55.000",
    tickets: [
      {
        id: 1,
        name: "Entrada General",
        ordering: 1,
      },
      {
        id: 2,
        name: "Estudiantes",
        ordering: 2,
        information: "Con carnet estudiantil vigente",
      },
      {
        id: 3,
        name: "Pase Anual",
        ordering: 3,
        information: "Acceso ilimitado por un año",
      },
    ]
  },
  {
    id: "10",
    name: "Maratón Ciudad Capital",
    description: `El evento deportivo más importante del año que convoca a corredores de todo el país y el extranjero. Una competencia que recorre los lugares más emblemáticos de la ciudad en diferentes categorías.

El maratón incluye 5K, 10K, 21K y 42K, con rutas diseñadas para mostrar la belleza arquitectónica e histórica de la capital.

Además de la competencia, el evento incluye una feria de la salud, stands de nutrición deportiva y actividades para toda la familia.`,
    date: "Domingo, Feb 26, 2026 06:00",
    venue: "Plaza de Bolívar (Punto de Partida)",
    venueDetails: {
      name: "Plaza de Bolívar",
      email: "maraton@deportebogota.gov.co",
      address: "Bogotá, Colombia",
      mapLink: "https://maps.google.com/plaza-bolivar"
    },
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=400&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    color: "green",
    priceFrom: "40.000",
    tickets: [
      {
        id: 1,
        name: "5K",
        ordering: 1,
        information: "Incluye kit de corredor y medalla",
      },
      {
        id: 2,
        name: "10K",
        ordering: 2,
        information: "Incluye kit de corredor y medalla",
      },
      {
        id: 3,
        name: "21K/42K",
        ordering: 3,
        information: "Incluye kit premium y medalla especial",
      },
    ]
  },
  {
    id: "11",
    name: "Festival de Cine Independiente",
    description: `Una celebración del cine independiente nacional e internacional que presenta lo mejor de la producción cinematográfica alternativa. El festival incluye largometrajes, cortometrajes, documentales y animaciones.

Con la participación de directores emergentes y reconocidos, el festival ofrece una plataforma para el cine que explora temáticas sociales, experimentales y artísticas.

Además de las proyecciones, el evento incluye masterclasses, paneles de discusión y networking para profesionales de la industria cinematográfica.`,
    date: "Jueves, Mar 15, 2026 19:00",
    venue: "Cinemateca Distrital",
    venueDetails: {
      name: "Cinemateca Distrital",
      email: "programacion@cinematecadistrital.gov.co",
      address: "Bogotá, Colombia",
      mapLink: "https://maps.google.com/cinemateca-distrital"
    },
    image: "https://images.unsplash.com/photo-1489599904472-84b0e19be5b9?q=80&w=400&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    color: "purple",
    priceFrom: "65.000",
    tickets: [
      {
        id: 1,
        name: "Función Individual",
        ordering: 1,
      },
      {
        id: 2,
        name: "Pase Diario",
        ordering: 2,
        information: "Acceso a todas las funciones del día",
      },
      {
        id: 3,
        name: "Pase Festival",
        ordering: 3,
        information: "Acceso completo + eventos especiales",
      },
    ]
  },
  {
    id: "12",
    name: "Concierto Sinfónico de Primavera",
    description: `Un concierto extraordinario de la Orquesta Sinfónica Nacional que presenta un repertorio especial para celebrar la llegada de la primavera. Una experiencia musical única con obras clásicas y contemporáneas.

El concierto incluye piezas de compositores latinoamericanos y europeos, interpretadas por músicos de clase mundial bajo la dirección de reconocidos directores invitados.

Una velada cultural que combina la tradición sinfónica con la innovación musical, perfecta para amantes de la música clásica y aquellos que desean descubrir este género.`,
    date: "Sábado, Mar 25, 2026 20:00",
    venue: "Teatro Colón",
    venueDetails: {
      name: "Teatro Colón",
      email: "taquilla@teatrocolon.gov.co",
      address: "Bogotá, Colombia",
      mapLink: "https://maps.google.com/teatro-colon"
    },
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=400&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    color: "blue",
    priceFrom: "90.000",
    tickets: [
      {
        id: 1,
        name: "Galería",
        ordering: 1,
      },
      {
        id: 2,
        name: "Platea",
        ordering: 2,
      },
      {
        id: 3,
        name: "Palco",
        ordering: 3,
        information: "Vista privilegiada y programa especial",
      },
    ]
  }
];

export const getEventById = (id: string): Event | undefined => {
  return events.find(event => event.id === id);
};

export const getAllEvents = (): Event[] => {
  return events;
};