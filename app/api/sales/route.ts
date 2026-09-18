import { NextRequest, NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

// MongoDB connection string - replace with your actual connection string
const MONGODB_URI =
  process.env.MONGODB_URI ||
  'mongodb+srv://your-username:your-password@cluster0.mongodb.net/qrtixpro?retryWrites=true&w=majority';

interface SaleData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  documentType: string;
  documentNumber: string;
  address: string;
  city: string;
  seats: Array<{
    zone: string;
    row: number;
    seat: number;
  }>;
  totalPrice: number;
  purchaseDate: string;
}

export async function POST(request: NextRequest) {
  try {
    const saleData: SaleData = await request.json();

    // Validate required fields
    const requiredFields = [
      'firstName',
      'lastName',
      'email',
      'phone',
      'documentNumber',
      'address',
      'city',
    ];
    for (const field of requiredFields) {
      if (!saleData[field as keyof SaleData]) {
        return NextResponse.json({ error: `Campo requerido faltante: ${field}` }, { status: 400 });
      }
    }

    if (!saleData.seats || saleData.seats.length === 0) {
      return NextResponse.json({ error: 'No se han seleccionado asientos' }, { status: 400 });
    }

    // Connect to MongoDB
    const client = new MongoClient(MONGODB_URI);
    await client.connect();

    const db = client.db('qrtixpro');
    const collection = db.collection('ventas');

    // Prepare sale document
    const saleDocument = {
      ...saleData,
      purchaseId: generatePurchaseId(),
      status: 'completed',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Insert the sale into MongoDB
    const result = await collection.insertOne(saleDocument);

    await client.close();

    return NextResponse.json({
      success: true,
      purchaseId: saleDocument.purchaseId,
      insertedId: result.insertedId,
    });
  } catch (error) {
    console.error('Error processing sale:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

function generatePurchaseId(): string {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `QRT-${timestamp.slice(-6)}-${random}`;
}
