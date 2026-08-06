# ProAm Elite League

Plataforma oficial de la competición ProAm Elite League: web pública (clasificación, equipos, jugadores, estadísticas, calendario, noticias, torneos e historial de temporadas) + panel de administración.

## Stack

- **Next.js 14** (App Router) — frontend y API routes
- **PostgreSQL** — base de datos relacional
- **Prisma** — ORM, ver `prisma/schema.prisma` para el modelo de datos completo
- **NextAuth** — autenticación del panel de admin
- **TailwindCSS** — estilos

## Cómo poner esto en marcha (en tu máquina o en un entorno con internet)

1. **Instala dependencias**
   ```bash
   npm install
   ```

2. **Configura la base de datos**
   Crea un archivo `.env` en la raíz con:
   ```
   DATABASE_URL="postgresql://usuario:password@localhost:5432/proam_elite"
   NEXTAUTH_SECRET="genera_un_secreto_aleatorio"
   NEXTAUTH_URL="http://localhost:3000"

   # PayPal — necesitas una cuenta Business gratuita en developer.paypal.com
   NEXT_PUBLIC_PAYPAL_CLIENT_ID="tu_client_id_de_paypal"
   PAYPAL_CLIENT_ID="tu_client_id_de_paypal"
   PAYPAL_CLIENT_SECRET="tu_client_secret_de_paypal"
   PAYPAL_ENV="sandbox"
   ```
   Si no quieres instalar Postgres localmente, puedes crear una base de datos gratuita en [Supabase](https://supabase.com) o [Railway](https://railway.app) y pegar la URL que te den.

   **Sobre PayPal:** ve a [developer.paypal.com](https://developer.paypal.com), crea una cuenta gratuita, entra en "Apps & Credentials" y crea una app — ahí te dan el Client ID y el Secret. Empieza siempre en modo "Sandbox" (pagos de prueba, sin dinero real) hasta que confirmes que todo funciona; luego cambias `PAYPAL_ENV` a `"live"` y usas las claves de producción.

3. **Crea las tablas a partir del schema**
   ```bash
   npx prisma migrate dev --name init
   ```

4. **Carga datos de ejemplo** (equipos, jugadores, partidos, clasificación y noticias de prueba, para ver la home funcionando de inmediato)
   ```bash
   npm run prisma:seed
   ```

5. **Arranca el proyecto**
   ```bash
   npm run dev
   ```
   Verás la web en `http://localhost:3000`, con datos reales viniendo de tu base de datos — no datos fijos en el código. Cuando conectes el panel de administración, cualquier cambio que hagas ahí (nuevo partido, nueva noticia, actualizar estadísticas) se reflejará aquí automáticamente.

## Modelo de datos — filosofía

El schema está diseñado para que **nada se pierda entre temporadas**. Un jugador conserva su perfil permanente (`Player`) mientras que sus estadísticas, equipo y premios de cada temporada se guardan por separado (`PlayerSeasonStats`, `Award`). Esto permite reconstruir la trayectoria completa de cualquier jugador o equipo, temporada a temporada, para siempre.

## Próximos pasos sugeridos

- [ ] Diseñar las páginas públicas: home, clasificación, equipos, jugadores, calendario, noticias, torneos
- [ ] Construir el panel de admin (CRUD sobre todas las entidades del schema)
- [ ] Sistema de autenticación de administradores
- [ ] Página de perfil de jugador con pestaña de "Historial de temporadas"
- [ ] Página de perfil de equipo con historial de récords
- [ ] Módulo de torneos con cuadro de eliminatorias visual
