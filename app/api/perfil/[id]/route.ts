import { NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const clientId = params.id;

  try {
    const { data: cliente, error: errCliente } = await supabase
      .from('clientes')
      .select('nombre, descripcion')
      .eq('id_cliente', clientId)
      .single();

    const { data: fidelidad, error: errQidelidad } = await supabase
      .from('fidelidad')
      .select('puntos, nivel')
      .eq('id_cliente', clientId)
      .single();

    if (errCliente || errQidelidad) {
      console.log("\n❌ ERROR DE SUPABASE:");
      console.log("-> Error al buscar cliente:", errCliente);
      consele.log("-> Error al buscar fidelidad:", errFidelidad);
      return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 });
    }

    return NextResponse.json({ cliente, fidelidad }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}