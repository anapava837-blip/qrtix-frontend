import { NextRequest, NextResponse } from 'next/server';
import PdfPrinter from 'pdfmake';
import QRCode from 'qrcode';
import { Buffer } from 'node:buffer';

interface TicketData {
  customerData?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    documentType?: string;
    documentNumber?: string;
    address?: string;
    city?: string;
  };
  seats?: Array<{
    zone?: string;
    row?: number | string;
    seat?: number | string;
    price?: number;
  }>;
  totalPrice?: number;
  purchaseId?: string;
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const PDF_STANDARD_FONTS: Record<string, any> = {
  Helvetica: {
    normal: 'Helvetica',
    bold: 'Helvetica-Bold',
    italics: 'Helvetica-Oblique',
    bolditalics: 'Helvetica-BoldOblique',
  },
};

const BRAND_BLUE = '#2563eb';
const BRAND_DARK = '#0f172a';
const BRAND_ORANGE = '#f97316';
const BRAND_PURPLE = '#4f46e5';
const BRAND_GREEN = '#16a34a';
const MUTED = '#64748b';

function c(value: number | string | undefined | null): string {
  if (value === undefined || value === null) return '';
  if (typeof value === 'number') {
    try {
      return value.toLocaleString('es-CO');
    } catch {
      return String(value);
    }
  }
  return String(value);
}

export async function POST(request: NextRequest) {
  try {
    console.log('[generate-tickets-pdfmake] -> Recibiendo solicitud...');

    let ticketData: TicketData = {};
    try {
      ticketData = (await request.json()) as TicketData;
    } catch (_) {
      console.warn('[generate-tickets-pdfmake] Body JSON no parseable, usar defaults.');
    }

    const customer = ticketData?.customerData ?? {};
    const fullName =
      `${customer.firstName ?? ''} ${customer.lastName ?? ''}`.trim() ||
      'Usuario QRTixPro';
    const document = `${customer.documentType ?? 'C.C'} - ${
      customer.documentNumber ?? 'N/A'
    }`;
    const email = customer.email ?? 'correo@correo.com';
    const phone = customer.phone ?? 'N/A';
    const city = customer.city ?? '';

    const seats =
      Array.isArray(ticketData.seats) && ticketData.seats.length > 0
        ? ticketData.seats
        : [{ zone: 'General', row: 'N/A', seat: 'N/A', price: 0 }];

    const totalPrice =
      typeof ticketData.totalPrice === 'number' ? ticketData.totalPrice : 0;
    const purchaseId = ticketData.purchaseId ?? null;

    console.log(
      `[generate-tickets-pdfmake] Generando PDF con ${seats.length} boleta(s)...`
    );

    const printer = new PdfPrinter(PDF_STANDARD_FONTS);

    const pagesContent: any[] = [];

    for (let i = 0; i < seats.length; i++) {
      const s = seats[i];
      const ticketNumber = i + 1;
      const totalTickets = seats.length;

      const zone = String(s?.zone ?? 'General').toUpperCase();
      const row = s?.row ?? 'N/A';
      const seatNum = s?.seat ?? 'N/A';
      const price = typeof s?.price === 'number' ? s.price : 0;

      const uniqueTicketId = purchaseId
        ? `QRT-${purchaseId}-${ticketNumber}`
        : `QRT-${Date.now()}-${ticketNumber}-${Math.random().toString(36).slice(2, 7)}`;

      const qrPayload = {
        ticketId: uniqueTicketId,
        ticketNumber,
        totalTickets,
        purchaseId: purchaseId,
        event: 'QRTixPro Oficial',
        zone,
        row,
        seat: seatNum,
        price,
        customerName: fullName,
        customerDocument: customer.documentNumber ?? null,
        customerEmail: email,
        issuedAt: new Date().toISOString(),
        valid: true,
      };

      let qrImageBase64: string | null = null;
      try {
        qrImageBase64 = await QRCode.toDataURL(JSON.stringify(qrPayload), {
          errorCorrectionLevel: 'H',
          margin: 1,
          width: 400,
          color: { dark: BRAND_DARK, light: '#ffffff' },
        });
      } catch (qrErr: any) {
        console.error(
          `[generate-tickets-pdfmake] Error QR boleta ${ticketNumber}:`,
          qrErr?.message
        );
      }

      const qrCol: any[] = qrImageBase64
        ? [
            {
              image: qrImageBase64,
              width: 140,
              height: 140,
              alignment: 'center',
              border: [true, true, true, true],
              borderColor: [BRAND_BLUE, BRAND_BLUE, BRAND_BLUE, BRAND_BLUE],
              margin: [0, 0, 0, 6],
            },
            {
              text: 'Escanee este código QR a la entrada',
              fontSize: 8,
              color: MUTED,
              alignment: 'center',
            },
          ]
        : [
            {
              text: '(QR no disponible)\n\nID: ' + uniqueTicketId,
              fontSize: 10,
              color: '#ef4444',
              fillColor: '#fee2e2',
              alignment: 'center',
              width: 140,
              height: 140,
            },
          ];

      const pageBody: any[] = [
        {
          table: {
            widths: ['*'],
            body: [
              [
                {
                  stack: [
                    {
                      text: 'QRTixPro',
                      fontSize: 28,
                      bold: true,
                      color: BRAND_BLUE,
                      alignment: 'center',
                      margin: [0, 8, 0, 4],
                    },
                    {
                      text: 'BOLETA DIGITAL OFICIAL',
                      fontSize: 14,
                      bold: true,
                      color: BRAND_DARK,
                      alignment: 'center',
                      margin: [0, 0, 0, 10],
                    },
                  ],
                },
              ],
            ],
            layout: {
              hLineWidth: () => 3,
              vLineWidth: () => 3,
              hLineColor: () => BRAND_BLUE,
              vLineColor: () => BRAND_BLUE,
              paddingLeft: () => 10,
              paddingRight: () => 10,
              paddingTop: () => 6,
              paddingBottom: () => 6,
            },
          },
          margin: [0, 0, 0, 10],
        },
        {
          columns: [
            {
              width: '*',
              stack: [
                {
                  text: `Boleta N° ${ticketNumber} de ${totalTickets}`,
                  fontSize: 10,
                  color: MUTED,
                },
                purchaseId
                  ? {
                      text: `Compra: ${purchaseId}`,
                      fontSize: 10,
                      color: MUTED,
                      margin: [0, 2, 0, 0],
                    }
                  : {},
                {
                  text: `Emitido: ${new Date().toLocaleString('es-CO')}`,
                  fontSize: 10,
                  color: MUTED,
                  margin: [0, 2, 0, 0],
                },
              ],
            },
          ],
          margin: [8, 0, 8, 10],
        },
        {
          canvas: [
            {
              type: 'line',
              x1: 0,
              y1: 0,
              x2: 515,
              y2: 0,
              lineWidth: 0.5,
              lineColor: '#cbd5e1',
            },
          ],
          margin: [0, 0, 0, 10],
        },
        {
          stack: [
            {
              text: 'EVENTO',
              fontSize: 15,
              bold: true,
              color: BRAND_BLUE,
              margin: [0, 0, 0, 6],
            },
            {
              text: 'Evento:  Concierto / Evento Oficial QRTixPro',
              fontSize: 11,
              color: BRAND_DARK,
            },
            {
              text: 'Fecha y hora: A confirmar con el organizador',
              fontSize: 11,
              color: BRAND_DARK,
              margin: [0, 3, 0, 0],
            },
            {
              text: 'Lugar: Coliseo / Estadio Principal',
              fontSize: 11,
              color: BRAND_DARK,
              margin: [0, 3, 0, 0],
            },
          ],
          margin: [8, 0, 8, 10],
        },
        {
          canvas: [
            {
              type: 'line',
              x1: 0,
              y1: 0,
              x2: 515,
              y2: 0,
              lineWidth: 0.5,
              lineColor: '#cbd5e1',
            },
          ],
          margin: [0, 0, 0, 10],
        },
        {
          stack: [
            {
              text: 'INFORMACIÓN DEL ASIENTO',
              fontSize: 15,
              bold: true,
              color: BRAND_ORANGE,
              margin: [0, 0, 0, 8],
            },
            {
              columns: [
                {
                  width: '*',
                  stack: [
                    {
                      text: 'Zona',
                      fontSize: 9,
                      color: MUTED,
                      margin: [0, 0, 0, 2],
                    },
                    {
                      text: zone,
                      fontSize: 12,
                      bold: true,
                      color: BRAND_DARK,
                    },
                  ],
                },
                {
                  width: '*',
                  stack: [
                    {
                      text: 'Fila',
                      fontSize: 9,
                      color: MUTED,
                      margin: [0, 0, 0, 2],
                    },
                    {
                      text: String(row),
                      fontSize: 12,
                      bold: true,
                      color: BRAND_DARK,
                    },
                  ],
                },
                {
                  width: '*',
                  stack: [
                    {
                      text: 'Asiento',
                      fontSize: 9,
                      color: MUTED,
                      margin: [0, 0, 0, 2],
                    },
                    {
                      text: String(seatNum),
                      fontSize: 12,
                      bold: true,
                      color: BRAND_DARK,
                    },
                  ],
                },
              ],
              margin: [0, 0, 0, 8],
            },
            price && !Number.isNaN(price)
              ? {
                  text: `Valor individual: $${c(price)} COP`,
                  fontSize: 11,
                  color: BRAND_DARK,
                }
              : {},
            totalPrice > 0 && ticketNumber === totalTickets
              ? {
                  text: `TOTAL COMPRA: $${c(totalPrice)} COP`,
                  fontSize: 13,
                  bold: true,
                  color: BRAND_GREEN,
                  margin: [0, 8, 0, 0],
                }
              : {},
          ],
          margin: [8, 0, 8, 10],
        },
        {
          canvas: [
            {
              type: 'line',
              x1: 0,
              y1: 0,
              x2: 515,
              y2: 0,
              lineWidth: 0.5,
              lineColor: '#cbd5e1',
            },
          ],
          margin: [0, 0, 0, 10],
        },
        {
          stack: [
            {
              text: 'TITULAR DE LA BOLETA',
              fontSize: 15,
              bold: true,
              color: BRAND_PURPLE,
              margin: [0, 0, 0, 8],
            },
            {
              text: `Nombre completo: ${fullName}`,
              fontSize: 11,
              color: BRAND_DARK,
            },
            {
              text: `Documento: ${document}`,
              fontSize: 11,
              color: BRAND_DARK,
              margin: [0, 3, 0, 0],
            },
            {
              text: `Correo: ${email}`,
              fontSize: 11,
              color: BRAND_DARK,
              margin: [0, 3, 0, 0],
            },
            {
              text: `Teléfono: ${phone}`,
              fontSize: 11,
              color: BRAND_DARK,
              margin: [0, 3, 0, 0],
            },
            city
              ? {
                  text: `Ciudad: ${city}`,
                  fontSize: 11,
                  color: BRAND_DARK,
                  margin: [0, 3, 0, 0],
                }
              : {},
          ],
          margin: [8, 0, 8, 12],
        },
        {
          canvas: [
            {
              type: 'line',
              x1: 0,
              y1: 0,
              x2: 515,
              y2: 0,
              lineWidth: 0.5,
              lineColor: '#cbd5e1',
            },
          ],
          margin: [0, 0, 0, 12],
        },
        {
          columns: [
            {
              width: 160,
              stack: qrCol,
            },
            {
              width: '*',
              stack: [
                {
                  text: `ID: ${uniqueTicketId}`,
                  fontSize: 10,
                  bold: true,
                  color: BRAND_BLUE,
                  margin: [12, 2, 0, 8],
                },
                {
                  text:
                    'Esta boleta es intransferible y válida únicamente para la fecha y evento indicados.',
                  fontSize: 10,
                  color: BRAND_DARK,
                  margin: [12, 0, 0, 5],
                  lineHeight: 1.3,
                },
                {
                  text:
                    'Presente esta boleta IMPRESA o DIGITAL + su documento de identidad ORIGINAL a la entrada.',
                  fontSize: 10,
                  color: BRAND_DARK,
                  margin: [12, 0, 0, 5],
                  lineHeight: 1.3,
                },
                {
                  text:
                    'No se aceptan copias ni modificaciones. Cualquier alteración anula la boleta automáticamente.',
                  fontSize: 10,
                  color: BRAND_DARK,
                  margin: [12, 0, 0, 0],
                  lineHeight: 1.3,
                },
              ],
            },
          ],
          margin: [8, 0, 8, 12],
        },
      ];

      if (i > 0) {
        pagesContent.push({ text: '', pageBreak: 'before' });
      }
      pagesContent.push(...pageBody);
    }

    const docDefinition: any = {
      pageSize: 'LETTER',
      pageMargins: [24, 24, 24, 80],
      defaultStyle: {
        font: 'Helvetica',
        fontSize: 11,
        color: BRAND_DARK,
      },
      content: pagesContent,
      footer: (currentPage: number, pageCount: number) => ({
        stack: [
          {
            canvas: [
              {
                type: 'line',
                x1: 0,
                y1: 0,
                x2: 547,
                y2: 0,
                lineWidth: 0.5,
                lineColor: '#cbd5e1',
              },
            ],
            margin: [24, 0, 24, 6],
          },
          {
            text: 'QRTixPro - Plataforma oficial de venta y gestión de boletas digitales.',
            fontSize: 10,
            color: '#475569',
            alignment: 'center',
          },
          {
            text: 'Conserve este comprobante. Para soporte contáctese con el organizador del evento.',
            fontSize: 9,
            color: MUTED,
            alignment: 'center',
            margin: [0, 4, 0, 0],
          },
          {
            text: `Válido hasta agotar existencia. © ${new Date().getFullYear()} QRTixPro - Todos los derechos reservados.  -  Pág ${currentPage} de ${pageCount}`,
            fontSize: 8,
            color: MUTED,
            alignment: 'center',
            margin: [0, 4, 0, 0],
          },
        ],
      }),
    };

    const pdfDoc = printer.createPdfKitDocument(docDefinition);
    const chunks: Buffer[] = [];

    const pdfBuffer: Buffer = await new Promise((resolve, reject) => {
      pdfDoc.on('data', (chunk: any) => {
        try {
          chunks.push(Buffer.from(chunk));
        } catch (_) {
          chunks.push(chunk);
        }
      });
      pdfDoc.on('end', () => {
        try {
          resolve(Buffer.concat(chunks));
        } catch (err) {
          reject(err);
        }
      });
      pdfDoc.on('error', (err: any) => {
        console.error('[generate-tickets-pdfmake] PDF stream error:', err);
        reject(err);
      });
      try {
        pdfDoc.end();
      } catch (endErr: any) {
        reject(endErr);
      }
    });

    const filename = purchaseId
      ? `boletas-qrtixpro-${purchaseId}.pdf`
      : 'boletas-qrtixpro.pdf';

    console.log(
      `[generate-tickets-pdfmake] PDF OK. Tamaño: ${pdfBuffer.length} bytes. Archivo: ${filename}`
    );

    return new NextResponse(pdfBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': String(pdfBuffer.length),
        'Cache-Control':
          'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
      },
    });
  } catch (error: any) {
    console.error(
      '[generate-tickets-pdfmake] ERROR CRÍTICO:',
      error?.message ?? error
    );
    if (error?.stack) {
      console.error('[generate-tickets-pdfmake] STACK:', error.stack);
    }
    return NextResponse.json(
      {
        error: 'Error interno al generar las boletas.',
        detail: error?.message ? String(error.message) : undefined,
      },
      { status: 500 }
    );
  }
}
