'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';

import Master from '@components/Layout/Master';
import Section from '@components/Section/Section';
import Heading from '@components/Heading/Heading';
import ButtonGroup from '@components/Button/ButtonGroup';
import ButtonGroupItem from '@components/Button/ButtonGroupItem';
import Loader from '@components/Loader/Loader';
import Button from '@components/Button/Button';

import useUser from '@hooks/useUser';
import Request from '@utils/Request';
import { getAllEvents, type Event } from '@data/events';

interface ISaleSeat {
  zone?: string;
  row?: string | number;
  seat?: string | number;
  price?: number;
  [key: string]: any;
}

interface ISale {
  _id: string;
  purchaseId: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  documentType?: string;
  documentNumber?: string;
  address?: string;
  city?: string;
  seats?: ISaleSeat[];
  totalPrice?: number;
  purchaseDate?: string;
  event_id?: string;
  reservation_id?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

const EVENTS_MAP = new Map<string, Event>();
try {
  const all = getAllEvents();
  for (const ev of all) {
    EVENTS_MAP.set(String(ev.id), ev);
  }
} catch (_) {}

const resolveEvent = (sale: ISale): Event | undefined => {
  if (sale.event_id && EVENTS_MAP.has(String(sale.event_id))) {
    return EVENTS_MAP.get(String(sale.event_id));
  }
  return undefined;
};

const formatDateEs = (iso?: string): string => {
  if (!iso) return 'Fecha no disponible';
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString('es-CO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
};

const extractDayMonth = (iso?: string): { day: string; month: string } => {
  if (!iso) return { day: '--', month: '---' };
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return { day: '--', month: '---' };
    return {
      day: String(d.getDate()).padStart(2, '0'),
      month: d.toLocaleDateString('es-CO', { month: 'short' }).toUpperCase(),
    };
  } catch {
    return { day: '--', month: '---' };
  }
};

const formatMoney = (v: number | undefined) => {
  const n = typeof v === 'number' ? v : 0;
  try {
    return new Intl.NumberFormat('es-CO').format(n);
  } catch {
    return String(n);
  }
};

const TicketsClient: React.FC = () => {
  const router = useRouter();
  const { user, isLoading: userLoading } = useUser();

  const [sales, setSales] = useState<ISale[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [debug, setDebug] = useState<string[]>([]);
  const [bypassUserLoading, setBypassUserLoading] = useState<boolean>(false);
  const didRunRef = useRef<boolean>(false);
  const timersRef = useRef<number[]>([]);
  const hydrationStartRef = useRef<number>(typeof performance !== 'undefined' ? performance.now() : Date.now());

  const pushDebug = (m: string) => {
    const t = new Date().toLocaleTimeString('es-CO', { hour12: false });
    const line = `[${t}] ${m}`;
    console.log('[MisTickets]', line);
    setDebug((prev) => [...prev.slice(-14), line]);
  };

  const clearTimers = () => {
    timersRef.current.forEach((t) => {
      try { clearTimeout(t as unknown as ReturnType<typeof setTimeout>); } catch (_) {}
      try { clearInterval(t as unknown as ReturnType<typeof setInterval>); } catch (_) {}
    });
    timersRef.current = [];
  };

  const hydrated = !userLoading || bypassUserLoading;

  // ============================================================
  // RED DE SEGURIDAD 1: userLoading NUNCA mas de 2500ms pegado.
  // ============================================================
  useEffect(() => {
    if (!userLoading || bypassUserLoading) return;

    let ticks = 0;
    const tick = window.setInterval(() => {
      ticks += 1;
      const elapsed =
        typeof performance !== 'undefined'
          ? Math.round(performance.now() - hydrationStartRef.current)
          : ticks * 500;
      pushDebug(
        `SIGUE ESPERANDO userLoading=true... ${elapsed}ms transcurridos (user=${
          user ? 'cargado' : 'null'
        }, bypass=${String(bypassUserLoading)})`
      );
    }, 500);
    timersRef.current.push(tick as unknown as number);

    const maxWait = window.setTimeout(() => {
      setBypassUserLoading(true);
      pushDebug(
        '⚠️ ⚠️ ⚠️  TIMEOUT HIDRATACION: Pasaron 2500ms y isLoading seguia true. Forzando continuar (bypassUserLoading=true). Si el usuario sigue en null, lee localStorage a continuacion.'
      );
    }, 2500);
    timersRef.current.push(maxWait as unknown as number);

    return () => {
      try { clearInterval(tick); } catch (_) {}
      try { clearTimeout(maxWait); } catch (_) {}
    };
  }, [userLoading, bypassUserLoading, user]);

  // ============================================================
  // RED DE SEGURIDAD 2: Leer localStorage de forma DIRECTA y mostrar en debug
  // (ignorar UserProvider si hay inconsistencia). Esto nos dice TODO.
  // ============================================================
  useEffect(() => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        pushDebug('⚠️ localStorage no disponible aun (SSR).');
        return;
      }
      const raw = window.localStorage.getItem('user') || '';
      pushDebug(
        `[LOCALSTORAGE] item 'user' raw length=${raw.length} chars. Preview: ${
          raw.length > 0 ? raw.slice(0, 120) + (raw.length > 120 ? '...' : '') : '(VACIO: sin sesion guardada → hay que iniciar sesion primero!)'
        }`
      );
      if (raw.length > 0) {
        try {
          const parsed = JSON.parse(raw);
          pushDebug(
            `[LOCALSTORAGE] Parse OK. Keys: ${Object.keys(parsed).join(', ')}. email=${
              parsed.email || 'NO_EMAIL'}. cedula=${parsed.cedula || 'NO_CEDULA'}. name=${
                parsed.name || 'NO_NAME'
              }`
          );
        } catch (e: any) {
          pushDebug(`[LOCALSTORAGE] ❌ JSON INVALIDO: ${e?.message || e}. Sesion corrupta → hay que borrarla y volver a iniciar.`);
        }
      }
    } catch (e: any) {
      pushDebug(`[LOCALSTORAGE] Excepcion leyendo: ${e?.message || e}`);
    }
  }, [hydrated]);

  useEffect(() => {
    pushDebug(
      `Render userLoading=${String(userLoading)}, bypass=${String(bypassUserLoading)}, hydrated=${String(
        hydrated
      )}, user=${user ? `yes (${user.email || user.cedula || 'sin-email'})` : 'null'}, didRunRef=${String(
        didRunRef.current
      )}`
    );

    if (!hydrated) return;

    // IMPORTANTE: Si user=null NO redirigimos SILENCIOSAMENTE. Mostramos panel AMARILLO explicativo (ver render).
    if (!user) {
      pushDebug(
        'hydrated=true y user=NULL → NO REDIRIGIMOS AUTOMATICAMENTE. Mostrando panel sesion no detectada al usuario.'
      );
      setLoading(false);
      return;
    }

    if (didRunRef.current) {
      pushDebug('ya se ejecutó didRunRef=true, saliendo.');
      return;
    }
    didRunRef.current = true;

    let cancelled = false;

    const timeoutMs = 12000;
    pushDebug(`Iniciando carga de compras... timeout max ${timeoutMs}ms`);

    const maxTimer = window.setTimeout(() => {
      if (cancelled) return;
      pushDebug(`TIMEOUT alcanzado (${timeoutMs}ms). Cargando modo fallback.`);
      setErrorMsg(
        `Tiempo de espera agotado (${Math.round(timeoutMs / 1000)}s). ` +
        'El servidor de backend puede estar encendiéndose. Intenta de nuevo en 30 segundos o contacta soporte.'
      );
      setSales([]);
      setLoading(false);
    }, timeoutMs);
    timersRef.current.push(maxTimer as unknown as number);

    const loadSales = async () => {
      setLoading(true);
      setErrorMsg('');
      try {
        const params = new URLSearchParams();
        if (user.email) {
          params.set('email', user.email);
        } else if (user.cedula) {
          params.set('documentNumber', String(user.cedula));
        } else {
          setErrorMsg('Tu cuenta no tiene email ni cédula guardada. Por favor, vuelve a iniciar sesión.');
          setLoading(false);
          return;
        }

        const endpoint = `api/sales/user${params.toString() ? `?${params.toString()}` : ''}`;
        pushDebug(`Llamando endpoint: ${endpoint}`);

        const res = await Request.getResponse({ url: endpoint, method: 'GET' });
        pushDebug(`Respuesta backend: status=${String(res.status)}`);
        if (cancelled) return;

        if (res.status === 200 && res.data?.results && Array.isArray(res.data.results)) {
          pushDebug(`OK: ${res.data.results.length} compras encontradas.`);
          setSales(res.data.results as ISale[]);
        } else if (res.status === 200 && Array.isArray(res.data as any)) {
          pushDebug(`OK (array directo): ${(res.data as any).length} compras.`);
          setSales(res.data as unknown as ISale[]);
        } else {
          const msg =
            (res.data as any)?.detail ||
            (res.data as any)?.title ||
            'No se pudieron cargar las compras. Inténtalo más tarde.';
          pushDebug(`Respuesta inesperada: ${msg}`);
          setErrorMsg(`${msg}${res.status ? ` (status ${String(res.status)})` : ''}`);
          setSales([]);
        }
      } catch (err: any) {
        if (cancelled) return;
        const mensaje = err?.message || String(err) || 'Error desconocido';
        pushDebug(`ERROR en catch: ${mensaje}`);
        console.error('[MisTickets] Error fetch completo:', err);
        setErrorMsg(
          `Error al conectar con el servidor. ${
            err?.message ? `Detalles: ${err.message}` : 'Intenta de nuevo.'
          }`
        );
        setSales([]);
      } finally {
        try { clearTimeout(maxTimer); } catch (_) {}
        if (!cancelled) {
          pushDebug('Finalizado loading=false.');
          setLoading(false);
        }
      }
    };

    loadSales();

    return () => {
      cancelled = true;
      clearTimers();
    };
  }, [user, userLoading, router]);

  useEffect(() => {
    return () => { clearTimers(); };
  }, []);

  const handleDownloadPdf = async (sale: ISale) => {
    try {
      const BRAND_BLUE = [37, 99, 235];
      const BRAND_DARK = [15, 23, 42];
      const BRAND_ORANGE = [249, 115, 22];
      const BRAND_PURPLE = [79, 70, 229];
      const BRAND_GREEN = [22, 163, 74];
      const MUTED = [100, 116, 139];
      const GRAY_LINE = [203, 213, 225];

      const event = resolveEvent(sale);

      const firstName = sale.firstName || user?.name || 'Usuario';
      const lastName = sale.lastName || user?.lastname || 'QRTixPro';
      const fullName = `${firstName} ${lastName}`.trim();
      const document = `${sale.documentType || 'C.C'} - ${
        sale.documentNumber || user?.cedula || '00000000'
      }`;
      const email = sale.email || user?.email || 'correo@correo.com';
      const phone = sale.phone || user?.telefono || '0000000000';

      const safeSeats =
        sale.seats && Array.isArray(sale.seats) && sale.seats.length > 0
          ? sale.seats.map((s) => ({
              zone: s.zone || 'General',
              row: s.row ?? 'N/A',
              seat: s.seat ?? 'N/A',
              price: typeof s.price === 'number' ? s.price : 0,
            }))
          : [{ zone: 'General', row: 'N/A', seat: 'N/A', price: 0 }];

      const totalPrice = typeof sale.totalPrice === 'number' ? sale.totalPrice : 0;
      const totalTickets = safeSeats.length;
      const purchaseId = sale.purchaseId || `LOCAL-${sale._id || Date.now()}`;

      const eventName = event?.name || 'Evento QRTixPro Oficial';
      const eventDate = event?.date
        ? typeof event.date === 'string'
          ? event.date
          : formatDateEs(String(event.date))
        : sale.purchaseDate
          ? formatDateEs(sale.purchaseDate)
          : 'A confirmar con el organizador';
      const eventVenue = event?.venue || 'Coliseo / Estadio Principal';

      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'letter',
        compress: true,
      });

      const pageW = doc.internal.pageSize.getWidth();
      const pageH = doc.internal.pageSize.getHeight();
      const marginLeft = 10;
      const contentWidth = pageW - marginLeft * 2;

      const drawTicketFrame = () => {
        doc.setDrawColor(BRAND_BLUE[0], BRAND_BLUE[1], BRAND_BLUE[2]);
        doc.setLineWidth(0.8);
        doc.roundedRect(8, 8, pageW - 16, pageH - 16, 2, 2, 'S');
        doc.setDrawColor(GRAY_LINE[0], GRAY_LINE[1], GRAY_LINE[2]);
        doc.setLineWidth(0.2);
        doc.roundedRect(11, 11, pageW - 22, pageH - 22, 1.5, 1.5, 'S');
      };

      const drawLine = (y: number) => {
        doc.setDrawColor(GRAY_LINE[0], GRAY_LINE[1], GRAY_LINE[2]);
        doc.setLineWidth(0.2);
        doc.line(marginLeft, y, pageW - marginLeft, y);
      };

      for (let i = 0; i < totalTickets; i++) {
        if (i > 0) doc.addPage('letter', 'portrait');

        const seat = safeSeats[i];
        const ticketNumber = i + 1;
        const zone = String(seat.zone).toUpperCase();
        const row = String(seat.row);
        const seatNum = String(seat.seat);
        const price = typeof seat.price === 'number' ? seat.price : 0;

        const uniqueTicketId = `QRT-${purchaseId}-${ticketNumber}`;

        const qrPayload = {
          ticketId: uniqueTicketId,
          ticketNumber,
          totalTickets,
          purchaseId,
          event: eventName,
          zone,
          row,
          seat: seatNum,
          price,
          customerName: fullName,
          customerDocument: sale.documentNumber || user?.cedula || '',
          customerEmail: email,
          issuedAt: new Date().toISOString(),
          valid: true,
        };

        let qrDataUrl = '';
        try {
          qrDataUrl = await QRCode.toDataURL(JSON.stringify(qrPayload), {
            errorCorrectionLevel: 'H',
            margin: 1,
            width: 400,
            color: { dark: '#0f172a', light: '#ffffff' },
          });
        } catch (qrErr) {
          console.error('[MisTickets PDF] Error QR:', qrErr);
        }

        drawTicketFrame();

        doc.setFillColor(239, 246, 255);
        doc.roundedRect(11, 11, pageW - 22, 28, 1.5, 1.5, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(26);
        doc.setTextColor(BRAND_BLUE[0], BRAND_BLUE[1], BRAND_BLUE[2]);
        doc.text('QRTixPro', pageW / 2, 29, { align: 'center' });
        doc.setFontSize(10);
        doc.setTextColor(BRAND_DARK[0], BRAND_DARK[1], BRAND_DARK[2]);
        doc.text('BOLETA DIGITAL OFICIAL', pageW / 2, 36, { align: 'center' });

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(MUTED[0], MUTED[1], MUTED[2]);
        doc.text(`Boleta N. ${ticketNumber} de ${totalTickets}`, marginLeft, 48);
        doc.text(`Compra: ${purchaseId}`, marginLeft, 54);
        const emittedAt = new Date().toLocaleString('es-CO');
        doc.text(`Emitido: ${emittedAt}`, marginLeft, 60);

        let yCursor = 68;
        drawLine(yCursor);
        yCursor += 5;

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(13);
        doc.setTextColor(BRAND_BLUE[0], BRAND_BLUE[1], BRAND_BLUE[2]);
        doc.text('EVENTO', marginLeft, yCursor);
        yCursor += 7;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(BRAND_DARK[0], BRAND_DARK[1], BRAND_DARK[2]);
        doc.text(`Evento:  ${eventName}`, marginLeft, yCursor);
        yCursor += 5;
        doc.text(`Fecha y hora: ${eventDate}`, marginLeft, yCursor);
        yCursor += 5;
        doc.text(`Lugar: ${eventVenue}`, marginLeft, yCursor);
        yCursor += 8;

        drawLine(yCursor);
        yCursor += 5;

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(13);
        doc.setTextColor(BRAND_ORANGE[0], BRAND_ORANGE[1], BRAND_ORANGE[2]);
        doc.text('INFORMACION DEL ASIENTO', marginLeft, yCursor);
        yCursor += 8;

        const colW = (contentWidth - 8) / 3;
        const asientoY = yCursor;
        doc.setFillColor(248, 250, 252);
        doc.roundedRect(marginLeft, asientoY, contentWidth, 18, 1.5, 1.5, 'F');
        doc.setFontSize(8);
        doc.setTextColor(MUTED[0], MUTED[1], MUTED[2]);
        doc.setFont('helvetica', 'normal');
        doc.text('Zona', marginLeft + 3, asientoY + 5);
        doc.text('Fila', marginLeft + 3 + colW + 4, asientoY + 5);
        doc.text('Asiento', marginLeft + 3 + (colW + 4) * 2, asientoY + 5);
        doc.setFontSize(11);
        doc.setTextColor(BRAND_DARK[0], BRAND_DARK[1], BRAND_DARK[2]);
        doc.setFont('helvetica', 'bold');
        doc.text(zone, marginLeft + 3, asientoY + 14);
        doc.text(row, marginLeft + 3 + colW + 4, asientoY + 14);
        doc.text(seatNum, marginLeft + 3 + (colW + 4) * 2, asientoY + 14);
        yCursor = asientoY + 24;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(BRAND_DARK[0], BRAND_DARK[1], BRAND_DARK[2]);
        if (price && !Number.isNaN(price)) {
          doc.text(`Valor individual: $${formatMoney(price)} COP`, marginLeft, yCursor);
          yCursor += 5;
        }
        if (totalPrice > 0 && ticketNumber === totalTickets) {
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(11);
          doc.setTextColor(BRAND_GREEN[0], BRAND_GREEN[1], BRAND_GREEN[2]);
          doc.text(`TOTAL COMPRA: $${formatMoney(totalPrice)} COP`, marginLeft, yCursor);
          yCursor += 8;
        } else {
          yCursor += 3;
        }

        drawLine(yCursor);
        yCursor += 5;

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(13);
        doc.setTextColor(BRAND_PURPLE[0], BRAND_PURPLE[1], BRAND_PURPLE[2]);
        doc.text('TITULAR DE LA BOLETA', marginLeft, yCursor);
        yCursor += 7;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(BRAND_DARK[0], BRAND_DARK[1], BRAND_DARK[2]);
        doc.text(`Nombre completo: ${fullName}`, marginLeft, yCursor);
        yCursor += 5;
        doc.text(`Documento: ${document}`, marginLeft, yCursor);
        yCursor += 5;
        doc.text(`Correo: ${email}`, marginLeft, yCursor);
        yCursor += 5;
        doc.text(`Telefono: ${phone}`, marginLeft, yCursor);
        yCursor += 5;
        if (sale.city) {
          doc.text(`Ciudad: ${sale.city}`, marginLeft, yCursor);
          yCursor += 5;
        }
        yCursor += 3;

        drawLine(yCursor);
        yCursor += 6;

        const qrSizeMm = 40;
        const qrX = marginLeft;
        const qrY = yCursor;

        if (qrDataUrl) {
          doc.setDrawColor(BRAND_BLUE[0], BRAND_BLUE[1], BRAND_BLUE[2]);
          doc.setLineWidth(0.4);
          doc.roundedRect(qrX - 1, qrY - 1, qrSizeMm + 2, qrSizeMm + 2, 1, 1, 'S');
          doc.addImage(qrDataUrl, 'PNG', qrX, qrY, qrSizeMm, qrSizeMm, undefined, 'FAST');
          doc.setFontSize(7);
          doc.setTextColor(MUTED[0], MUTED[1], MUTED[2]);
          doc.setFont('helvetica', 'normal');
          doc.text('Escanee este codigo QR a la entrada', qrX + qrSizeMm / 2, qrY + qrSizeMm + 5, {
            align: 'center',
          });
        } else {
          doc.setFillColor(254, 226, 226);
          doc.roundedRect(qrX, qrY, qrSizeMm, qrSizeMm, 1, 1, 'F');
          doc.setFontSize(8);
          doc.setTextColor(153, 27, 27);
          doc.text('(QR no disponible)', qrX + qrSizeMm / 2, qrY + qrSizeMm / 2, {
            align: 'center',
          });
          doc.text(`ID: ${uniqueTicketId}`, qrX + qrSizeMm / 2, qrY + qrSizeMm / 2 + 4, {
            align: 'center',
          });
        }

        const infoX = qrX + qrSizeMm + 6;
        const infoW = pageW - infoX - marginLeft;
        doc.setFontSize(9);
        doc.setTextColor(BRAND_BLUE[0], BRAND_BLUE[1], BRAND_BLUE[2]);
        doc.setFont('helvetica', 'bold');
        doc.text(`ID: ${uniqueTicketId}`, infoX, yCursor + 3);
        yCursor += 8;
        doc.setFontSize(9);
        doc.setTextColor(BRAND_DARK[0], BRAND_DARK[1], BRAND_DARK[2]);
        doc.setFont('helvetica', 'normal');
        const lines = [
          'Esta boleta es intransferible y valida unicamente para la fecha y evento indicados.',
          'Presente esta boleta IMPRESA o DIGITAL + su documento de identidad ORIGINAL a la entrada.',
          'No se aceptan copias ni modificaciones. Cualquier alteracion anula la boleta automaticamente.',
        ];
        const splitLines = lines.map((l) => doc.splitTextToSize(l, infoW));
        let lineY = yCursor + 1;
        for (const block of splitLines) {
          for (const l of block) {
            doc.text(String(l), infoX, lineY);
            lineY += 4.2;
          }
          lineY += 1;
        }

        const footerY = pageH - 18;
        doc.setDrawColor(GRAY_LINE[0], GRAY_LINE[1], GRAY_LINE[2]);
        doc.setLineWidth(0.2);
        doc.line(marginLeft, footerY - 4, pageW - marginLeft, footerY - 4);
        doc.setFontSize(9);
        doc.setTextColor(71, 85, 105);
        doc.setFont('helvetica', 'normal');
        doc.text(
          'QRTixPro - Plataforma oficial de venta y gestion de boletas digitales.',
          pageW / 2,
          footerY,
          { align: 'center' }
        );
        doc.setFontSize(8);
        doc.setTextColor(MUTED[0], MUTED[1], MUTED[2]);
        doc.text(
          'Conserve este comprobante. Para soporte contactese con el organizador del evento.',
          pageW / 2,
          footerY + 5,
          { align: 'center' }
        );
        doc.text(
          `Valido hasta agotar existencia. (c) ${new Date().getFullYear()} QRTixPro - Todos los derechos reservados.   Pag ${ticketNumber} de ${totalTickets}`,
          pageW / 2,
          footerY + 9,
          { align: 'center' }
        );
      }

      const filename = `boletas-qrtixpro-${purchaseId}.pdf`;
      doc.save(filename);
    } catch (error: any) {
      console.error('[MisTickets PDF] ERROR:', error?.message ?? error, error);
      alert(
        `❌ No se pudo descargar la boleta.\n\nError: ${
          error?.message ? error.message : 'Desconocido'
        }\n\nPor favor, intente nuevamente.`
      );
    }
  };

  const showDebug = true;

  if (!hydrated) {
    return (
      <Master>
        <Section className='white-background'>
          <div className='container'>
            <Loader type='inline' color='gray' text='Verificando sesión...' />
            <div
              style={{
                textAlign: 'center',
                marginTop: 14,
                color: 'var(--gray, #64748b)',
                fontSize: '0.9rem',
              }}
            >
              Si esta pantalla dura más de 3 segundos, el sistema continuará automáticamente.
            </div>
            {showDebug && <DebugPanel lines={debug} title='Depuración' />}
          </div>
        </Section>
      </Master>
    );
  }

  // ============================================================
  // ✅ PANEL AMARILLO: Sesión no detectada (hydrated && user === null)
  // Esto reemplaza al redirect silencioso que parecía "pantalla pegada".
  // El usuario VE lo que pasa y tiene botones de acción explícitos.
  // ============================================================
  if (!user) {
    return (
      <Master>
        <Section className='white-background'>
          <div className='container'>
            <div className='center'>
              <Heading type={1} color='gray' text='Mis Tickets' />
              <p className='gray form-information'>
                Puedes acceder a las entradas que compraste desde esta página en cualquier momento.
                Puedes descargarlas en PDF o enviarlas por correo.
              </p>
              <div className='button-container'>
                <ButtonGroup color='gray'>
                  <ButtonGroupItem url='members/tickets' text='Mis Tickets' active />
                  <ButtonGroupItem url='members/account' text='Mi cuenta' />
                </ButtonGroup>
              </div>
            </div>
          </div>
        </Section>

        <Section className='white-background' style={{ paddingTop: 0 }}>
          <div className='container'>
            <div
              className='center'
              style={{
                padding: '44px 24px',
                borderRadius: 'var(--r-lg)',
                background: '#FFFBEB',
                border: '1px solid #FDE68A',
                maxWidth: '720px',
                margin: '0 auto',
              }}
            >
              <span
                className='material-symbols-outlined'
                style={{ fontSize: '3.5rem', color: '#B45309' }}
              >
                person_off
              </span>
              <Heading type={3} color='gray' text='No pudimos detectar tu sesión' style={{ marginTop: '12px' }} />
              <p className='gray' style={{ marginTop: '10px', marginBottom: '8px' }}>
                Para consultar tus tickets comprados, <strong>debes iniciar sesión primero</strong> con la misma
                cuenta con la que los compraste.
              </p>
              <p
                style={{
                  marginTop: 0,
                  color: '#92400E',
                  fontSize: '0.92rem',
                  maxWidth: 620,
                  marginLeft: 'auto',
                  marginRight: 'auto',
                  lineHeight: 1.5,
                }}
              >
                💡 <strong>Si crees que ya iniciaste sesión:</strong> puede que tu sesión haya expirado,
                que estés en el navegador de incógnito, o que tengas bloqueadas las cookies.
                Vuelve a iniciar sesión y revisa.
              </p>

              <div
                style={{
                  display: 'flex',
                  gap: '12px',
                  justifyContent: 'center',
                  flexWrap: 'wrap',
                  marginTop: '20px',
                }}
              >
                <Link href='/members/signin' style={{ textDecoration: 'none' }}>
                  <Button type='button' color='blue-filled' text='Iniciar sesión ahora' />
                </Link>
                <Link href='/' style={{ textDecoration: 'none' }}>
                  <button className='button gray-overlay' style={{ cursor: 'pointer' }}>
                    Volver al inicio
                  </button>
                </Link>
              </div>
            </div>

            {showDebug && <DebugPanel lines={debug} title='Estado de carga' style={{ marginTop: 28 }} />}
          </div>
        </Section>
      </Master>
    );
  }

  return (
    <Master>
      <Section className='white-background'>
        <div className='container'>
          <div className='center'>
            <Heading type={1} color='gray' text='Mis Tickets' />
            <p className='gray form-information'>
              Puedes acceder a las entradas que compraste desde esta página en cualquier momento.
              Puedes descargarlas en PDF o enviarlas por correo.
            </p>
            <div className='button-container'>
              <ButtonGroup color='gray'>
                <ButtonGroupItem url='members/tickets' text='Mis Tickets' active />
                <ButtonGroupItem url='members/account' text='Mi cuenta' />
              </ButtonGroup>
            </div>
            {showDebug && <DebugPanel lines={debug} title='Estado de carga' style={{ marginTop: 28 }} />}
          </div>
        </div>
      </Section>

      <Section className='white-background' style={{ paddingTop: 0 }}>
        <div className='container'>
          {loading ? (
            <div style={{ padding: '60px 0' }}>
              <Loader type='inline' color='gray' text='Cargando tus compras...' />
              <div
                style={{
                  textAlign: 'center',
                  marginTop: 14,
                  color: 'var(--gray, #64748b)',
                  fontSize: '0.9rem',
                }}
              >
                Si el servidor está encendiendo, esto puede tomar hasta 15 segundos la primera vez.
              </div>
            </div>
          ) : errorMsg ? (
            <div
              className='center'
              style={{
                padding: '40px 20px',
                borderRadius: 'var(--r-lg)',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                maxWidth: '650px',
                margin: '0 auto',
              }}
            >
              <span
                className='material-symbols-outlined'
                style={{ fontSize: '3rem', color: '#dc2626' }}
              >
                error
              </span>
              <Heading type={3} color='gray' text='No pudimos cargar tus compras' style={{ marginTop: '8px' }} />
              <p className='gray' style={{ marginTop: '10px', marginBottom: '18px' }}>
                {errorMsg}
              </p>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link href='/list' style={{ textDecoration: 'none' }}>
                  <Button type='button' color='blue-filled' text='Ver eventos' />
                </Link>
                <button
                  onClick={() => {
                    pushDebug('Reintento manual del usuario.');
                    didRunRef.current = false;
                    setLoading(true);
                    const params = new URLSearchParams();
                    if (user?.email) params.set('email', user.email);
                    else if (user?.cedula) params.set('documentNumber', String(user.cedula));
                    window.location.href = params.toString()
                      ? `/members/tickets?${params.toString()}`
                      : '/members/tickets';
                  }}
                  className='button gray-overlay'
                  style={{ cursor: 'pointer' }}
                >
                  Reintentar
                </button>
              </div>
            </div>
          ) : sales.length === 0 ? (
            <div
              className='center'
              style={{
                padding: '60px 20px',
                borderRadius: 'var(--r-lg)',
                background: 'var(--ink-50, #f8fafc)',
                border: '1px dashed var(--ink-200, #e2e8f0)',
                maxWidth: '650px',
                margin: '0 auto',
              }}
            >
              <span
                className='material-symbols-outlined'
                style={{ fontSize: '4rem', color: 'var(--dark-gray, #64748b)' }}
              >
                confirmation_number
              </span>
              <Heading type={3} color='gray' text='Aún no tienes compras' style={{ marginTop: '12px' }} />
              <p className='gray' style={{ marginTop: '10px', marginBottom: '20px' }}>
                Una vez que realices una compra, las entradas aparecerán aquí. ¡Explora nuestros eventos!
              </p>
              <Link href='/list' style={{ textDecoration: 'none' }}>
                <Button type='button' color='blue-filled' text='Ver todos los eventos' />
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {sales.map((sale) => {
                const event = resolveEvent(sale);
                const eventName = event?.name || 'Evento QRTixPro';
                const eventDate = event?.date
                  ? String(event.date)
                  : sale.purchaseDate || sale.createdAt || '';
                const eventVenue = event?.venue || 'Lugar por confirmar';
                const dm = extractDayMonth(eventDate || sale.purchaseDate || sale.createdAt);
                const purchaseCode =
                  sale.purchaseId?.slice(-6).toUpperCase() || sale._id?.slice(-6).toUpperCase() || '------';
                const seatsCount = Array.isArray(sale.seats) ? sale.seats.length : 1;
                const purchaseDate = formatDateEs(sale.createdAt || sale.purchaseDate);
                const totalPrice = typeof sale.totalPrice === 'number' ? sale.totalPrice : 0;
                const seatsSummary = Array.isArray(sale.seats)
                  ? sale.seats
                      .map((s) => `${s.zone || 'General'}${s.row ? ` F${s.row}` : ''}${s.seat ? ` S${s.seat}` : ''}`)
                      .join(', ')
                  : 'General';

                return (
                  <div key={sale._id || sale.purchaseId} className='ticket-item'>
                    <div className='item-right'>
                      <h2>{dm.day}</h2>
                      <p>{dm.month}</p>
                      <span className='material-symbols-outlined'>qr_code_2</span>
                      <strong>{purchaseCode}</strong>
                      <span className='up-border'></span>
                      <span className='down-border'></span>
                    </div>
                    <div className='item-left'>
                      <h5 style={{ marginBottom: '10px' }}>{eventName}</h5>
                      <p style={{ margin: '4px 0' }}>
                        <span className='material-symbols-outlined'>event</span>
                        {purchaseDate}
                      </p>
                      <p style={{ margin: '4px 0' }}>
                        <span className='material-symbols-outlined'>location_on</span>
                        {eventVenue}
                      </p>
                      <p style={{ margin: '4px 0' }}>
                        <span className='material-symbols-outlined'>chair</span>
                        {seatsCount} asiento{seatsCount !== 1 ? 's' : ''}: {seatsSummary}
                      </p>
                      <p style={{ margin: '4px 0' }}>
                        <span className='material-symbols-outlined'>payments</span>
                        Total: <strong>${formatMoney(totalPrice)} COP</strong>
                        <span style={{ marginLeft: '14px', color: 'var(--gray, #64748b)' }}>
                          Compra: <code>{sale.purchaseId || sale._id}</code>
                        </span>
                      </p>
                      <div className='actions'>
                        <button
                          type='button'
                          onClick={() => handleDownloadPdf(sale)}
                          className='button blue-filled button-sm'
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            cursor: 'pointer',
                            padding: '10px 16px',
                            borderRadius: 'var(--r-md)',
                            border: 'none',
                            textDecoration: 'none',
                            fontSize: '0.95em',
                          }}
                        >
                          <span className='material-symbols-outlined' style={{ fontSize: '1.2em' }}>
                            picture_as_pdf
                          </span>
                          Descargar Entrada
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Section>
    </Master>
  );
};

const DebugPanel: React.FC<{ lines: string[]; title: string; style?: React.CSSProperties }> = ({
  lines,
  title,
  style,
}) => (
  <div
    style={{
      maxWidth: 720,
      margin: '0 auto',
      textAlign: 'left',
      background: '#f1f5f9',
      border: '1px solid #cbd5e1',
      borderRadius: 12,
      padding: '14px 18px',
      fontSize: 12,
      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
      lineHeight: 1.55,
      color: '#0f172a',
      ...style,
    }}
  >
    <div
      style={{
        fontSize: 13,
        fontWeight: 700,
        marginBottom: 6,
        color: '#334155',
        fontFamily: 'inherit',
      }}
    >
      🔎 {title}
    </div>
    {lines.length === 0 ? (
      <div style={{ color: '#64748b', fontFamily: 'inherit' }}>
        (aún no hay eventos de depuración. si se mantiene así, revisa que el usuario sí esté cargado en localStorage.)
      </div>
    ) : (
      lines.map((l, i) => (
        <div key={i} style={{ color: i === lines.length - 1 ? '#1d4ed8' : '#475569', fontFamily: 'inherit' }}>
          • {l}
        </div>
      ))
    )}
  </div>
);

export default TicketsClient;
