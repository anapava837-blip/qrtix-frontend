'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';
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
    city: '',
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [purchaseComplete, setPurchaseComplete] = useState(false);
  const [lastPurchaseId, setLastPurchaseId] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
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
        try {
          detail = await response.json();
        } catch {}
        const msg = detail?.detail
          ? `: ${typeof detail.detail === 'string' ? detail.detail : detail.detail.message || JSON.stringify(detail.detail)}`
          : '';
        alert(`Error al procesar la compra${msg}. Por favor, inténtelo de nuevo.`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al procesar la compra. Por favor, inténtelo de nuevo.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadTickets = async (e?: React.MouseEvent<HTMLButtonElement>) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    try {
      const BRAND_BLUE = [37, 99, 235];
      const BRAND_DARK = [15, 23, 42];
      const BRAND_ORANGE = [249, 115, 22];
      const BRAND_PURPLE = [79, 70, 229];
      const BRAND_GREEN = [22, 163, 74];
      const MUTED = [100, 116, 139];
      const GRAY_LINE = [203, 213, 225];

      const safeCustomerData = {
        firstName: formData.firstName || 'Usuario',
        lastName: formData.lastName || 'QRTixPro',
        email: formData.email || 'correo@correo.com',
        phone: formData.phone || '0000000000',
        documentType: formData.documentType || 'C.C',
        documentNumber: formData.documentNumber || '00000000',
        address: formData.address,
        city: formData.city,
      };

      const safeSeats =
        purchaseData?.seats && Array.isArray(purchaseData.seats) && purchaseData.seats.length > 0
          ? purchaseData.seats.map((s) => ({
              zone: s.zone || 'General',
              row: s.row ?? 'N/A',
              seat: s.seat ?? 'N/A',
              price: s.price ?? 0,
            }))
          : [{ zone: 'General', row: 'N/A', seat: 'N/A', price: 0 }];

      const safeTotalPrice =
        typeof purchaseData?.totalPrice === 'number' ? purchaseData.totalPrice : 0;

      const fullName =
        `${safeCustomerData.firstName} ${safeCustomerData.lastName}`.trim();
      const document = `${safeCustomerData.documentType} - ${safeCustomerData.documentNumber}`;
      const totalTickets = safeSeats.length;

      console.log('[Descargar Boletas JS] Generando PDF cliente...', {
        totalTickets,
        safeTotalPrice,
      });

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

      const formatMoney = (v: number) => {
        try {
          return new Intl.NumberFormat('es-CO').format(v);
        } catch {
          return String(v);
        }
      };

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

        const uniqueTicketId = lastPurchaseId
          ? `QRT-${lastPurchaseId}-${ticketNumber}`
          : `QRT-${Date.now()}-${ticketNumber}-${Math.random().toString(36).slice(2, 7)}`;

        const qrPayload = {
          ticketId: uniqueTicketId,
          ticketNumber,
          totalTickets,
          purchaseId: lastPurchaseId ?? null,
          event: 'QRTixPro Oficial',
          zone,
          row,
          seat: seatNum,
          price,
          customerName: fullName,
          customerDocument: safeCustomerData.documentNumber,
          customerEmail: safeCustomerData.email,
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
          console.error('[Descargar Boletas JS] Error QR:', qrErr);
        }

        drawTicketFrame();

        // HEADER AZUL
        doc.setFillColor(239, 246, 255);
        doc.roundedRect(11, 11, pageW - 22, 28, 1.5, 1.5, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(26);
        doc.setTextColor(BRAND_BLUE[0], BRAND_BLUE[1], BRAND_BLUE[2]);
        doc.text('QRTixPro', pageW / 2, 29, { align: 'center' });
        doc.setFontSize(10);
        doc.setTextColor(BRAND_DARK[0], BRAND_DARK[1], BRAND_DARK[2]);
        doc.text('BOLETA DIGITAL OFICIAL', pageW / 2, 36, { align: 'center' });

        // INFO BOLETA
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(MUTED[0], MUTED[1], MUTED[2]);
        doc.text(`Boleta N. ${ticketNumber} de ${totalTickets}`, marginLeft, 48);
        if (lastPurchaseId) {
          doc.text(`Compra: ${lastPurchaseId}`, marginLeft, 54);
        }
        const emittedAt = new Date().toLocaleString('es-CO');
        doc.text(`Emitido: ${emittedAt}`, marginLeft, lastPurchaseId ? 60 : 54);

        let yCursor = lastPurchaseId ? 68 : 62;
        drawLine(yCursor);
        yCursor += 5;

        // EVENTO
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(13);
        doc.setTextColor(BRAND_BLUE[0], BRAND_BLUE[1], BRAND_BLUE[2]);
        doc.text('EVENTO', marginLeft, yCursor);
        yCursor += 7;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(BRAND_DARK[0], BRAND_DARK[1], BRAND_DARK[2]);
        doc.text('Evento:  Concierto / Evento Oficial QRTixPro', marginLeft, yCursor);
        yCursor += 5;
        doc.text('Fecha y hora: A confirmar con el organizador', marginLeft, yCursor);
        yCursor += 5;
        doc.text('Lugar: Coliseo / Estadio Principal', marginLeft, yCursor);
        yCursor += 8;

        drawLine(yCursor);
        yCursor += 5;

        // ASIENTO
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
        if (safeTotalPrice > 0 && ticketNumber === totalTickets) {
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(11);
          doc.setTextColor(BRAND_GREEN[0], BRAND_GREEN[1], BRAND_GREEN[2]);
          doc.text(`TOTAL COMPRA: $${formatMoney(safeTotalPrice)} COP`, marginLeft, yCursor);
          yCursor += 8;
        } else {
          yCursor += 3;
        }

        drawLine(yCursor);
        yCursor += 5;

        // TITULAR
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
        doc.text(`Correo: ${safeCustomerData.email}`, marginLeft, yCursor);
        yCursor += 5;
        doc.text(`Telefono: ${safeCustomerData.phone}`, marginLeft, yCursor);
        yCursor += 5;
        if (safeCustomerData.city) {
          doc.text(`Ciudad: ${safeCustomerData.city}`, marginLeft, yCursor);
          yCursor += 5;
        }
        yCursor += 3;

        drawLine(yCursor);
        yCursor += 6;

        // QR + INFO DERECHA
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

        // FOOTER
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

      const filename = lastPurchaseId
        ? `boletas-qrtixpro-${lastPurchaseId}.pdf`
        : 'boletas-qrtixpro.pdf';

      console.log('[Descargar Boletas JS] Guardando PDF:', filename);
      doc.save(filename);

      console.log('[Descargar Boletas JS] OK - PDF descargado.');
    } catch (error: any) {
      console.error('[Descargar Boletas JS] ERROR:', error?.message ?? error, error);
      alert(
        `❌ No se pudo descargar la boleta.\n\nError: ${
          error?.message ? error.message : 'Desconocido'
        }\n\nPor favor, intente nuevamente.`
      );
    }
  };

  if (purchaseComplete) {
    return (
      <div className='purchase-complete'>
        <div className='success-message'>
          <div className='success-icon-wrap'>
            <span className='material-symbols-outlined success-ico'>check_circle</span>
          </div>
          <h2>¡Compra realizada con éxito!</h2>
          <p>
            Su compra ha sido procesada correctamente. Los asientos ahora están permanentemente a su
            nombre.
          </p>
          {lastPurchaseId && (
            <p className='purchase-id-line'>
              ID de compra: <code>{lastPurchaseId}</code>
            </p>
          )}
          <p>Puede descargar sus entradas haciendo clic en el botón de abajo.</p>
        </div>
        <div className='action-buttons'>
          <button onClick={handleDownloadTickets} className='download-button'>
            <span className='material-symbols-outlined left-icon'>picture_as_pdf</span>
            Descargar Entradas PDF
          </button>
          <button onClick={() => router.push('/')} className='back-button'>
            <span className='material-symbols-outlined left-icon'>home</span>
            Volver al Inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Purchase Form */}
      <div className='purchase-form'>
        <h3>Datos de Compra</h3>
        <div className='form-grid'>
          <div className='form-group'>
            <label htmlFor='firstName'>Nombres *</label>
            <input
              type='text'
              id='firstName'
              name='firstName'
              value={formData.firstName}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className='form-group'>
            <label htmlFor='lastName'>Apellidos *</label>
            <input
              type='text'
              id='lastName'
              name='lastName'
              value={formData.lastName}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className='form-group'>
            <label htmlFor='documentType'>Tipo de Documento *</label>
            <select
              id='documentType'
              name='documentType'
              value={formData.documentType}
              onChange={handleInputChange}
              required
            >
              <option value='cedula'>Cédula de Ciudadanía</option>
              <option value='pasaporte'>Pasaporte</option>
              <option value='cedula_extranjeria'>Cédula de Extranjería</option>
            </select>
          </div>

          <div className='form-group'>
            <label htmlFor='documentNumber'>Número de Documento *</label>
            <input
              type='text'
              id='documentNumber'
              name='documentNumber'
              value={formData.documentNumber}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className='form-group'>
            <label htmlFor='email'>Correo Electrónico *</label>
            <input
              type='email'
              id='email'
              name='email'
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className='form-group'>
            <label htmlFor='phone'>Teléfono *</label>
            <input
              type='tel'
              id='phone'
              name='phone'
              value={formData.phone}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className='form-group'>
            <label htmlFor='address'>Dirección *</label>
            <input
              type='text'
              id='address'
              name='address'
              value={formData.address}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className='form-group'>
            <label htmlFor='city'>Ciudad *</label>
            <input
              type='text'
              id='city'
              name='city'
              value={formData.city}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>

        <div className='purchase-actions'>
          <button
            onClick={handlePurchase}
            disabled={isProcessing}
            className='purchase-submit-button'
          >
            {isProcessing ? (
              <>
                <span className='material-symbols-outlined left-icon spin'>progress_activity</span>
                Procesando y confirmando reserva...
              </>
            ) : (
              <>
                <span className='material-symbols-outlined left-icon'>shopping_bag</span>
                Confirmar Compra · ${purchaseData.totalPrice.toLocaleString()}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
