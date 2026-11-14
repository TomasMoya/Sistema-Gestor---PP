import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import type { TaskInsert } from "@/types/task";

export async function GET(request: NextRequest) {
  const supabase = getSupabaseServerClient();
  const categoryId = request.nextUrl.searchParams.get("category_id");

  let query = supabase.from("tasks").select("*").eq("eliminado", false).order("fecha_vencimiento", { ascending: true });

  if (categoryId) {
    query = query.eq("category_id", categoryId);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const supabase = getSupabaseServerClient();
  const body = await request.json();

  if (!body.user_id || !body.titulo) {
    return NextResponse.json({ error: "user_id y titulo son obligatorios" }, { status: 400 });
  }

  const nuevaTarea: TaskInsert = {
    user_id: body.user_id,
    titulo: body.titulo,
    category_id: body.category_id ?? null,
    nota: body.nota ?? null,
    fecha_vencimiento: body.fecha_vencimiento ?? null,
    costo_previsto: body.costo_previsto ?? null,
    prioridad: body.prioridad ?? "media",
    estado: body.estado ?? "pendiente",
    recordatorio: body.recordatorio ?? null,
    es_pago: body.es_pago ?? false,
  };

  const { data, error } = await supabase.from("tasks").insert(nuevaTarea).select().single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
