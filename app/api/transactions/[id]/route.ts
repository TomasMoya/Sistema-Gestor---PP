import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import type { TransactionUpdate } from "@/types/transaction";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = getSupabaseServerClient();

  const { data, error } = await supabase.from("transactions").select("*").eq("id", id).single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  return NextResponse.json(data);
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = getSupabaseServerClient();
  const body = await request.json();

  const camposPermitidos = ["category_id", "task_id", "tipo", "monto", "fecha", "descripcion", "limite", "eliminado"] as const;

  const update: TransactionUpdate = {};
  for (const campo of camposPermitidos) {
    if (campo in body) (update as Record<string, unknown>)[campo] = body[campo];
  }

  if ("tipo" in update && !["ingreso", "gasto"].includes(update.tipo as string)) {
    return NextResponse.json({ error: "tipo debe ser 'ingreso' o 'gasto'" }, { status: 400 });
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "No se envió ningún campo para actualizar" }, { status: 400 });
  }

  const { data, error } = await supabase.from("transactions").update(update).eq("id", id).select().single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

/** Borrado lógico: marca `eliminado` en vez de borrar la fila. */
export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = getSupabaseServerClient();

  const { error } = await supabase.from("transactions").update({ eliminado: true }).eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
