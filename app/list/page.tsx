'use client';

import { Suspense, useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import type { Metadata } from 'next';

// components
import Master from '@components/Layout/Master';
import Section from '@components/Section/Section';
import Heading from '@components/Heading/Heading';
import EventCard from '@components/Card/EventCard';
import Button from '@components/Button/Button';
import Loader from '@components/Loader/Loader';

// data
import { getAllEvents, type Event } from '@data/events';

const Page: React.FC = () => {
  const searchParams = useSearchParams();
  const allEvents = getAllEvents();
  const q = searchParams?.get('q') ?? '';

  const [searchQuery, setSearchQuery] = useState<string>(q);
  const [inputValue, setInputValue] = useState<string>(q);

  useEffect(() => {
    setSearchQuery(q);
    setInputValue(q);
  }, [q]);

  const filteredEvents = useMemo<Event[]>(() => {
    if (!searchQuery || searchQuery.trim().length === 0) {
      return allEvents;
    }
    const term = searchQuery.trim().toLowerCase();
    return allEvents.filter((e) => {
      return (
        e.name.toLowerCase().includes(term) ||
        e.venue.toLowerCase().includes(term) ||
        e.description.toLowerCase().includes(term) ||
        e.venueDetails?.name?.toLowerCase().includes(term) ||
        e.venueDetails?.address?.toLowerCase().includes(term)
      );
    });
  }, [allEvents, searchQuery]);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const val = inputValue.trim();
    if (val.length === 0) {
      window.location.href = '/list';
    } else {
      window.location.href = `/list?q=${encodeURIComponent(val)}`;
    }
  };

  return (
    <Master>
      <Section className='white-background'>
        <div className='container'>
          <div className='padding-bottom center'>
            <Heading type={1} color='gray' text='Eventos' />
            <p className='gray'>Descubre, busca y filtra los mejores eventos de Colombia.</p>
          </div>

          <div
            className='top-search'
            style={{ maxWidth: '700px', margin: '0 auto 30px auto', padding: 0 }}
          >
            <form
              noValidate
              onSubmit={handleSearch}
              className='search-inputs flex flex-h-center flex-space-between'
              style={{
                borderRadius: 'var(--r-lg)',
                border: '1px solid var(--ink-200, #e2e8f0)',
                background: '#fff',
                padding: '6px 6px 6px 18px',
              }}
            >
              <input
                type='text'
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder='Buscar evento, lugar, artista...'
                maxLength={64}
                style={{
                  flex: 1,
                  border: 'none',
                  outline: 'none',
                  padding: '10px 0',
                  boxShadow: 'none',
                  background: 'transparent',
                }}
              />
              <button
                type='submit'
                className='button blue-filled button-sm'
                style={{ minWidth: 'auto', padding: '10px 18px' }}
                aria-label='Buscar'
              >
                <span className='material-symbols-outlined left-icon'>Buscar</span>
                Buscar
              </button>
            </form>
          </div>

          {searchQuery && (
            <div
              style={{
                textAlign: 'center',
                marginBottom: '24px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '12px',
                flexWrap: 'wrap',
              }}
            >
              <p className='gray' style={{ fontSize: '1rem' }}>
                Resultados para:{' '}
                <strong style={{ color: 'var(--brand, #2563eb)' }}>
                  &ldquo;{searchQuery}&rdquo;
                </strong>{' '}
                ({filteredEvents.length} encontrado
                {filteredEvents.length !== 1 ? 's' : ''})
              </p>
              <Link href='/list' style={{ textDecoration: 'none' }}>
                <Button type='button' color='gray-overlay' buttonSize='sm' text='Limpiar búsqueda' />
              </Link>
            </div>
          )}
        </div>
      </Section>

      <Section className='list-cards' style={{ paddingTop: 0 }}>
        <div className='container'>
          {filteredEvents.length === 0 ? (
            <div
              className='center'
              style={{
                padding: '60px 20px',
                borderRadius: 'var(--r-lg)',
                background: 'var(--ink-50, #f8fafc)',
                border: '1px dashed var(--ink-200, #e2e8f0)',
                maxWidth: '600px',
                margin: '0 auto',
              }}
            >
              <span
                className='material-symbols-outlined'
                style={{ fontSize: '4rem', color: 'var(--dark-gray, #64748b)' }}
              >
                search_off
              </span>
              <Heading
                type={3}
                color='gray'
                text='No se encontraron eventos'
                style={{ marginTop: '12px' }}
              />
              <p className='gray' style={{ marginTop: '10px', marginBottom: '20px' }}>
                Intenta con otra palabra clave o limpia la búsqueda para ver todos los eventos.
              </p>
              <Link href='/list' style={{ textDecoration: 'none' }}>
                <Button type='button' color='blue-filled' text='Ver todos los eventos' />
              </Link>
            </div>
          ) : (
            <div className='card-grid' style={{ marginTop: 0 }}>
              {filteredEvents.map((event) => (
                <EventCard
                  key={event.id}
                  url={event.id}
                  from={event.priceFrom}
                  color={event.color}
                  when={event.date}
                  name={event.name}
                  venue={event.venue}
                  image={event.image}
                />
              ))}
            </div>
          )}
        </div>
      </Section>
    </Master>
  );
};

const title = 'Eventos - QRTIXPRO';
const canonical = 'https://modern-ticketing.com/list';
const description = 'Descubre, busca y filtra los mejores eventos de Colombia con QRTIXPRO';

export const metadata: Metadata = {
  title,
  description,
  keywords: 'eventos, conciertos, boletas, entradas, colombia',
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

const PageWithSuspense: React.FC = () => (
  <Suspense fallback={<Loader type='inline' color='gray' text='Cargando eventos...' />}>
    <Page />
  </Suspense>
);

export default PageWithSuspense;
