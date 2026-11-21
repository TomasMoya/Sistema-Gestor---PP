export type Coins = "ARS" | "BOB" | "CLP" | "COP" | "EUR" | "GBP" | "NZD" | "PEN" | "PYG" | "USD" | "UYU" | "VES"

export const COIN_OPTIONS: Coins[] = ["ARS", "BOB", "CLP", "COP", "EUR", "GBP", "NZD", "PEN", "PYG", "USD", "UYU", "VES"];

export class Coin {
    monedaACalcular?: string;
    valorUnitario?: number;
    conversion?: number;

    
}