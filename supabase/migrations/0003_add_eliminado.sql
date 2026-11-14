-- Borrado lógico: las tareas y movimientos "eliminados" dejan de listarse pero quedan en la base.
alter table tasks add column eliminado boolean not null default false;
alter table transactions add column eliminado boolean not null default false;

create index on tasks (user_id, eliminado);
create index on transactions (user_id, eliminado);
