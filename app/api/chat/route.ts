import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

// Asegúrate de agregar GEMINI_API_KEY en tu Vercel y en tu .env.local
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: Request) {
  try {
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
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { respuesta: "Lo siento, mi conexión neuronal está en mantenimiento. Intenta en unos minutos." },
      { status: 500 }
    );
  }
}