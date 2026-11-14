"use client";

import { Suspense, use } from "react";
import { Skeleton } from "@/components/ui/Skeleton";
import { TaskDetailScreen } from "@/components/tareas/TaskDetailScreen";

function TareaDetailInner({ params }: Pick<PageProps<"/tareas/[id]">, "params">) {
  const { id } = use(params);
  return <TaskDetailScreen id={id} />;
}

export default function TareaDetailPage({ params }: PageProps<"/tareas/[id]">) {
  return (
    <Suspense fallback={<Skeleton variant="card" count={1} />}>
      <TareaDetailInner params={params} />
    </Suspense>
  );
}
