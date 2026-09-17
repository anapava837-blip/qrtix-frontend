'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import './PurchaseForm.css';

interface SeatInfo {
  zone: string;
  row: number;
  seat: number;
  price?: number;
}

interface PurchaseData {
  seats: SeatInfo[];
  totalPrice: number;
  timestamp: string;
}

interface ReservationInfo {
  reservation_id?: string;
  session_id?: string;
  event_id?: string;
}

interface PurchaseFormProps {
  purchaseData: PurchaseData;
  reservationInfo?: ReservationInfo;
}

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  documentType: string;
  documentNumber: string;
  address: string;
  city: string;
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

export default function PurchaseForm({ purchaseData, reservationInfo }: PurchaseFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    documentType: 'cedula',
    documentNumber: '',
    address: '',
    city: ''
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [purchaseComplete, setPurchaseComplete] = useState(false);
  const [lastPurchaseId, setLastPurchaseId] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePurchase = async () => {
    setIsProcessing(true);
    try {
      const payload: any = {
        ...formData,
        seats: purchaseData.seats.map((s) => ({
          zone: s.zone,
          row: s.row,
          seat: s.seat,
          price: s.price,
        })),
        totalPrice: purchaseData.totalPrice,
        purchaseDate: new Date().toISOString(),
        reservation_id: reservationInfo?.reservation_id,
        session_id: reservationInfo?.session_id,
        event_id: reservationInfo?.event_id,
      };
      const response = await fetch(`${API_URL}/api/sales`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const resData = await response.json();
        const pid = resData?.results?.purchaseId ?? null;
        if (pid) setLastPurchaseId(pid);
        setPurchaseComplete(true);
        localStorage.removeItem('purchaseData');
      } else {
        let detail: any = null;
        try { detail = await response.json(); } catch {}
        const msg = detail?.detail ? `: ${typeof detail.detail === 'string' ? detail.detail : (detail.detail.message || JSON.stringify(detail.detail))}` : '';
        alert(`Error al procesar la compra${msg}. Por favor, inténtelo de nuevo.`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al procesar la compra. Por favor, inténtelo de nuevo.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadTickets = async () => {
    try {
      const response = await fetch('/api/generate-tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerData: formData,
          seats: purchaseData.seats,
          totalPrice: purchaseData.totalPrice,
          purchaseId: lastPurchaseId ?? undefined,
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = lastPurchaseId ? `entradas-${lastPurchaseId}.pdf` : 'entradas.pdf';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        alert('Error al generar las entradas. Por favor, inténtelo de nuevo.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al generar las entradas. Por favor, inténtelo de nuevo.');
    }
  };

  if (purchaseComplete) {
    return (
      <div className="purchase-complete">
        <div className="success-message">
          <div className="success-icon-wrap">
            <span className="material-symbols-outlined success-ico">check_circle</span>
          </div>
          <h2>¡Compra realizada con éxito!</h2>
          <p>Su compra ha sido procesada correctamente. Los asientos ahora están permanentemente a su nombre.</p>
          {lastPurchaseId && (
            <p className="purchase-id-line">ID de compra: <code>{lastPurchaseId}</code></p>
          )}
          <p>Puede descargar sus entradas haciendo clic en el botón de abajo.</p>
        </div>
        <div className="action-buttons">
          <button onClick={handleDownloadTickets} className="download-button">
            <span className="material-symbols-outlined left-icon">picture_as_pdf</span>
            Descargar Entradas PDF
          </button>
          <button onClick={() => router.push('/')} className="back-button">
            <span className="material-symbols-outlined left-icon">home</span>
            Volver al Inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Purchase Form */}
      <div className="purchase-form">
        <h3>Datos de Compra</h3>
        <div className="form-grid">
        <div className="form-group">
          <label htmlFor="firstName">Nombres *</label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="lastName">Apellidos *</label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleInputChange}
            required
          />
        </div>

          <div className="form-group">
            <label htmlFor="documentType">Tipo de Documento *</label>
            <select
              id="documentType"
              name="documentType"
              value={formData.documentType}
              onChange={handleInputChange}
              required
            >
              <option value="cedula">Cédula de Ciudadanía</option>
              <option value="pasaporte">Pasaporte</option>
              <option value="cedula_extranjeria">Cédula de Extranjería</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="documentNumber">Número de Documento *</label>
            <input
              type="text"
              id="documentNumber"
              name="documentNumber"
              value={formData.documentNumber}
              onChange={handleInputChange}
              required
            />
          </div>

        <div className="form-group">
          <label htmlFor="email">Correo Electrónico *</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="phone">Teléfono *</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            required
          />
        </div>

          <div className="form-group">
            <label htmlFor="address">Dirección *</label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="city">Ciudad *</label>
            <input
              type="text"
              id="city"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>

        <div className="purchase-actions">
          <button
            onClick={handlePurchase}
            disabled={isProcessing}
            className="purchase-submit-button"
          >
            {isProcessing ? (
              <>
                <span className="material-symbols-outlined left-icon spin">progress_activity</span>
                Procesando y confirmando reserva...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined left-icon">shopping_bag</span>
                Confirmar Compra · ${purchaseData.totalPrice.toLocaleString()}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
