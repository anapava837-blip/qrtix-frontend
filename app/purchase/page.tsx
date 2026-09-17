'use client';

import { useState, useEffect } from 'react';

// components
import Master from '@components/Layout/Master';
import Section from '@components/Section/Section';
import Heading from '@components/Heading/Heading';

import PurchaseForm from './components/PurchaseForm';

interface Seat {
  id?: string;
  row: number;
  seat: number;
  zone: 'occidental' | 'oriental' | 'sur' | 'norte';
  price?: number;
}

interface PurchaseDataExt {
  seats: Seat[];
  totalPrice: number;
  timestamp: string;
  reservation_id?: string;
  session_id?: string;
  event_id?: string;
  expires_at?: string;
  reservation_seconds_left?: number;
}

const API_URL = (() => {
  if (typeof process !== 'undefined' && (process as any).env?.NEXT_PUBLIC_BACKEND_URL) {
    return (process as any).env.NEXT_PUBLIC_BACKEND_URL;
  }
  if (typeof window === 'undefined') return '';
  const hostname = window.location.hostname;
  if (hostname === 'localhost' || hostname === '127.0.0.1') return 'http://localhost:8000';
  return '';
})();

function fmtMMSS(total: number): string {
  const m = Math.max(0, Math.floor(total / 60));
  const s = Math.max(0, Math.floor(total % 60));
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

const zoneNames: Record<string, string> = {
  occidental: 'OCCIDENTAL',
  oriental: 'ORIENTAL',
  sur: 'SUR',
  norte: 'NORTE',
};

export default function PurchasePage() {
  const [purchaseData, setPurchaseData] = useState<PurchaseDataExt | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [secondsLeft, setSecondsLeft] = useState<number>(0);
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    const storedData = typeof window !== 'undefined' ? localStorage.getItem('purchaseData') : null;
    if (!storedData) {
      setIsLoading(false);
      return;
    }
    try {
      const parsed: PurchaseDataExt = JSON.parse(storedData);
      setPurchaseData(parsed);

      let initial = parsed.reservation_seconds_left ?? 15 * 60;
      if (parsed.expires_at) {
        const msLeft = new Date(parsed.expires_at).getTime() - Date.now();
        initial = Math.max(0, Math.floor(msLeft / 1000));
      }
      setSecondsLeft(initial);
      if (initial <= 0) setExpired(true);
    } catch (e) {
      console.error('Error parseando purchaseData', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ========== Countdown ==========
  useEffect(() => {
    if (!purchaseData || expired) return;
    const timer = window.setInterval(() => {
      setSecondsLeft((prev) => {
        const next = prev - 1;
        if (next <= 0) {
          clearInterval(timer);
          setExpired(true);
          // Liberar reserva
          try {
            if (purchaseData.reservation_id && purchaseData.session_id) {
              fetch(`${API_URL}/api/seats/release`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  reservation_id: purchaseData.reservation_id,
                  session_id: purchaseData.session_id,
                }),
              }).catch(() => {});
            }
          } catch {}
          localStorage.removeItem('purchaseData');
          return 0;
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [purchaseData, expired]);

  // ========== Redirect back cuando se agota el tiempo ==========
  useEffect(() => {
    if (!expired || !purchaseData) return;
    const t = window.setTimeout(() => {
      alert('⏰ Tu tiempo de reserva ha expirado.\n\nLos asientos han sido liberados. Por favor, inténtalo de nuevo.');
      const ev = purchaseData.event_id ? `/event/${purchaseData.event_id}` : '/event/1';
      window.location.href = ev;
    }, 300);
    return () => clearTimeout(t);
  }, [expired, purchaseData]);

  if (isLoading) {
    return (
      <Master>
        <Section className='white-background'>
          <div className='container'>
            <Heading type={2} color='gray' text='Cargando...' />
            <p>Cargando datos de compra...</p>
          </div>
        </Section>
      </Master>
    );
  }

  if (!purchaseData) {
    return (
      <Master>
        <Section className='white-background'>
          <div className='container'>
            <Heading type={2} color='gray' text='Error' />
            <p>No se encontraron datos de compra. Por favor, regresa y selecciona tus asientos.</p>
            <a className='button blue-filled' href='/event/1' style={{ marginTop: 20, display: 'inline-flex' }}>
              <span className='material-symbols-outlined left-icon'>arrow_back</span>
              Volver al evento
            </a>
          </div>
        </Section>
      </Master>
    );
  }

  const isUrgent = secondsLeft > 0 && secondsLeft < 120;
  const bgBar = isUrgent ? '#fef2f2' : '#eff6ff';
  const borderBar = isUrgent ? '#fecaca' : '#bfdbfe';
  const textBar = isUrgent ? '#991b1b' : '#1e40af';

  return (
    <Master>
      <Section className='white-background'>
        <div className='container'>
          <Heading type={2} color='gray' text='Finalizar Compra' />

          {/* Countdown / Timer */}
          <div
            className='purchase-countdown-bar'
            style={{
              background: bgBar,
              border: `1px solid ${borderBar}`,
              color: textBar,
            }}
          >
            <div className='countdown-icon'>
              <span className='material-symbols-outlined' style={{ fontVariationSettings: "'FILL' 1, 'wght' 600" }}>
                {isUrgent ? 'error' : 'timer'}
              </span>
            </div>
            <div className='countdown-text'>
              <div className='countdown-title' style={{ fontWeight: 800 }}>
                {expired
                  ? 'Tu reserva ha expirado'
                  : 'Tienes tus asientos reservados temporalmente'}
              </div>
              <div className='countdown-sub'>
                {expired ? (
                  <>Estamos liberando los asientos y te regresaremos...</>
                ) : (
                  <>
                    Completa el pago antes de que termine el tiempo. Si el reloj llega a <b>00:00</b>,
                    tus asientos se liberarán automáticamente y otra persona podrá comprarlos.
                  </>
                )}
              </div>
            </div>
            {!expired && (
              <div className={'countdown-clock ' + (isUrgent ? 'urgent' : '')}>
                <div className='time-block'>
                  <span className='time-label'>MIN</span>
                  <span className='time-value'>{fmtMMSS(secondsLeft).split(':')[0]}</span>
                </div>
                <span className='time-sep'>:</span>
                <div className='time-block'>
                  <span className='time-label'>SEG</span>
                  <span className='time-value'>{fmtMMSS(secondsLeft).split(':')[1]}</span>
                </div>
              </div>
            )}
          </div>

          {/* Resumen de compra */}
          <div className='purchase-summary'>
            <Heading type={4} color='gray' text='Resumen de tu compra' />
            <div className='summary-content'>
              <h4>Entradas Seleccionadas: {purchaseData.seats.length}</h4>
              {purchaseData.seats.map((seat, index) => (
                <div key={index} className='summary-item'>
                  <span className='material-symbols-outlined summary-ico'>local_activity</span>
                  <div>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>
                      Zona {zoneNames[seat.zone] || seat.zone.toUpperCase()}
                    </div>
                    <div style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>
                      Fila {seat.row} · Asiento {seat.seat}
                      {seat.price ? ` · $${seat.price.toLocaleString()}` : ''}
                    </div>
                  </div>
                </div>
              ))}
              <div className='summary-total'>
                <span>Total a pagar</span>
                <b>${purchaseData.totalPrice.toLocaleString()}</b>
              </div>
            </div>
          </div>

          {/* Formulario de compra */}
          {!expired && (
            <PurchaseForm
              purchaseData={purchaseData}
              reservationInfo={{
                reservation_id: purchaseData.reservation_id,
                session_id: purchaseData.session_id,
                event_id: purchaseData.event_id,
              }}
            />
          )}
        </div>
      </Section>
    </Master>
  );
}
