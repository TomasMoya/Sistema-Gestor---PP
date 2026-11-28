# Historial de versiones

Todas las versiones y los commits incluidos, de la más reciente a la más antigua.

> **Un push, una versión**
> Se revisan todos los commits del push y se aplica el incremento de mayor prioridad: `mayor` > `feat` > `fix`.

## Reglas de incremento

Se reconoce el prefijo al inicio del mensaje de commit.

| Prefijo | Incremento | Ejemplo | Efecto |
| --- | --- | --- | --- |
| `mayor:` | MAYOR | 1.1.1 → 2.0.0 | Reinicia menor y parche |
| `feat:` | MENOR | 1.1.1 → 1.2.0 | Reinicia el parche |
| `fix:` | PARCHE | 1.1.1 → 1.1.2 | Conserva mayor y menor |

## Versiones publicadas

### 0.4.0

0.3.1 → 0.4.0 · Incremento menor · 1 commits · 2026-11-28

**Nuevas funcionalidades**

- `fa0bac1` feat: Adding the calendar with tasks and finances

---


### 0.3.1

0.3.0 → 0.3.1 · Incremento parche · 1 commits · 2026-11-23

**Correcciones**

- `16207ed` fix: Adding focus on search component after click de search icon and deleting an duplicated sorter icon

---


### 0.3.0

0.2.0 → 0.3.0 · Incremento menor · 1 commits · 2026-11-21

**Nuevas funcionalidades**

- `0863496` feat: Adding option for create personalized categories in tasks and finances

---


### 0.2.0

0.1.2 → 0.2.0 · Incremento menor · 1 commits · 2026-11-21

**Nuevas funcionalidades**

- `b227c4b` feat: adding function to convert the total ammount to another currency and select a default currency using the Exchange Rate API

---


### 0.1.2

0.1.1 → 0.1.2 · Incremento parche · 1 commits · 2026-11-14

**Correcciones**

- `3302157` fix: agrega el workflow de versionado y el .gitignore que faltaban subir

---


### 0.1.1 — Versión inicial

Punto de partida del historial. Los siguientes incrementos se calculan desde esta versión.

---

### Notas de la convención

- Sin `mayor:`, `feat:` o `fix:`, no se incrementa la versión.
- `mayor:` es una regla propia; Conventional Commits utiliza `!` o `BREAKING CHANGE` para cambios incompatibles.
