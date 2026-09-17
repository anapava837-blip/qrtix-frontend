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
  };
  seats: Array<{
    zone: string;
    row: number;
    seat: number;
  }>;
  totalPrice: number;
}

export async function POST(request: NextRequest) {
  try {
    const ticketData: TicketData = await request.json();
    
    // Create PDF document
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const chunks: Buffer[] = [];
    
    doc.on('data', (chunk) => chunks.push(chunk));
    
    const pdfPromise = new Promise<Buffer>((resolve) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)));
    });
    
    // Generate a ticket for each seat
    for (let i = 0; i < ticketData.seats.length; i++) {
      const seat = ticketData.seats[i];
      
      if (i > 0) {
        doc.addPage();
      }
      
      await generateTicketPage(doc, ticketData, seat, i + 1);
    }
    
    doc.end();
    
    const pdfBuffer = await pdfPromise;
    
    return new NextResponse(pdfBuffer as BodyInit, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="entradas.pdf"',
      },
    });
    
  } catch (error) {
    console.error('Error generating tickets:', error);
    return NextResponse.json(
      { error: 'Error al generar las entradas' },
      { status: 500 }
    );
  }
}

async function generateTicketPage(
  doc: PDFKit.PDFDocument, 
  ticketData: TicketData, 
  seat: { zone: string; row: number; seat: number },
  ticketNumber: number
) {
  const { customerData } = ticketData;
  
  // Header
  doc.fontSize(24)
     .fillColor('#007bff')
     .text('QRTixPro', 50, 50, { align: 'center' });
  
  doc.fontSize(18)
     .fillColor('#333')
     .text('ENTRADA DIGITAL', 50, 80, { align: 'center' });
  
  // Ticket information
  doc.fontSize(14)
     .fillColor('#000')
     .text(`Entrada #${ticketNumber}`, 50, 130);
  
  // Event details (you can customize this)
  doc.fontSize(12)
     .text('Evento: Evento Deportivo', 50, 160)
     .text('Fecha: Por confirmar', 50, 180)
     .text('Lugar: Estadio Principal', 50, 200);
  
  // Seat information
  doc.fontSize(16)
     .fillColor('#007bff')
     .text('INFORMACIÓN DEL ASIENTO', 50, 240);
  
  doc.fontSize(14)
     .fillColor('#000')
     .text(`Zona: ${seat.zone.toUpperCase()}`, 50, 270)
     .text(`Fila: ${seat.row}`, 50, 290)
     .text(`Asiento: ${seat.seat}`, 50, 310);
  
  // Customer information
  doc.fontSize(16)
     .fillColor('#007bff')
     .text('INFORMACIÓN DEL TITULAR', 50, 350);
  
  doc.fontSize(12)
     .fillColor('#000')
     .text(`Nombre: ${customerData.firstName} ${customerData.lastName}`, 50, 380)
     .text(`Documento: ${customerData.documentType} - ${customerData.documentNumber}`, 50, 400)
     .text(`Email: ${customerData.email}`, 50, 420)
     .text(`Teléfono: ${customerData.phone}`, 50, 440);
  
  // Generate QR Code
  const qrData = JSON.stringify({
    ticketId: `QRT-${Date.now()}-${ticketNumber}`,
    zone: seat.zone,
    row: seat.row,
    seat: seat.seat,
    customer: `${customerData.firstName} ${customerData.lastName}`,
    document: customerData.documentNumber,
    timestamp: new Date().toISOString()
  });
  
  try {
    const qrCodeDataURL = await QRCode.toDataURL(qrData, {
      width: 200,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    
    // Convert data URL to buffer
    const qrBuffer = Buffer.from(qrCodeDataURL.split(',')[1], 'base64');
    
    // Add QR code to PDF
    doc.image(qrBuffer, 350, 350, { width: 150, height: 150 });
    
    doc.fontSize(10)
       .fillColor('#666')
       .text('Código QR para validación', 350, 510, { width: 150, align: 'center' });
    
  } catch (qrError) {
    console.error('Error generating QR code:', qrError);
    doc.fontSize(12)
       .fillColor('#dc3545')
       .text('Error al generar código QR', 350, 400);
  }
  
  // Footer
  doc.fontSize(10)
     .fillColor('#666')
     .text('Esta entrada es válida únicamente para el evento especificado.', 50, 700, { align: 'center' })
     .text('Conserve este documento para el ingreso al evento.', 50, 715, { align: 'center' });
  
  // Border
  doc.rect(30, 30, doc.page.width - 60, doc.page.height - 60)
     .stroke('#007bff');
}