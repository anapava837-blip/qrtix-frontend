// ============================================================
//  TIPOS COMPARTIDOS - Evita errores de interfaces duplicadas
// ============================================================
//  Úsalo en SeatSelector, SeatSelectorWrapper, PurchasePage, etc.
//  No meterlo en pages porque Next.js 15 no admite exports named
//  no-default desde page files.
// ============================================================

export type StadiumZone = 'occidental' | 'oriental' | 'sur' | 'norte';

export interface Seat {
  id: string;
  row: number;
  number: number;
  zone: StadiumZone;
  price: number;
  available: boolean;
  cx?: number;
  cy?: number;
}

export interface GeneralZone {
  id: string;
  zone: 'sur' | 'norte';
  price: number;
  capacity: number;
  selected: boolean;
}
