"use client";

import { Suspense, use } from "react";
import { Skeleton } from "@/components/ui/Skeleton";
import { MovementsScreen } from "@/components/finanzas/MovementsScreen";
import { dateToMonthKey, getToday } from "@/lib/format";

function FinanzasDetalleInner({ searchParams }: { searchParams: Promise<{ month?: string }> }) {
  const { month } = use(searchParams);
  return <MovementsScreen month={month ?? dateToMonthKey(getToday())} />;
}

export default function FinanzasDetallePage({ searchParams }: { searchParams: Promise<{ month?: string }> }) {
  return (
    <Suspense fallback={<Skeleton count={5} />}>
      <FinanzasDetalleInner searchParams={searchParams} />
    </Suspense>
  );
}
