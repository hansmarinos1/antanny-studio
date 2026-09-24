import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Buscar cliente
    const { data: cliente, error: errCliente } = await supabase
      .from('clientes')
      .select('*')
      .eq('id_cliente', id)
      .single();

    if (errCliente || !cliente) {
      return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 });
    }

    // Buscar fidelidad
    const { data: fidelidad, error: errFidelidad } = await supabase
      .from('fidelidad')
      .select('*')
      .eq('id_cliente', id)
      .single();

    return NextResponse.json({
      cliente,
      fidelidad: fidelidad || { puntos: 0, nivel: 'Clásico' }
    });

  } catch (error) {
    console.error('Error en API perfil:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}