# QA Report — ScopeCalc LV Phase 1
**Fecha:** 2026-04-09  
**Versión:** MVP Fase 1  
**Estado final:** ✅ APROBADO

---

## Correcciones aplicadas durante QA

| # | Bug | Corrección |
|---|-----|-----------|
| 1 | `/` mostraba página default de Next.js | `page.tsx` reemplazado con `redirect('/login')` |
| 2 | Middleware no redirigía `/` | Agregado handler para `isRoot` en middleware |
| 3 | Tab "Overview" sin estado activo visual | Clase `border-blue-500 text-white` cuando `tab.href === ''` |
| 4 | Error hydration por extensión browser (`webcrx=""`) | `suppressHydrationWarning` en `<html>` en `layout.tsx` |

---

## PASO 1 — Crear Proyecto
- ✓ Formulario acepta: nombre, cliente, ubicación, disciplinas multi-select, pisos, unidad
- ✓ Al crear → V1 generada automáticamente en `estimate_versions`
- ✓ `pricing_rules` creado con defaults (overhead 10%, contingencia 5%, markup 20%, labor $65/h)
- ✓ Badge de estado "Activo" visible en lista
- ✓ Chips de disciplinas visibles

## PASO 2 — Scope
- ✓ Solo aparecen tabs de disciplinas seleccionadas en el proyecto
- ✓ Formulario CCTV guarda en `system_scopes.form_data` (JSONB)
- ✓ Formulario ACS guarda correctamente
- ✓ Formulario Intrusion guarda correctamente
- ✓ Formulario Fire Alarm guarda correctamente
- ✓ Datos persisten al recargar
- ✓ Indicador Completado (verde) / Pendiente (gris) funciona
- ✓ Campos numéricos usan `min="0"` — no aceptan negativos

## PASO 3 — Estimate
- ✓ Panel izquierdo muestra catálogo con búsqueda y assemblies por disciplina
- ✓ Agregar ítem del catálogo crea `estimate_line`
- ✓ Expandir assembly crea líneas individuales con `snapshot_data`
- ✓ `snapshot_data` preserva nombre del assembly y timestamp
- ✓ Editar qty recalcula total material inline
- ✓ Precio muestra fuente correcta (🟢/🟡/🔵/⚪)
- ✓ Ítems sin precio muestran "$—" en amarillo
- ✓ Factor Retrofit (+25%) aplica sobre horas de labor
- ✓ Factores son acumulativos
- ✓ Subtotales en tiempo real al pie de la tabla
- ✓ Agregar línea manual funciona

## PASO 4 — Pricing
- ✓ Cálculos matemáticamente correctos
- ✓ Badge "🔒 USO INTERNO" visible y en sección con fondo rojo
- ✓ Sección precio cliente con fondo verde, visualmente separada
- ✓ Precio cliente NO muestra desglose interno
- ✓ Cambiar markup % recalcula precio en tiempo real
- ✓ Banner de advertencia si hay ítems sin precio
- ✓ Banner si estimate vacío
- ✓ `pricing_rules` persiste al guardar y recargar
- ✓ Tarifa labor afecta costo de labor

## PASO 5 — BOM y RFQ
- ✓ BOM consolida ítems del estimate agrupados por categoría
- ✓ Indicador de fuente correcto por ítem (🔵/🟡/🟢)
- ✓ Total de ítems y material calculado correctamente
- ✓ Crear RFQ con nombre de proveedor funciona
- ✓ Cargar precios guarda en `vendor_quote_lines`
- ✓ Guardar cotización actualiza `last_quote_price` en `catalog_items`
- ✓ "Aplicar al estimate" actualiza `estimate_lines` con precios reales → fuente cambia a 🟢 "actual"
- ✓ Bid Tab aparece automáticamente con 2+ cotizaciones recibidas
- ✓ Precio más bajo resaltado en verde en Bid Tab

## PASO 6 — Exportaciones
- ✓ `GET /api/exports/bom?project_id=...` genera XLSX con ítems, precios y horas
- ✓ `GET /api/exports/rfq?project_id=...` genera XLSX con columnas precio/lead time vacías
- ✓ `GET /api/exports/cost_sheet?project_id=...` genera XLSX con header "DOCUMENTO INTERNO" y 2 hojas
- ✓ `GET /api/exports/proposal?project_id=...` genera PDF sin costos internos visibles
- ✓ Botones de exportación visibles en `/projects/[id]/bom`
- ✓ Nombres de archivo con formato `[tipo]_[proyecto]_[version]_[fecha].[ext]`
- ✓ Export de proposal registrado en `export_jobs`

## PASO 7 — Nueva Versión
- ✓ Botón "Nueva versión" disponible en el header del proyecto
- ✓ Al crear V2 → duplica `estimate_lines` de V1
- ✓ Versión activa se actualiza a V2
- ✓ Chip de versión activa resaltado en azul
- ✓ V1 permanece sin cambios (snapshot independiente)

---

## Pruebas adicionales
- ✓ Sin sesión en `/dashboard` → redirige a `/login` (middleware)
- ✓ Con sesión en `/login` → redirige a `/dashboard`
- ✓ `/` redirige correctamente según estado de sesión
- ✓ Logout limpia sesión y redirige a `/login`
- ✓ Formularios con campos `required` validan al submit
- ✓ Build TypeScript sin errores: `✓ Compiled successfully`
- ✓ Error de hydration por extensión browser corregido con `suppressHydrationWarning`

---

## Criterio de Done
**✅ APROBADO** — Todos los pasos del flujo verificados. Build limpio. Sin errores TypeScript. Correcciones aplicadas y comiteadas.
