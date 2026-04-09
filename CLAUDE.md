# ScopeCalc LV — CLAUDE.md

## Qué es este proyecto
App web de estimación low voltage para CCTV, ACS, Intrusion y Fire Alarm. Uso interno + posible SaaS.

## Stack
Next.js 14 App Router | Supabase | Vercel | TypeScript | Tailwind

## Reglas críticas
1. Unidad interna: SIEMPRE ft. Conversión × 0.3048 solo en display
2. Costo interno y precio cliente NUNCA en la misma vista
3. Assembly snapshot al emitir versión
4. Prioridad precio: cotización actual > última cotización > referencial
5. Precio NO obligatorio para ítem del catálogo

## Cómo trabajar
Al iniciar sesión:
1. Leer tareas incompletas Asana proyecto ID: 1213550972625453
2. Tomar primera tarea P0 o P1 pendiente en orden
3. Ejecutar instrucciones completas de la descripción
4. Verificar checklist de pruebas
5. Marcar como completada en Asana
6. Commit con mensaje indicado

## Estado
- Fase 1 (MVP): ✅ COMPLETA — P0-01 a P0-13 completadas
- Fase 2 (Plan Reader): pendiente tareas P1-01, P1-02
- URL producción: https://scopecalc-lv.vercel.app
- Supabase Project Ref: ryxecsfgibymigirylsc

## Estructura clave
src/app/(auth)/       — login, auth routes
src/app/(dashboard)/  — dashboard, proyectos, catálogo, assemblies
src/components/ui/    — componentes reutilizables
src/lib/supabase/     — client.ts (browser) + server.ts (SSR)
src/lib/units.ts      — convertLength, formatLength
src/types/database.ts — tipos generados desde Supabase

## Orden de tareas
P0-01 → P0-02 → P0-03 → P0-04 → P0-05 → P0-06 → P0-07 → P0-08 → P0-09 → P0-10 → P0-11 → P0-12 → P0-13 → P1-01 → P1-02
