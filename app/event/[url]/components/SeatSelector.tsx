'use client';

import React, { useState, useMemo, useEffect } from 'react';
import './SeatSelector.css';
import { Event } from '@data/events';
import useUser from '@hooks/useUser';

interface Seat {
  id: string;
  row: number;
  number: number;
  zone: 'occidental' | 'oriental' | 'sur' | 'norte';
  price: number;
  available: boolean;
  cx: number;
  cy: number;
}

interface GeneralZone {
  id: string;
  zone: 'sur' | 'norte';
  price: number;
  capacity: number;
  selected: boolean;
}

interface SeatSelectorProps {
  event: Event;
  onSeatSelection: (seats: Seat[], generalZones: GeneralZone[], total: number) => void;
}

const zonePrices = {
  occidental: 85000,
  oriental: 85000,
  sur: 45000,
  norte: 45000,
};

const zoneNames: Record<string, string> = {
  occidental: 'OCCIDENTAL',
  oriental: 'ORIENTAL',
  sur: 'SUR',
  norte: 'NORTE',
};

const zoneColors: Record<string, { fill: string; hover: string; label: string }> = {
  occidental: { fill: '#9c27b0', hover: '#ba68c8', label: 'OCCIDENTAL $85.000' },
  oriental: { fill: '#e91e63', hover: '#f06292', label: 'ORIENTAL $85.000' },
  sur: { fill: '#4caf50', hover: '#81c784', label: 'SUR $45.000' },
  norte: { fill: '#ff9800', hover: '#ffb74d', label: 'NORTE $45.000' },
};

const SVG_W = 1280;
const SVG_H = 820;
const CX = SVG_W / 2;
const CY = SVG_H / 2;

const STADIUM_OUTER_RX = 490;
const STADIUM_OUTER_RY = 310;
const STADIUM_INNER_RX = 380;
const STADIUM_INNER_RY = 210;

const FIELD_W = 470;
const FIELD_H = 250;

const NUM_ROWS_SHORT = 9;
const NUM_SEATS_PER_ROW_SHORT = 42;
const NUM_ROWS_LONG = 12;
const NUM_SEATS_PER_ROW_LONG = 46;

const ZONE_LIMITS: Record<
  'norte' | 'sur' | 'oriental' | 'occidental',
  { startDeg: number; endDeg: number; midDeg: number }
> = {
  occidental:{ startDeg: 215, endDeg: 325, midDeg: 270 },
  oriental:  { startDeg: 35,  endDeg: 145, midDeg: 90 },
  norte:     { startDeg: 145, endDeg: 215, midDeg: 180 },
  sur:       { startDeg: 325, endDeg: 395, midDeg: 0 },
};

const API_URL = (() => {
  if (typeof process !== 'undefined' && (process as any).env?.NEXT_PUBLIC_BACKEND_URL) {
    return (process as any).env.NEXT_PUBLIC_BACKEND_URL;
  }
  if (typeof window === 'undefined') return '';
  const hostname = window.location.hostname;
  if (hostname === 'localhost' || hostname === '127.0.0.1') return 'http://localhost:8000';
  return ((window as any).__API_URL__ as string) ?? '';
})();

function uuidv4(): string {
  if (typeof crypto !== 'undefined' && (crypto as any).randomUUID) return (crypto as any).randomUUID();
  return 'sess_' + Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
}

function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return '';
  let sid = localStorage.getItem('qrtix_session_id');
  if (!sid) {
    sid = uuidv4();
    localStorage.setItem('qrtix_session_id', sid);
  }
  return sid;
}

function seatKey(zone: string, row: number, seat: number): string {
  return `${zone.toLowerCase()}|${+row}|${+seat}`;
}

function generateArcSeats(
  zone: 'norte' | 'sur' | 'oriental' | 'occidental',
): Seat[] {
  const seats: Seat[] = [];
  const price = zonePrices[zone];
  const limits = ZONE_LIMITS[zone];
  const isShort = zone === 'norte' || zone === 'sur';
  const numRows = isShort ? NUM_ROWS_SHORT : NUM_ROWS_LONG;
  const baseSeats = isShort ? NUM_SEATS_PER_ROW_SHORT : NUM_SEATS_PER_ROW_LONG;

  for (let row = 0; row < numRows; row++) {
    const t = row / (numRows - 1);
    const rx = STADIUM_INNER_RX + 10 + t * (STADIUM_OUTER_RX - STADIUM_INNER_RX - 18);
    const ry = STADIUM_INNER_RY + 10 + t * (STADIUM_OUTER_RY - STADIUM_INNER_RY - 18);
    const spreadDeg = limits.endDeg - limits.startDeg;
    const extra = isShort ? Math.floor(t * 10) : Math.floor(t * 12);
    const seatCount = baseSeats + extra;
    for (let n = 0; n < seatCount; n++) {
      const frac = seatCount === 1 ? 0.5 : n / (seatCount - 1);
      const deg = limits.startDeg + spreadDeg * frac;
      const ang = (deg * Math.PI) / 180;
      const cx = CX + rx * Math.cos(ang);
      const cy = CY + ry * Math.sin(ang);
      seats.push({
        id: `${zone}-${row + 1}-${n + 1}`,
        row: row + 1,
        number: n + 1,
        zone,
        price,
        available: true,
        cx,
        cy,
      });
    }
  }
  return seats;
}

function footballField(): React.ReactNode {
  const fx = CX - FIELD_W / 2;
  const fy = CY - FIELD_H / 2;
  return (
    <g>
      <rect
        x={fx}
        y={fy}
        width={FIELD_W}
        height={FIELD_H}
        fill="url(#fieldPattern)"
        stroke="#ffffff"
        strokeWidth={3}
        rx={2}
      />
      <line
        x1={CX}
        y1={fy}
        x2={CX}
        y2={fy + FIELD_H}
        stroke="#ffffff"
        strokeWidth={2.5}
      />
      <circle cx={CX} cy={CY} r={40} stroke="#ffffff" strokeWidth={2.5} fill="none" />
      <circle cx={CX} cy={CY} r={2} fill="#ffffff" />
      <rect
        x={fx}
        y={CY - 80}
        width={80}
        height={160}
        stroke="#ffffff"
        strokeWidth={2.5}
        fill="none"
      />
      <rect
        x={fx}
        y={CY - 42}
        width={32}
        height={84}
        stroke="#ffffff"
        strokeWidth={2.5}
        fill="none"
      />
      <path
        d={`M ${fx + 80} ${CY - 28} A 28 28 0 0 1 ${fx + 80} ${CY + 28}`}
        stroke="#ffffff"
        strokeWidth={2.5}
        fill="none"
      />
      <rect
        x={fx + FIELD_W - 80}
        y={CY - 80}
        width={80}
        height={160}
        stroke="#ffffff"
        strokeWidth={2.5}
        fill="none"
      />
      <rect
        x={fx + FIELD_W - 32}
        y={CY - 42}
        width={32}
        height={84}
        stroke="#ffffff"
        strokeWidth={2.5}
        fill="none"
      />
      <path
        d={`M ${fx + FIELD_W - 80} ${CY - 28} A 28 28 0 0 0 ${fx + FIELD_W - 80} ${CY + 28}`}
        stroke="#ffffff"
        strokeWidth={2.5}
        fill="none"
      />
      <rect
        x={fx - 1}
        y={CY - 42}
        width={2}
        height={84}
        fill="#ffffff"
      />
      <rect
        x={fx + FIELD_W - 1}
        y={CY - 42}
        width={2}
        height={84}
        fill="#ffffff"
      />
    </g>
  );
}

function curveText(
  id: string,
  text: string,
  pathD: string,
  fill: string,
  fontSize: number,
  letterSpacing = 10,
): React.ReactNode {
  return (
    <g>
      <defs>
        <path id={id} d={pathD} fill="none" />
      </defs>
      <text
        fill={fill}
        fontSize={fontSize}
        fontWeight="700"
        letterSpacing={letterSpacing}
        style={{ fontFamily: "'Arial Black', Arial, sans-serif" }}
      >
        <textPath href={`#${id}`} startOffset="50%" textAnchor="middle">
          {text}
        </textPath>
      </text>
    </g>
  );
}

const SeatSelector: React.FC<SeatSelectorProps> = ({ event, onSeatSelection }) => {
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
  const [occupiedKeys, setOccupiedKeys] = useState<Set<string>>(new Set());
  const [sessionId, setSessionId] = useState<string>('');
  const [seatStats, setSeatStats] = useState<{ sold: number; reserved: number }>({ sold: 0, reserved: 0 });
  const [isBooking, setIsBooking] = useState(false);
  const { isAuthenticated } = useUser();

  useEffect(() => {
    setSessionId(getOrCreateSessionId());
  }, []);

  const isStadium =
    event.venue.toLowerCase().includes('estadio') ||
    event.venue.toLowerCase().includes('rey pelé');

  const allSeats = useMemo(() => {
    if (!isStadium) return [];
    return [
      ...generateArcSeats('norte'),
      ...generateArcSeats('sur'),
      ...generateArcSeats('occidental'),
      ...generateArcSeats('oriental'),
    ];
  }, [isStadium]);

  const occidentalSeats = useMemo(() => {
    const s: Seat[] = [];
    const rows = 18;
    const seatsPerRow = 35;
    for (let row = 1; row <= rows; row++) {
      for (let seatNum = 1; seatNum <= seatsPerRow; seatNum++) {
        s.push({
          id: `occidental-${row}-${seatNum}`,
          row,
          number: seatNum,
          zone: 'occidental',
          price: zonePrices.occidental,
          available: true,
          cx: 0,
          cy: 0,
        });
      }
    }
    return s;
  }, []);
  const orientalSeats = useMemo(() => {
    const s: Seat[] = [];
    const rows = 18;
    const seatsPerRow = 35;
    for (let row = 1; row <= rows; row++) {
      for (let seatNum = 1; seatNum <= seatsPerRow; seatNum++) {
        s.push({
          id: `oriental-${row}-${seatNum}`,
          row,
          number: seatNum,
          zone: 'oriental',
          price: zonePrices.oriental,
          available: true,
          cx: 0,
          cy: 0,
        });
      }
    }
    return s;
  }, []);
  const surSeats = useMemo(() => {
    const s: Seat[] = [];
    const rows = 22;
    const seatsPerRow = 45;
    for (let row = 1; row <= rows; row++) {
      for (let seatNum = 1; seatNum <= seatsPerRow; seatNum++) {
        s.push({
          id: `sur-${row}-${seatNum}`,
          row,
          number: seatNum,
          zone: 'sur',
          price: zonePrices.sur,
          available: true,
          cx: 0,
          cy: 0,
        });
      }
    }
    return s;
  }, []);
  const norteSeats = useMemo(() => {
    const s: Seat[] = [];
    const rows = 22;
    const seatsPerRow = 45;
    for (let row = 1; row <= rows; row++) {
      for (let seatNum = 1; seatNum <= seatsPerRow; seatNum++) {
        s.push({
          id: `norte-${row}-${seatNum}`,
          row,
          number: seatNum,
          zone: 'norte',
          price: zonePrices.norte,
          available: true,
          cx: 0,
          cy: 0,
        });
      }
    }
    return s;
  }, []);

  // ========= POLLING: Cada 15s y al enfocar ventana, actualizar ocupados =========
  const fetchSeatsStatus = async () => {
    try {
      if (!event?.id || !sessionId) return;
      const resp = await fetch(
        `${API_URL}/api/seats/status/${encodeURIComponent(event.id)}?session_id=${encodeURIComponent(sessionId)}`,
      );
      if (!resp.ok) return;
      const data = await resp.json();
      const res = data.results;
      if (!res) return;
      const occ: Array<{ zone: string; row: number; seat: number }> = res.occupied ?? [];
      const newSet = new Set<string>();
      for (const s of occ) newSet.add(seatKey(s.zone, s.row, s.seat));
      setOccupiedKeys(newSet);
      setSeatStats({
        sold: res.stats?.sold_count ?? 0,
        reserved: res.stats?.reserved_others_count ?? 0,
      });
      // Si alguno de los asientos que tenía seleccionado ahora está ocupado -> quitarlo
      if (newSet.size) {
        setSelectedSeats((prev) => {
          const filtered = prev.filter(
            (s) => !newSet.has(seatKey(s.zone, s.row, s.number)),
          );
          if (filtered.length !== prev.length) {
            const tot = filtered.reduce((sum, x) => sum + x.price, 0);
            onSeatSelection(filtered, [], tot);
          }
          return filtered;
        });
      }
    } catch (err) {
      // ignore
    }
  };

  useEffect(() => {
    if (!event?.id || !sessionId) return;
    fetchSeatsStatus();
    const poll = window.setInterval(fetchSeatsStatus, 15000);
    const onFocus = () => fetchSeatsStatus();
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onFocus);
    return () => {
      clearInterval(poll);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onFocus);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event?.id, sessionId]);

  const isSeatOccupied = (seat: Seat): boolean => {
    return occupiedKeys.has(seatKey(seat.zone, seat.row, seat.number));
  };

  const handleSeatClick = (seat: Seat) => {
    if (!seat.available) return;
    if (isSeatOccupied(seat)) return;
    const isSelected = selectedSeats.some((s) => s.id === seat.id);
    let newSelected: Seat[];
    if (isSelected) {
      newSelected = selectedSeats.filter((s) => s.id !== seat.id);
    } else {
      newSelected = [...selectedSeats, seat];
    }
    setSelectedSeats(newSelected);
    const total = newSelected.reduce((sum, s) => sum + s.price, 0);
    onSeatSelection(newSelected, [], total);
  };

  const total = selectedSeats.reduce((sum, s) => sum + s.price, 0);

  // ======= Al dar a Comprar: RESERVAR en backend primero =======
  const handlePurchase = async () => {
    if (!isAuthenticated) {
      alert('Debes iniciar sesión para comprar entradas');
      window.location.href = '/members/signin';
      return;
    }
    if (!selectedSeats.length) return;
    if (!sessionId) {
      setSessionId(getOrCreateSessionId());
      return;
    }
    if (isBooking) return;
    setIsBooking(true);
    try {
      const payload = {
        event_id: event.id,
        session_id: sessionId,
        seats: selectedSeats.map((s) => ({
          zone: s.zone,
          row: s.row,
          seat: s.number,
          price: s.price,
        })),
      };
      const resp = await fetch(`${API_URL}/api/seats/reserve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (resp.status === 409) {
        // Conflicto: asientos ocupados
        let details: any = null;
        try {
          details = await resp.json();
        } catch {}
        const occupiedList: any[] = details?.detail?.occupied_seats ?? [];
        const conflictSet = new Set(occupiedList.map((s) => seatKey(s.zone, s.row, s.seat)));
        // Quitar seleccionados
        const stillAvailable = selectedSeats.filter(
          (s) => !conflictSet.has(seatKey(s.zone, s.row, s.number)),
        );
        setSelectedSeats(stillAvailable);
        const tot = stillAvailable.reduce((sum, s) => sum + s.price, 0);
        onSeatSelection(stillAvailable, [], tot);
        // Actualizar estado ocupados
        fetchSeatsStatus();
        const seatsStr = occupiedList.length
          ? occupiedList.map((s) => `${zoneNames[s.zone] || s.zone.toUpperCase()} F${s.row} A${s.seat}`).join(', ')
          : 'algunos asientos';
        alert(
          `⚠️ Algunos asientos ya fueron ocupados por otra persona y fueron retirados de tu selección:\n\n${seatsStr}\n\nIntenta con otros asientos.`,
        );
        setIsBooking(false);
        return;
      }

      if (!resp.ok) {
        alert('Error al reservar los asientos. Intenta de nuevo.');
        setIsBooking(false);
        return;
      }

      const data = await resp.json();
      const res = data.results;
      const expiresAt = res?.expires_at
        ? new Date(res.expires_at).toISOString()
        : new Date(Date.now() + 15 * 60 * 1000).toISOString();
      const purchaseData = {
        seats: selectedSeats.map((s) => ({
          zone: s.zone,
          row: s.row,
          seat: s.number,
          price: s.price,
        })),
        totalPrice: total,
        timestamp: new Date().toISOString(),
        reservation_id: res?.reservation_id,
        session_id: sessionId,
        event_id: event.id,
        expires_at: expiresAt,
        reservation_seconds_left: res?.seconds_left ?? 900,
      };
      localStorage.setItem('purchaseData', JSON.stringify(purchaseData));
      window.location.href = '/purchase';
    } catch (err) {
      console.error('Purchase reserve error:', err);
      alert('Error al reservar asientos. Verifica la conexión con el backend.');
    } finally {
      setIsBooking(false);
    }
  };

  const renderSeatSVG = (seat: Seat) => {
    const isSelected = selectedSeats.some((s) => s.id === seat.id);
    const occupied = isSeatOccupied(seat);
    const color = zoneColors[seat.zone];
    const fill = occupied
      ? '#cbd5e1'
      : isSelected
      ? '#ffffff'
      : seat.available
      ? color.fill
      : '#757575';
    const stroke = occupied
      ? 'rgba(100,116,139,0.35)'
      : isSelected
      ? '#111827'
      : 'rgba(255,255,255,0.5)';
    const strokeWidth = occupied ? 0.3 : isSelected ? 1.5 : 0.4;
    const opacity = occupied ? 0.55 : seat.available ? 1 : 0.35;
    const cursor = occupied ? 'not-allowed' : seat.available ? 'pointer' : 'not-allowed';
    return (
      <circle
        key={seat.id}
        cx={seat.cx}
        cy={seat.cy}
        r={isSelected ? 4.6 : 3.1}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        opacity={opacity}
        style={{ cursor }}
        className={`stadium-seat ${occupied ? 'occupied' : seat.available ? 'available' : 'occupied'} ${isSelected ? 'selected' : ''}`}
        onClick={() => handleSeatClick(seat)}
        data-zone={seat.zone}
      >
        <title>
          {occupied
            ? `${zoneNames[seat.zone]} · Fila ${seat.row} · Asiento ${seat.number} · OCUPADO`
            : `${zoneNames[seat.zone]} · Fila ${seat.row} · Asiento ${seat.number} · $${seat.price.toLocaleString()}`}
        </title>
      </circle>
    );
  };

  const renderTribune = (
    seats: Seat[],
    tribuneName: string,
    zoneKey: string,
  ) => {
    const rows = Array.from(new Set(seats.map((seat) => seat.row))).sort(
      (a, b) => a - b,
    );
    const getSeatsForRow = (
      rowIndex: number,
      totalRows: number,
      totalSeatsPerRow: number,
    ) => {
      if (zoneKey === 'norte' || zoneKey === 'sur') {
        return Math.max(1, Math.floor(totalSeatsPerRow * 0.85));
      } else {
        return Math.max(1, Math.floor(totalSeatsPerRow * 0.85));
      }
    };
    return (
      <div className={`tribune ${zoneKey}-tribune`}>
        <div className="tribune-header">
          <h3>{tribuneName}</h3>
          <span className="price">
            $
            {zonePrices[zoneKey as keyof typeof zonePrices].toLocaleString()}
          </span>
        </div>
        <div className="seats-container">
          {rows.map((row, rowIndex) => {
            const rowSeats = seats
              .filter((seat) => seat.row === row)
              .sort((a, b) => a.number - b.number);
            const seatsToShow = getSeatsForRow(
              rowIndex,
              rows.length,
              rowSeats.length,
            );
            const visibleSeats = rowSeats.slice(0, seatsToShow);
            return (
              <div key={row} className="seat-row">
                {visibleSeats.map((s) => {
                  const isSelected = selectedSeats.some((x) => x.id === s.id);
                  const occ = isSeatOccupied(s);
                  return (
                    <div
                      key={s.id}
                      className={`seat ${
                        occ ? 'occupied' : s.available ? 'available' : 'occupied'
                      } ${isSelected ? 'selected' : ''}`}
                      style={occ ? { opacity: 0.5, background: '#cbd5e1', cursor: 'not-allowed' } : {}}
                      onClick={() => handleSeatClick(s)}
                      title={
                        occ
                          ? `OCUPADO · Fila ${s.row}, Asiento ${s.number}`
                          : `Fila ${s.row}, Asiento ${s.number} - $${s.price.toLocaleString()}`
                      }
                    />
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="seat-selector">
      <div className="stadium-container">
        {isStadium ? (
          <div className="stadium-layout-oval">
            <div className="live-status-bar">
              <div className="live-dot" />
              <span>Actualización en vivo</span>
              <span className="sep">·</span>
              <span>Vendidos: <b>{seatStats.sold}</b></span>
              <span className="sep">·</span>
              <span>En proceso de compra: <b>{seatStats.reserved}</b></span>
            </div>
            <svg
              viewBox={`0 0 ${SVG_W} ${SVG_H}`}
              className="stadium-svg"
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                <radialGradient id="stadiumBg" cx="50%" cy="50%" r="65%">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
                  <stop offset="100%" stopColor="#f0f4f8" stopOpacity="1" />
                </radialGradient>
                <linearGradient id="fieldPattern" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2f9e44" />
                  <stop offset="50%" stopColor="#37b24d" />
                  <stop offset="100%" stopColor="#2f9e44" />
                </linearGradient>
                <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#000" floodOpacity="0.12" />
                </filter>
              </defs>

              <ellipse
                cx={CX}
                cy={CY}
                rx={STADIUM_OUTER_RX + 20}
                ry={STADIUM_OUTER_RY + 20}
                fill="#ffffff"
                stroke="#e5e7eb"
                strokeWidth={2}
              />

              <ellipse
                cx={CX}
                cy={CY}
                rx={STADIUM_OUTER_RX}
                ry={STADIUM_OUTER_RY}
                fill="#f3f4f6"
                stroke="#d1d5db"
                strokeWidth={2}
                filter="url(#softShadow)"
              />

              {/* OCCIDENTAL tribuna background arc (morado claro) — 215° a 325° (ARRIBA) */}
              <path
                d={describeAnnulusSector(CX, CY, STADIUM_OUTER_RX - 2, STADIUM_OUTER_RY - 2, STADIUM_INNER_RX + 2, STADIUM_INNER_RY + 2, ZONE_LIMITS.occidental.startDeg, ZONE_LIMITS.occidental.endDeg)}
                fill="#f3f0ff"
                stroke="#d0bfff"
                strokeWidth={1.5}
              />
              {/* ORIENTAL tribuna background arc (rosa claro) — 35° a 145° (ABAJO) */}
              <path
                d={describeAnnulusSector(CX, CY, STADIUM_OUTER_RX - 2, STADIUM_OUTER_RY - 2, STADIUM_INNER_RX + 2, STADIUM_INNER_RY + 2, ZONE_LIMITS.oriental.startDeg, ZONE_LIMITS.oriental.endDeg)}
                fill="#fff0f6"
                stroke="#fcc2d7"
                strokeWidth={1.5}
              />
              {/* NORTE tribuna background arc (naranja claro) — 145° a 215° (IZQUIERDA) */}
              <path
                d={describeAnnulusSector(CX, CY, STADIUM_OUTER_RX - 2, STADIUM_OUTER_RY - 2, STADIUM_INNER_RX + 2, STADIUM_INNER_RY + 2, ZONE_LIMITS.norte.startDeg, ZONE_LIMITS.norte.endDeg)}
                fill="#fff4e6"
                stroke="#ffd8a8"
                strokeWidth={1.5}
              />
              {/* SUR tribuna background arc (verde claro) — 325° a 395° (DERECHA, pasa por 0°) */}
              <path
                d={describeAnnulusSector(CX, CY, STADIUM_OUTER_RX - 2, STADIUM_OUTER_RY - 2, STADIUM_INNER_RX + 2, STADIUM_INNER_RY + 2, ZONE_LIMITS.sur.startDeg, ZONE_LIMITS.sur.endDeg)}
                fill="#ebfbee"
                stroke="#b2f2bb"
                strokeWidth={1.5}
              />

              <ellipse
                cx={CX}
                cy={CY}
                rx={STADIUM_INNER_RX}
                ry={STADIUM_INNER_RY}
                fill="url(#stadiumBg)"
                stroke="#9ca3af"
                strokeWidth={2}
              />

              {footballField()}

              {allSeats.map(renderSeatSVG)}

              {curveText(
                'labelOcc',
                zoneColors.occidental.label,
                `M ${CX - 380} ${CY - 355} A 540 370 0 0 1 ${CX + 380} ${CY - 355}`,
                '#7950f2',
                23,
                18,
              )}
              {curveText(
                'labelOri',
                zoneColors.oriental.label,
                `M ${CX + 380} ${CY + 360} A 540 370 0 0 1 ${CX - 380} ${CY + 360}`,
                '#e03131',
                23,
                18,
              )}
              {curveText(
                'labelNorte',
                zoneColors.norte.label,
                `M ${CX - 605} ${CY - 150} A 610 360 0 0 0 ${CX - 605} ${CY + 150}`,
                '#fd7e14',
                20,
                14,
              )}
              {curveText(
                'labelSur',
                zoneColors.sur.label,
                `M ${CX + 605} ${CY + 150} A 610 360 0 0 0 ${CX + 605} ${CY - 150}`,
                '#2f9e44',
                20,
                14,
              )}

              <text
                x={CX}
                y={CY - FIELD_H / 2 - 24}
                textAnchor="middle"
                fill="#343a40"
                fontSize={13}
                fontWeight="700"
                letterSpacing={3}
                style={{ fontFamily: "'Arial Black', Arial, sans-serif" }}
              >
                ESTADIO BELLO HORIZONTE · VILLAVICENCIO
              </text>
            </svg>

            <div className="legend-row">
              <div className="legend-item"><span className="dot" style={{ background: zoneColors.norte.fill }} />NORTE · ${zonePrices.norte.toLocaleString()}</div>
              <div className="legend-item"><span className="dot" style={{ background: zoneColors.sur.fill }} />SUR · ${zonePrices.sur.toLocaleString()}</div>
              <div className="legend-item"><span className="dot" style={{ background: zoneColors.occidental.fill }} />OCCIDENTAL · ${zonePrices.occidental.toLocaleString()}</div>
              <div className="legend-item"><span className="dot" style={{ background: zoneColors.oriental.fill }} />ORIENTAL · ${zonePrices.oriental.toLocaleString()}</div>
              <div className="legend-item"><span className="dot selected" />SELECCIONADO</div>
              <div className="legend-item"><span className="dot occupied" />OCUPADO / RESERVADO</div>
            </div>
          </div>
        ) : (
          <div className="arena-layout">
            <div className="stage">
              <div className="stage-text">ESCENARIO</div>
            </div>
            <div className="arena-section vip-section">
              {renderTribune(occidentalSeats.slice(0, 100), 'VIP', 'occidental')}
            </div>
            <div className="arena-section general-section">
              {renderTribune(orientalSeats, 'GENERAL', 'oriental')}
            </div>
            <div className="arena-section balcon-section">
              {renderTribune(surSeats, 'BALCÓN', 'sur')}
            </div>
          </div>
        )}

        <div className="selection-info">
          <h3>Selección Actual</h3>
          {selectedSeats.length > 0 ? (
            <div className="selected-seats">
              <h4>Asientos Seleccionados: {selectedSeats.length}</h4>
              <div className="reservation-note">
                <span className="material-symbols-outlined" style={{ fontSize: 18, verticalAlign: '-4px', marginRight: 6 }}>schedule</span>
                Al continuar estos asientos serán reservados <b>temporalmente 15 minutos</b> para ti.
              </div>
              {selectedSeats.map((seat) => (
                <div key={seat.id} className="selected-item">
                  {zoneNames[seat.zone]} - Fila {seat.row}, Asiento {seat.number} - $
                  {seat.price.toLocaleString()}
                </div>
              ))}
              <div className="total">
                Total: ${total.toLocaleString()}
              </div>
              <div className="purchase-button-container">
                <button
                  className="purchase-button"
                  disabled={isBooking}
                  onClick={handlePurchase}
                >
                  {isBooking ? (
                    <>Reservando tus asientos...</>
                  ) : (
                    <>
                      <span className="material-symbols-outlined left-icon">confirmation_number</span>
                      Reservar y Comprar · 15min
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <p>No hay asientos seleccionados</p>
          )}
        </div>
      </div>
    </div>
  );
};

function describeAnnulusSector(
  cx: number,
  cy: number,
  rOuterX: number,
  rOuterY: number,
  rInnerX: number,
  rInnerY: number,
  startDeg: number,
  endDeg: number,
): string {
  const toXY = (deg: number, rx: number, ry: number) => {
    const a = (deg * Math.PI) / 180;
    return { x: cx + rx * Math.cos(a), y: cy + ry * Math.sin(a) };
  };
  const start = toXY(startDeg, rOuterX, rOuterY);
  const end = toXY(endDeg, rOuterX, rOuterY);
  const startInner = toXY(endDeg, rInnerX, rInnerY);
  const endInner = toXY(startDeg, rInnerX, rInnerY);
  const largeArc = endDeg - startDeg > 180 ? 1 : 0;
  return [
    `M ${start.x} ${start.y}`,
    `A ${rOuterX} ${rOuterY} 0 ${largeArc} 1 ${end.x} ${end.y}`,
    `L ${startInner.x} ${startInner.y}`,
    `A ${rInnerX} ${rInnerY} 0 ${largeArc} 0 ${endInner.x} ${endInner.y}`,
    'Z',
  ].join(' ');
}

export default SeatSelector;
