import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import type { TransactionInsert } from "@/types/transaction";

export async function GET(request: NextRequest) {
  const supabase = getSupabaseServerClient();
  const params = request.nextUrl.searchParams;
  const categoryId = params.get("category_id");
  const tipo = params.get("tipo");
  const desde = params.get("desde");
  const hasta = params.get("hasta");

  let query = supabase.from("transactions").select("*").eq("eliminado", false).order("fecha", { ascending: false });

  if (categoryId) query = query.eq("category_id", categoryId);
  if (tipo) query = query.eq("tipo", tipo);
  if (desde) query = query.gte("fecha", desde);
  if (hasta) query = query.lte("fecha", hasta);

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const supabase = getSupabaseServerClient();
  const body = await request.json();

  if (!body.user_id || !body.tipo || body.monto === undefined) {
    return NextResponse.json({ error: "user_id, tipo y monto son obligatorios" }, { status: 400 });
  }

  if (!["ingreso", "gasto"].includes(body.tipo)) {
    return NextResponse.json({ error: "tipo debe ser 'ingreso' o 'gasto'" }, { status: 400 });
  }

  const nuevaTransaccion: TransactionInsert = {
    user_id: body.user_id,
    tipo: body.tipo,
    monto: body.monto,
    category_id: body.category_id ?? null,
    task_id: body.task_id ?? null,
    fecha: body.fecha ?? undefined,
    descripcion: body.descripcion ?? null,
    limite: body.limite ?? null,
  };

  const { data, error } = await supabase.from("transactions").insert(nuevaTransaccion).select().single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
