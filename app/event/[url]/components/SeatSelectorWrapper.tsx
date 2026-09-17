'use client';

import React from 'react';
import SeatSelector from './SeatSelector';
import { Event } from '@data/events';

interface Seat {
  id: string;
  row: number;
  number: number;
  zone: 'occidental' | 'oriental';
  price: number;
  available: boolean;
}

interface GeneralZone {
  id: string;
  zone: 'sur' | 'norte';
  price: number;
  capacity: number;
  selected: boolean;
}

interface SeatSelectorWrapperProps {
  event: Event;
}

const SeatSelectorWrapper: React.FC<SeatSelectorWrapperProps> = ({ event }) => {
  const handleSeatSelection = (seats: Seat[], generalZones: GeneralZone[], total: number) => {
    console.log('Asientos seleccionados:', seats);
    console.log('Zonas generales seleccionadas:', generalZones);
    console.log('Total:', total);
  };

  return <SeatSelector event={event} onSeatSelection={handleSeatSelection} />;
};

export default SeatSelectorWrapper;