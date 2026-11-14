-- Esquema inicial: Sistema Gestor - PP
-- Tareas, finanzas (transacciones/presupuestos) y metas de ahorro.

create extension if not exists "pgcrypto";

-- Categorías de gasto/ingreso (Vivienda, Ocio, Comida, Transporte, ...)
create table categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  nombre text not null,
  tipo text not null check (tipo in ('gasto', 'ingreso')),
  icono text,
  created_at timestamptz not null default now()
);

-- Tareas (incluye tareas que son pagos pendientes)
create table tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  category_id uuid references categories (id) on delete set null,
  titulo text not null,
  nota text,
  fecha_vencimiento date,
  costo_previsto numeric(12, 2),
  prioridad text not null default 'media' check (prioridad in ('alta', 'media', 'baja')),
  estado text not null default 'pendiente' check (estado in ('pendiente', 'hecho')),
  recordatorio text,
  es_pago boolean not null default false,
  created_at timestamptz not null default now()
);

-- Movimientos de dinero reales (ingresos y gastos)
create table transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  category_id uuid references categories (id) on delete set null,
  task_id uuid references tasks (id) on delete set null,
  tipo text not null check (tipo in ('ingreso', 'gasto')),
  monto numeric(12, 2) not null,
  fecha date not null default current_date,
  descripcion text,
  created_at timestamptz not null default now()
);

-- Límites de presupuesto mensual por categoría
create table budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  category_id uuid not null references categories (id) on delete cascade,
  mes date not null,
  limite numeric(12, 2) not null,
  created_at timestamptz not null default now(),
  unique (user_id, category_id, mes)
);

-- Metas de ahorro
create table savings_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  nombre text not null,
  objetivo numeric(12, 2) not null,
  ahorrado_actual numeric(12, 2) not null default 0,
  plazo date,
  es_principal boolean not null default false,
  created_at timestamptz not null default now()
);

-- Aportes a una meta de ahorro
create table savings_contributions (
  id uuid primary key default gen_random_uuid(),
  goal_id uuid not null references savings_goals (id) on delete cascade,
  monto numeric(12, 2) not null,
  fecha date not null default current_date,
  created_at timestamptz not null default now()
);

-- Eventos de agenda/calendario (puede referenciar una tarea, un pago o ser libre)
create table calendar_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  titulo text not null,
  descripcion text,
  fecha date not null,
  tipo text not null check (tipo in ('tarea', 'pago', 'evento')),
  task_id uuid references tasks (id) on delete cascade,
  transaction_id uuid references transactions (id) on delete cascade,
  created_at timestamptz not null default now()
);

create index on tasks (user_id, fecha_vencimiento);
create index on transactions (user_id, fecha);
create index on budgets (user_id, mes);
create index on savings_contributions (goal_id);
create index on calendar_events (user_id, fecha);

-- Row Level Security: cada usuario solo ve/edita sus propios datos
alter table categories enable row level security;
alter table tasks enable row level security;
alter table transactions enable row level security;
alter table budgets enable row level security;
alter table savings_goals enable row level security;
alter table savings_contributions enable row level security;
alter table calendar_events enable row level security;

create policy "categories_own" on categories
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "tasks_own" on tasks
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "transactions_own" on transactions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "budgets_own" on budgets
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "savings_goals_own" on savings_goals
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "calendar_events_own" on calendar_events
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- savings_contributions no tiene user_id directo: se valida a través de la meta
create policy "savings_contributions_own" on savings_contributions
  for all using (
    exists (
      select 1 from savings_goals g
      where g.id = savings_contributions.goal_id and g.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from savings_goals g
      where g.id = savings_contributions.goal_id and g.user_id = auth.uid()
    )
  );
