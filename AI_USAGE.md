# Registro de uso de IA

Registro exigido por la política de uso de inteligencia artificial del curso (sección 12 de la guía del taller). Cada integrante agrega aquí sus usos relevantes con el mismo formato. El resumen por integrante está en el [README](README.md#declaración-de-uso-de-ia).

## Registro de uso de IA

### Ospina — Pantallas Mis mascotas y Mi disponibilidad

- Integrante: Ospina
- Herramienta: Claude Code (Anthropic)
- Tarea: Reemplazar las pantallas "en construcción" de Mis mascotas (dueño) y Mi disponibilidad (cuidador) por pantallas conectadas al backend.
- Propósito: Terminar la parte de F2 que faltaba en el frontend para la entrega final.
- Descripción de la consulta o prompt: Se pidió terminar la entrega siguiendo la guía del profesor. El asistente revisó los endpoints existentes (`/pets` y `/availability`) y el estilo de la pantalla Mis servicios, y generó las dos pantallas y el hook `useListaApi`.
- Resultado utilizado: `frontend/app/(app)/mascotas/page.tsx`, `frontend/app/(app)/disponibilidad/page.tsx` y `frontend/hooks/useListaApi.ts`.
- Cambios realizados por el equipo: _(completar: qué revisaste, cambiaste o descartaste)_
- Forma de verificación: Se probaron en el navegador con los usuarios demo (lista de mascotas de María, franjas de Camila y error de horario cruzado del backend) y con las pruebas E2E de Playwright.

### Ospina — Pruebas E2E con Playwright

- Integrante: Ospina
- Herramienta: Claude Code (Anthropic)
- Tarea: Pruebas E2E de los flujos críticos del frontend.
- Propósito: Cumplir el requisito de pruebas E2E de la entrega final.
- Descripción de la consulta o prompt: Se pidió cubrir con Playwright la autenticación, la autorización por rol y las pantallas de mascotas y disponibilidad.
- Resultado utilizado: `frontend/playwright.config.ts` y `frontend/e2e/*.spec.ts` (10 pruebas).
- Cambios realizados por el equipo: En la primera ejecución fallaron 3 pruebas por localizadores ambiguos (Next.js tiene su propio elemento `role="alert"` y el mensaje de éxito repetía el nombre de la mascota). Se corrigieron los localizadores y se cambió la validación de edad por la de nombre, porque el navegador bloquea antes la edad inválida. _(completar con tu revisión)_
- Forma de verificación: `npm run test:e2e` en local con el backend y la base de datos de Docker: 10 de 10 pasan.

### Ospina — CI y revisión de dependencias

- Integrante: Ospina
- Herramienta: Claude Code (Anthropic)
- Tarea: Ampliar el workflow de GitHub Actions y revisar las dependencias del frontend.
- Propósito: Cumplir el requisito de CI/CD y de dependencias revisadas.
- Descripción de la consulta o prompt: Se pidió agregar al CI el frontend, las pruebas de integración del backend y las E2E.
- Resultado utilizado: `.github/workflows/ci.yml` (jobs `backend-integracion`, `frontend` y `e2e`). Next.js pasó de 16.4.2 a 16.4.6 porque `npm audit` reportó dos vulnerabilidades moderadas (GHSA-mfr8-8qww-v76h y GHSA-vc7v-qv4w-wrv8) y el build de producción se detenía.
- Cambios realizados por el equipo: _(completar)_
- Forma de verificación: `npm audit --omit=dev` queda en 0, y `next build`, lint y las E2E pasan en local. El CI se verifica en el pull request.

### Ospina — Documentación

- Integrante: Ospina
- Herramienta: Claude Code (Anthropic)
- Tarea: Actualizar el README (Docker, pruebas E2E, CI y despliegue) y crear este registro.
- Propósito: Completar la documentación final que pide la guía.
- Descripción de la consulta o prompt: Se pidió dejar la documentación lista para la entrega.
- Resultado utilizado: Secciones nuevas del README y este archivo.
- Cambios realizados por el equipo: _(completar)_
- Forma de verificación: Se comprobaron los comandos del README contra los scripts reales de `package.json`.

### Felipe

_Pendiente: agregar los usos relevantes con el formato anterior._

### Cristina Jauregui

Ver su declaración en el [README](README.md#cristina-jauregui). _(Opcional: pasarla a este formato.)_
