-- Agrega límite opcional a las transacciones
alter table transactions
  add column limite integer;
