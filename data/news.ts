// ============================================================
//  NEWS DATA - data statica noticias / eventos relacionados
// ============================================================
//  Antes estaba en news/[url]/page.tsx (hardcodeado ahi) - lo movemos
//  para poder reutilizarlo y no exportar data desde page files.
// ============================================================

export interface NewsItem {
  title: string;
  date: string;
  image: string;
  content: string;
  location: string;
  price: string;
  color: string;
}

export const newsData: Record<string, NewsItem> = {
  '1': {
    title: 'Festival Estéreo Picnic 2024',
    date: 'Sábado, Octubre 30, 2024 20:00',
    image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    content: 'El Festival Estéreo Picnic es uno de los eventos musicales más importantes de Colombia. Con más de una década de trayectoria, este festival multitudinario reúne a artistas nacionales e internacionales de diversos géneros musicales. La edición 2024 promete ser una de las más grandes hasta la fecha, con un cartel estelar que incluye bandas de rock, pop, electrónica y música alternativa. Los asistentes podrán disfrutar de múltiples escenarios, zonas gastronómicas y actividades complementarias durante los días del evento.',
    location: 'Parque Simón Bolívar, Bogotá',
    price: 'Desde $250.000 COP',
    color: 'red',
  },
  '2': {
    title: 'Concierto Juanes - Bogotá',
    date: 'Viernes, Noviembre 15, 2024 19:00',
    image: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    content: 'Juanes regresa a Bogotá con su nueva gira mundial presentando sus éxitos de siempre y las canciones de su más reciente álbum. Una noche llena de rock, pop y folclor colombiano que no te puedes perder.',
    location: 'Movistar Arena, Bogotá',
    price: 'Desde $180.000 COP',
    color: 'blue',
  },
  '3': {
    title: 'Festival Vallenato - Valledupar',
    date: 'Domingo, Diciembre 05, 2024 16:00',
    image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    content: 'El Festival de la Leyenda Vallenata es el evento más importante de la música vallenata en Colombia. Reúne a los mejores acordeoneros del país en una competencia que busca coronar al Rey Vallenato del año.',
    location: 'Parque de la Leyenda Vallenata, Valledupar',
    price: 'Desde $120.000 COP',
    color: 'green',
  },
  '4': {
    title: 'Rock al Parque - Bogotá',
    date: 'Sábado, Noviembre 20, 2024 21:00',
    image: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    content: 'Rock al Parque es el festival gratuito de rock más grande de Latinoamérica. Durante tres días, bandas nacionales e internacionales se presentan en diferentes escenarios del Parque Simón Bolívar.',
    location: 'Parque Simón Bolívar, Bogotá',
    price: 'Entrada Gratuita',
    color: 'purple',
  },
  '5': {
    title: 'Festival de Jazz - Medellín',
    date: 'Viernes, Enero 10, 2025 18:00',
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    content: 'El Festival de Jazz de Medellín reúne a los mejores exponentes del género a nivel nacional e internacional. Una experiencia musical única en uno de los teatros más emblemáticos de la ciudad.',
    location: 'Teatro Metropolitano, Medellín',
    price: 'Desde $150.000 COP',
    color: 'orange',
  },
  '6': {
    title: 'Concierto Shakira - Barranquilla',
    date: 'Sábado, Febrero 14, 2025 20:30',
    image: 'https://images.unsplash.com/photo-1531058020387-3be344556be6?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    content: 'Shakira regresa a su ciudad natal para presentar su nueva gira mundial. Un concierto lleno de energía, baile y los éxitos que han marcado su carrera internacional.',
    location: 'Estadio Metropolitano Roberto Meléndez, Barranquilla',
    price: 'Desde $200.000 COP',
    color: 'red',
  },
};
