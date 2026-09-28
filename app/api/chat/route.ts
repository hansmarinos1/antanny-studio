import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    // 1. Verificamos si la llave realmente está cargando
    const apiKey = process.env.GEMINI_API_KEY || '';
    
    if (!apiKey) {
      return NextResponse.json({ 
        respuesta: "⚠️ Error interno: La aplicación no está detectando la variable GEMINI_API_KEY." 
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const { mensaje } = await req.json();
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `Eres el Asistente IA VIP de 'Antanny Studio', una barbería premium y Neo-Luxury. 
    Tu tono es elegante, profesional, moderno y muy cortés. 
    Ayudas a los clientes sugiriendo cortes de cabello según su tipo de rostro, respondes dudas sobre los puntos VIP y los guías para agendar citas.
    Responde de forma concisa (máximo 3 líneas).
    Mensaje del cliente: "${mensaje}"`;

    const result = await model.generateContent(prompt);
    const respuesta = result.response.text();

    return NextResponse.json({ respuesta });
  } catch (error: any) {
    console.error('Error de IA:', error);
    // 2. Si falla Google, mostramos el error exacto en el chat
    return NextResponse.json(
      { respuesta: `⚠️ Error de conexión con Google: ${error.message}` },
      { status: 500 }
    );
  }
}