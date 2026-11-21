import { NextRequest, NextResponse } from "next/server";

interface ExchangeRatePairResponse {
  result: string;
  base_code: string;
  target_code: string;
  conversion_rate: number;
}

/**
 * Hace de intermediario con ExchangeRate-API para no exponer EXCHANGE_RATE_API_KEY al navegador:
 * `convertTo` (lib/format.ts) corre client-side y llama a esta ruta en vez de a la API externa.
 */
export async function GET(request: NextRequest) {
  const from = request.nextUrl.searchParams.get("from");
  const to = request.nextUrl.searchParams.get("to");

  if (!from || !to) {
    return NextResponse.json({ error: "from y to son obligatorios" }, { status: 400 });
  }

  const apiKey = process.env.EXCHANGE_RATE_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Falta la variable de entorno EXCHANGE_RATE_API_KEY" }, { status: 500 });
  }

  const url = "https://v6.exchangerate-api.com/v6/" + apiKey + "/pair/" + from + "/" + to;
  const response = await fetch(url);
  if (!response.ok) {
    return NextResponse.json({ error: `ExchangeRate-API respondió con estado ${response.status}` }, { status: 502 });
  }

  const data: ExchangeRatePairResponse = await response.json();
  if (data.result !== "success") {
    return NextResponse.json({ error: `ExchangeRate-API devolvió un resultado inesperado: ${data.result}` }, { status: 502 });
  }

  return NextResponse.json({ conversion_rate: data.conversion_rate });
}
