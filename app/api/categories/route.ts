import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import type { CategoryInsert } from "@/types/category";

export async function GET(request: NextRequest) {
  const supabase = getSupabaseServerClient();
  const tipo = request.nextUrl.searchParams.get("tipo");

  let query = supabase.from("categories").select("*").order("nombre", { ascending: true });
  if (tipo) query = query.eq("tipo", tipo);

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const supabase = getSupabaseServerClient();
  const body = await request.json();

  if (!body.user_id || !body.nombre || !body.tipo) {
    return NextResponse.json({ error: "user_id, nombre y tipo son obligatorios" }, { status: 400 });
  }

  const nuevaCategoria: CategoryInsert = {
    user_id: body.user_id,
    nombre: body.nombre,
    tipo: body.tipo,
    icono: body.icono ?? null,
  };

  const { data, error } = await supabase.from("categories").insert(nuevaCategoria).select().single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
