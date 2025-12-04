// app/api/poster/route.tsx
import { NextRequest } from 'next/server'; // Rimuovi NextResponse se non lo usi altrove
import { renderToBuffer } from '@react-pdf/renderer';
import { PosterDocument } from '@/app/documents/PosterDocument';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    if (!data.title || !data.description) {
      return Response.json( // Usa Response.json invece di NextResponse.json
        { error: 'Missing required fields: title, description' },
        { status: 400 }
      );
    }

    const buffer = await renderToBuffer(<PosterDocument data={data} />);

    return new Response(buffer as any, { // Usa new Response
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename="poster.pdf"',
      },
    });
  } catch (error: any) {
    console.error('Error generating PDF', error);
    return Response.json(
      { error: 'Failed to generate PDF', details: error.message },
      { status: 500 }
    );
  }
}
