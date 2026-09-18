import { NextRequest, NextResponse } from 'next/server';
import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';

interface TicketData {
  customerData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    documentType: string;
    documentNumber: string;
    address?: string;
    city?: string;
  };
  seats: Array<{
    zone: string;
    row: number | string;
    seat: number | string;
    price?: number;
  }>;
  totalPrice?: number;
  purchaseId?: string;
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    console.log('[generate-tickets] -> Recibiendo solicitud...');
    const ticketData: TicketData = await request.json();

    if (!ticketData || !ticketData.customerData) {
      console.error('[generate-tickets] Faltan customerData');
      return NextResponse.json(
        { error: 'Faltan datos del cliente para generar las entradas.' },
        { status: 400 }
      );
    }

    const seats = ticketData.seats && ticketData.seats.length > 0
      ? ticketData.seats
      : [{ zone: 'General', row: 'N/A', seat: 'N/A' }];

    console.log(`[generate-tickets] Generando ${seats.length} entradas PDF...`);

    const chunks: Buffer[] = [];
    const doc = new PDFDocument({
      size: 'LETTER',
      margin: 40,
      bufferPages: true,
      info: {
        Title: 'Boletas QRTixPro',
        Author: 'QRTixPro',
        Creator: 'QRTixPro',
        Producer: 'QRTixPro',
      },
    });

    doc.on('data', (chunk) => chunks.push(Buffer.from(chunk)));

    const pdfPromise: Promise<Buffer> = new Promise((resolve, reject) => {
      doc.on('end', () => {
        resolve(Buffer.concat(chunks));
      });
      doc.on('error', (err: any) => {
        console.error('[generate-tickets] PDFStream ERROR:', err);
        reject(err);
      });
    });

    for (let i = 0; i < seats.length; i++) {
      const seat = seats[i];
      if (i > 0) doc.addPage();
      try {
        await generateTicketPage(doc, ticketData, seat, i + 1);
      } catch (pageErr: any) {
        console.error(`[generate-tickets] Error page ${i + 1}:`, pageErr);
      }
    }

    doc.end();
    const pdfBuffer = await pdfPromise;

    console.log(`[generate-tickets] PDF listo! Tamaño: ${pdfBuffer.length} bytes`);

    const filename = ticketData.purchaseId
      ? `boletas-${ticketData.purchaseId}.pdf`
      : 'boletas-qrtixpro.pdf';

    return new NextResponse(pdfBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': pdfBuffer.length.toString(),
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error: any) {
    console.error('[generate-tickets] ERROR CRÍTICO:', error?.message ?? error);
    console.error('[generate-tickets] STACK:', error?.stack);
    return NextResponse.json(
      {
        error: 'Error interno al generar las boletas.',
        detail: error?.message ? String(error.message) : undefined,
      },
      { status: 500 }
    );
  }
}

async function generateTicketPage(
  doc: typeof PDFDocument.prototype,
  ticketData: TicketData,
  seat: { zone: string; row: number | string; seat: number | string; price?: number },
  ticketNumber: number
) {
  const { customerData } = ticketData;
  const totalTickets = ticketData.seats?.length ?? 1;

  doc
    .lineWidth(3)
    .strokeColor('#2563eb')
    .rect(20, 20, doc.page.width - 40, doc.page.height - 40)
    .stroke();

  doc
    .lineWidth(1)
    .strokeColor('#dbeafe')
    .rect(28, 28, doc.page.width - 56, doc.page.height - 56)
    .stroke();

  doc.fillColor('#2563eb');
  doc
    .fontSize(28)
    .text('QRTixPro', 40, 50, { align: 'center', width: doc.page.width - 80 });

  doc.fillColor('#0f172a');
  doc
    .fontSize(14)
    .text('BOLETA DIGITAL OFICIAL', 40, 90, {
      align: 'center',
      width: doc.page.width - 80,
    });

  doc
    .moveTo(40, 115)
    .lineTo(doc.page.width - 40, 115)
    .lineWidth(1)
    .strokeColor('#cbd5e1')
    .stroke();

  doc.fontSize(11).fillColor('#64748b').text(`Boleta N° ${ticketNumber} de ${totalTickets}`, 40, 130);
  if (ticketData.purchaseId) {
    doc.text(`Compra: ${ticketData.purchaseId}`, 40, 147);
  }
  doc.text(`Emitido: ${new Date().toLocaleString('es-CO')}`, 40, 164);

  doc
    .moveTo(40, 190)
    .lineTo(doc.page.width - 40, 190)
    .lineWidth(1)
    .strokeColor('#cbd5e1')
    .stroke();

  doc.fontSize(15).fillColor('#2563eb').text('🎭 EVENTO', 40, 208);
  doc.fontSize(12).fillColor('#0f172a');
  doc.text('Evento:  Concierto / Evento Oficial QRTixPro', 40, 232);
  doc.text('Fecha y hora: A confirmar con el organizador', 40, 250);
  doc.text('Lugar: Coliseo / Estadio Principal', 40, 268);

  doc
    .moveTo(40, 292)
    .lineTo(doc.page.width - 40, 292)
    .lineWidth(1)
    .strokeColor('#cbd5e1')
    .stroke();

  doc.fontSize(15).fillColor('#f97316').text('🎫 INFORMACIÓN DEL ASIENTO', 40, 308);
  doc.fontSize(13).fillColor('#0f172a');
  doc.text(`Zona: ${String(seat.zone ?? 'General').toUpperCase()}`, 40, 334);
  doc.text(`Fila: ${seat.row ?? 'N/A'}`, 40, 354);
  doc.text(`Número de asiento: ${seat.seat ?? 'N/A'}`, 40, 374);
  if (seat.price != null) {
    doc.text(`Valor individual: $${Number(seat.price).toLocaleString()} COP`, 40, 394);
  }
  if (ticketData.totalPrice != null && ticketNumber === totalTickets) {
    doc.fontSize(13).fillColor('#16a34a').text(
      `💵 TOTAL COMPRA: $${Number(ticketData.totalPrice).toLocaleString()} COP`,
      40,
      418
    );
  }

  doc
    .moveTo(40, 446)
    .lineTo(doc.page.width - 40, 446)
    .lineWidth(1)
    .strokeColor('#cbd5e1')
    .stroke();

  doc.fontSize(15).fillColor('#4f46e5').text('👤 TITULAR DE LA BOLETA', 40, 462);
  doc.fontSize(11).fillColor('#0f172a');
  const fullName = `${customerData.firstName ?? ''} ${customerData.lastName ?? ''}`.trim() || 'Usuario QRTixPro';
  doc.text(`Nombre completo: ${fullName}`, 40, 488);
  doc.text(
    `Documento: ${customerData.documentType ?? 'C.C'} - ${customerData.documentNumber ?? 'N/A'}`,
    40,
    506
  );
  doc.text(`Correo: ${customerData.email ?? 'N/A'}`, 40, 524);
  doc.text(`Teléfono: ${customerData.phone ?? 'N/A'}`, 40, 542);
  if (customerData.city) {
    doc.text(`Ciudad: ${customerData.city}`, 40, 560);
  }

  const uniqueTicketId = ticketData.purchaseId
    ? `QRT-${ticketData.purchaseId}-${ticketNumber}`
    : `QRT-${Date.now()}-${ticketNumber}-${Math.random().toString(36).slice(2, 7)}`;

  const qrPayload = {
    ticketId: uniqueTicketId,
    ticketNumber,
    totalTickets,
    purchaseId: ticketData.purchaseId ?? null,
    event: 'QRTixPro Oficial',
    zone: seat.zone,
    row: seat.row,
    seat: seat.seat,
    price: seat.price ?? null,
    customerName: fullName,
    customerDocument: customerData.documentNumber ?? null,
    customerEmail: customerData.email ?? null,
    issuedAt: new Date().toISOString(),
    valid: true,
  };

  const qrX = 40;
  const qrY = 588;
  const qrSize = 160;

  try {
    const qrDataURL = await QRCode.toDataURL(JSON.stringify(qrPayload), {
      errorCorrectionLevel: 'H',
      margin: 1,
      width: qrSize * 2,
      color: { dark: '#0f172a', light: '#ffffff' },
    });
    const cleanBase64 = qrDataURL.includes(',') ? qrDataURL.split(',')[1] : qrDataURL;
    const qrBuffer = Buffer.from(cleanBase64, 'base64');
    doc.image(qrBuffer, qrX, qrY, { width: qrSize, height: qrSize });

    doc
      .rect(qrX - 3, qrY - 3, qrSize + 6, qrSize + 6)
      .lineWidth(1)
      .strokeColor('#2563eb')
      .stroke();

    doc.fontSize(9).fillColor('#64748b').text(
      'Escanee este código QR a la entrada',
      qrX,
      qrY + qrSize + 6,
      { width: qrSize, align: 'center' }
    );

    doc.fontSize(9).fillColor('#2563eb').text(
      `ID: ${uniqueTicketId}`,
      qrX + qrSize + 24,
      qrY + 10,
      { width: doc.page.width - 40 - qrX - qrSize - 40 }
    );
    doc.fontSize(10).fillColor('#0f172a').text(
      '✨ Esta boleta es intransferible y válida únicamente para la fecha y evento indicados.\n✅ Presente esta boleta IMPRESA o DIGITAL + su documento de identidad ORIGINAL a la entrada.\n🚫 No se aceptan copias ni modificaciones. Cualquier alteración anula la boleta automáticamente.',
      qrX + qrSize + 24,
      qrY + 42,
      {
        width: doc.page.width - 40 - qrX - qrSize - 40,
        lineGap: 6,
      }
    );
  } catch (qrErr: any) {
    console.error('[generate-tickets] ERROR QR:', qrErr?.message);
    doc.fontSize(10).fillColor('#ef4444').rect(qrX, qrY, qrSize, qrSize).fillAndStroke('#fee2e2', '#fca5a5');
    doc.fillColor('#991b1b').text('(QR no disponible)', qrX, qrY + qrSize / 2, {
      width: qrSize,
      align: 'center',
    });
    doc.fontSize(9).fillColor('#0f172a').text(
      `Ticket ID: ${uniqueTicketId}`,
      qrX + qrSize + 24,
      qrY + 10
    );
  }

  doc
    .moveTo(40, doc.page.height - 120)
    .lineTo(doc.page.width - 40, doc.page.height - 120)
    .lineWidth(1)
    .strokeColor('#cbd5e1')
    .stroke();

  doc.fontSize(10).fillColor('#475569');
  doc.text(
    '🎟️ QRTixPro - Plataforma oficial de venta y gestión de boletas digitales.',
    40,
    doc.page.height - 105,
    { align: 'center', width: doc.page.width - 80 }
  );
  doc.fontSize(9).fillColor('#64748b');
  doc.text(
    'Conserve este comprobante. Para soporte contáctese con el organizador del evento.',
    40,
    doc.page.height - 86,
    { align: 'center', width: doc.page.width - 80 }
  );
  doc.text(
    `Válido hasta agotar existencia. © ${new Date().getFullYear()} QRTixPro - Todos los derechos reservados.`,
    40,
    doc.page.height - 68,
    { align: 'center', width: doc.page.width - 80 }
  );
}
