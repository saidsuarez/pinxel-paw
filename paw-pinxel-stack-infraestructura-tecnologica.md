# Paw Pinxel — Stack de infraestructura y tecnológico

## 1. Objetivo del proyecto

**Paw Pinxel** será la plataforma digital de registros veterinarios de Pinxel, accesible desde el subdominio:

```txt
paw.pinxel.co
```

El sistema permitirá que los clientes que compren un Registro Veterinario físico puedan tener también una versión digital asociada a un chip NFC.  
El NFC apuntará a una URL única del perfil de la mascota, permitiendo consultar una vista pública limitada y, mediante login, una vista privada editable.

---

## 2. Arquitectura recomendada

La arquitectura debe separar claramente la tienda principal del sistema digital.

```txt
pinxel.co
└── WordPress + WooCommerce
    └── Venta de productos físicos y personalizados

paw.pinxel.co
└── Aplicación web independiente
    ├── Registro digital veterinario
    ├── Login de usuarios
    ├── Perfil de mascotas
    ├── Historial médico
    ├── Vista pública NFC
    └── Panel privado del cliente
```

## 3. Decisión principal de arquitectura

### Recomendación

Usar **WordPress/WooCommerce únicamente para la venta** y crear `paw.pinxel.co` como una aplicación independiente.

### Razón

El Registro Veterinario Digital será un sistema vivo, con usuarios, mascotas, permisos, historial, privacidad, actualizaciones y posibles futuras funcionalidades como recordatorios, suscripciones o integración con veterinarias.  
Por eso conviene desarrollarlo fuera de WordPress, con una arquitectura más limpia y escalable.

---

## 4. Infraestructura base

## 4.1 Dominio principal

```txt
pinxel.co
```

Gestionado actualmente en DreamHost.

## 4.2 Subdominio de la app

```txt
paw.pinxel.co
```

Este será el dominio oficial del sistema digital de registros veterinarios.

## 4.3 Repositorio

El proyecto debe vivir en GitHub.

Nombre sugerido del repositorio:

```txt
pinxel-paw
```

Opción más descriptiva:

```txt
pinxel-paw-registry
```

## 4.4 Ambientes recomendados

Se recomienda trabajar con tres ambientes:

```txt
local
staging
production
```

### Local

Para desarrollo con Codex y pruebas en máquina local.

```txt
http://localhost:3000
```

### Staging

Para revisar cambios antes de publicar.

```txt
https://staging-paw.pinxel.co
```

O, si se usa Vercel:

```txt
https://pinxel-paw-staging.vercel.app
```

### Production

Ambiente real para clientes.

```txt
https://paw.pinxel.co
```

---

# 5. Stack tecnológico recomendado

## 5.1 Frontend

### Opción recomendada

```txt
Next.js
```

### Razones

- Permite crear una app moderna basada en React.
- Tiene buen manejo de rutas públicas y privadas.
- Permite SSR/SSG si en el futuro se necesitan páginas públicas optimizadas.
- Se integra bien con Vercel.
- Facilita crear API routes si se necesitan endpoints propios.
- Es ideal para trabajar con Codex.

## 5.2 Lenguaje

```txt
TypeScript
```

### Razones

- Reduce errores en formularios, modelos de datos y permisos.
- Ayuda a Codex a mantener una estructura más clara.
- Facilita escalar el proyecto.

## 5.3 UI / Estilos

### Recomendado

```txt
Tailwind CSS
```

Opcional:

```txt
shadcn/ui
```

### Razones

- Tailwind permite construir rápido una interfaz limpia.
- shadcn/ui puede acelerar componentes como botones, formularios, tabs, cards, dialogs y tablas.
- Mantiene una base visual profesional sin depender de plantillas pesadas.

## 5.4 Backend y base de datos

### Opción recomendada

```txt
Supabase
```

### Servicios a usar

```txt
Supabase Auth
Supabase Database
Supabase Storage
Supabase Row Level Security
Supabase Edge Functions, si se necesitan más adelante
```

### Razones

- Usa PostgreSQL.
- Tiene autenticación integrada.
- Permite políticas de seguridad por fila.
- Facilita relaciones entre usuarios, mascotas, registros médicos y archivos.
- Tiene panel administrativo visual.
- Es más estructurado que Firebase para datos relacionales como mascotas, vacunas, registros, usuarios y propietarios.

## 5.5 Base de datos

```txt
PostgreSQL
```

Manejada a través de Supabase.

---

# 6. Hosting

## 6.1 Recomendación principal

Aunque DreamHost puede alojar archivos o aplicaciones dependiendo del plan, para este proyecto se recomienda usar:

```txt
Vercel
```

Para desplegar la app Next.js.

## 6.2 Configuración del dominio

El dominio seguirá estando en DreamHost, pero el subdominio `paw.pinxel.co` puede apuntar a Vercel mediante DNS.

### Configuración general

En DreamHost se debe crear un registro DNS para:

```txt
paw.pinxel.co
```

Apuntando a Vercel según la configuración que Vercel entregue.

Normalmente se usará un registro tipo:

```txt
CNAME
```

Ejemplo conceptual:

```txt
paw  CNAME  cname.vercel-dns.com
```

La configuración exacta debe copiarse desde el panel de Vercel al conectar el dominio.

## 6.3 Alternativa

Alojar directamente en DreamHost solo si el plan permite ejecutar correctamente una app Node/Next.js.  
Si DreamHost solo se usa como hosting tradicional PHP/WordPress, no es la mejor opción para esta app.

---

# 7. Estructura general del proyecto

Estructura sugerida:

```txt
pinxel-paw/
├── app/
│   ├── page.tsx
│   ├── layout.tsx
│   ├── login/
│   ├── dashboard/
│   ├── pets/
│   ├── pets/[id]/
│   ├── p/[publicToken]/
│   └── api/
├── components/
│   ├── ui/
│   ├── forms/
│   ├── layout/
│   ├── pets/
│   └── records/
├── lib/
│   ├── supabase/
│   ├── auth/
│   ├── validations/
│   └── utils/
├── types/
│   ├── database.ts
│   ├── pet.ts
│   ├── user.ts
│   └── veterinary-record.ts
├── styles/
├── public/
├── docs/
│   ├── architecture.md
│   ├── database-schema.md
│   ├── user-flows.md
│   ├── nfc-flow.md
│   └── api-contracts.md
├── .env.example
├── package.json
├── README.md
└── next.config.js
```

---

# 8. Módulos principales

## 8.1 Módulo de autenticación

Funciones:

- Registro de usuario.
- Login.
- Recuperación de contraseña.
- Verificación de correo.
- Cierre de sesión.
- Protección de rutas privadas.

Roles iniciales:

```txt
admin
customer
```

Roles futuros posibles:

```txt
veterinarian
staff
viewer
```

## 8.2 Módulo de propietarios

Datos sugeridos:

```txt
id
user_id
full_name
email
phone
city
country
created_at
updated_at
```

## 8.3 Módulo de mascotas

Datos sugeridos:

```txt
id
owner_id
name
species
breed
sex
birth_date
color
weight
photo_url
public_token
nfc_enabled
is_public_enabled
created_at
updated_at
```

## 8.4 Módulo de historial veterinario

Tipos de registros:

```txt
vaccination
deworming
medical_visit
medication
allergy
surgery
note
lab_result
```

Datos sugeridos:

```txt
id
pet_id
record_type
title
description
date
veterinarian_name
clinic_name
next_due_date
attachment_url
created_at
updated_at
```

## 8.5 Módulo NFC

Cada mascota tendrá un token público único.

Ejemplo:

```txt
https://paw.pinxel.co/p/bruna-8F3K2
```

La URL pública debe mostrar solo información permitida.

### Vista pública sugerida

- Nombre de la mascota.
- Foto.
- Especie.
- Raza.
- Alergias importantes.
- Contacto de emergencia, si el dueño lo permite.
- Estado básico del carnet.
- Botón para contactar al dueño.

### Vista privada

- Información completa.
- Edición de datos.
- Historial completo.
- Archivos.
- Recordatorios.
- Configuración de privacidad.

## 8.6 Módulo de privacidad

Cada dueño debe poder decidir qué información se muestra públicamente.

Opciones sugeridas:

```txt
show_pet_photo
show_owner_name
show_owner_phone
show_emergency_contact
show_vaccination_status
show_allergies
show_medical_notes
```

## 8.7 Módulo de administración

Panel interno para Pinxel.

Funciones:

- Ver clientes.
- Ver mascotas registradas.
- Activar/desactivar NFC.
- Reasignar registros.
- Crear mascotas manualmente.
- Ver órdenes asociadas de WooCommerce.
- Generar o copiar URL NFC.
- Revisar estado de registros.

---

# 9. Integración con WooCommerce

## 9.1 Objetivo

Cuando un cliente compre un Registro Veterinario con opción digital/NFC, WooCommerce debe poder enviar información básica a `paw.pinxel.co`.

## 9.2 Datos que WooCommerce debería enviar

```txt
order_id
customer_name
customer_email
customer_phone
product_id
product_name
pet_name
nfc_enabled
personalization_data
purchase_date
```

## 9.3 Flujo inicial recomendado

Para el MVP, se puede manejar de forma semiautomática:

1. Cliente compra en WooCommerce.
2. Pinxel revisa la orden.
3. Pinxel crea o activa el registro digital en el panel admin.
4. El sistema genera la URL pública.
5. Pinxel programa el NFC con esa URL.
6. Cliente recibe acceso.

## 9.4 Flujo avanzado futuro

Automatización completa:

1. Cliente compra en WooCommerce.
2. WooCommerce envía un webhook a `paw.pinxel.co`.
3. La app crea el usuario si no existe.
4. La app crea la mascota.
5. La app genera el token público.
6. La app envía email de acceso.
7. Pinxel programa el NFC.

---

# 10. Seguridad

## 10.1 Principios

- No exponer datos privados en la vista NFC.
- Usar tokens públicos difíciles de adivinar.
- Separar vista pública y vista privada.
- Proteger todas las rutas privadas con login.
- Usar Row Level Security en Supabase.
- No guardar claves secretas en el frontend.
- Usar variables de entorno.

## 10.2 Variables de entorno

Archivo sugerido:

```txt
.env.local
```

Ejemplo:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
WOOCOMMERCE_CONSUMER_KEY=
WOOCOMMERCE_CONSUMER_SECRET=
WOOCOMMERCE_WEBHOOK_SECRET=
NEXT_PUBLIC_APP_URL=https://paw.pinxel.co
```

## 10.3 Archivo público de ejemplo

Crear:

```txt
.env.example
```

Sin claves reales.

## 10.4 Reglas importantes

- Nunca subir `.env.local` a GitHub.
- Nunca exponer `SUPABASE_SERVICE_ROLE_KEY` en el navegador.
- La vista pública NFC debe consultar solo campos permitidos.
- El cliente solo puede editar sus propias mascotas.
- El admin puede gestionar todos los registros.

---

# 11. Base de datos inicial sugerida

Tablas mínimas para MVP:

```txt
profiles
pets
veterinary_records
public_profile_settings
woocommerce_orders
```

## 11.1 profiles

```sql
id uuid primary key
user_id uuid references auth.users(id)
full_name text
email text
phone text
role text
created_at timestamp
updated_at timestamp
```

## 11.2 pets

```sql
id uuid primary key
owner_id uuid references profiles(id)
name text
species text
breed text
sex text
birth_date date
color text
weight numeric
photo_url text
public_token text unique
nfc_enabled boolean
is_public_enabled boolean
created_at timestamp
updated_at timestamp
```

## 11.3 veterinary_records

```sql
id uuid primary key
pet_id uuid references pets(id)
record_type text
title text
description text
date date
veterinarian_name text
clinic_name text
next_due_date date
attachment_url text
created_at timestamp
updated_at timestamp
```

## 11.4 public_profile_settings

```sql
id uuid primary key
pet_id uuid references pets(id)
show_pet_photo boolean
show_owner_name boolean
show_owner_phone boolean
show_emergency_contact boolean
show_vaccination_status boolean
show_allergies boolean
show_medical_notes boolean
created_at timestamp
updated_at timestamp
```

## 11.5 woocommerce_orders

```sql
id uuid primary key
woo_order_id text
customer_email text
customer_name text
customer_phone text
product_name text
pet_id uuid references pets(id)
status text
created_at timestamp
updated_at timestamp
```

---

# 12. Rutas principales

## 12.1 Públicas

```txt
/
```

Landing o pantalla informativa de Paw Pinxel.

```txt
/p/[publicToken]
```

Vista pública NFC de la mascota.

```txt
/login
```

Ingreso de usuarios.

```txt
/register
```

Registro de usuarios, si se habilita públicamente.

```txt
/forgot-password
```

Recuperación de contraseña.

## 12.2 Privadas

```txt
/dashboard
```

Resumen del usuario.

```txt
/pets
```

Listado de mascotas.

```txt
/pets/new
```

Crear mascota.

```txt
/pets/[id]
```

Detalle privado de mascota.

```txt
/pets/[id]/edit
```

Editar mascota.

```txt
/pets/[id]/records
```

Historial veterinario.

```txt
/pets/[id]/records/new
```

Agregar registro.

```txt
/settings
```

Configuración de cuenta.

## 12.3 Admin

```txt
/admin
```

Panel administrativo.

```txt
/admin/pets
```

Gestión de mascotas.

```txt
/admin/orders
```

Órdenes asociadas.

```txt
/admin/nfc
```

Gestión de URLs NFC.

---

# 13. MVP recomendado

## Fase 1 — Base funcional

Objetivo: lanzar una primera versión usable.

Incluye:

- Login de usuarios.
- Panel de cliente.
- Crear y editar mascota.
- Vista pública NFC.
- Vista privada de mascota.
- Crear registros veterinarios básicos.
- Configuración de privacidad.
- Panel admin básico.
- Generación de token público.
- Programación manual del NFC.

## Fase 2 — Integración con WooCommerce

Incluye:

- Guardar ID de orden WooCommerce.
- Webhook desde WooCommerce.
- Creación semiautomática de registros.
- Envío de email de activación.
- Panel admin con órdenes pendientes.

## Fase 3 — Producto premium

Incluye:

- Recordatorios de vacunas.
- Adjuntos PDF o imágenes.
- Exportar carnet en PDF.
- Historial visual.
- Múltiples mascotas por usuario.
- Notificaciones por email.
- Integración con WhatsApp.
- Planes pagos o renovación anual.

## Fase 4 — Ecosistema

Incluye:

- Perfil para veterinarias.
- Validación de registros por veterinarios.
- QR/NFC avanzado.
- App móvil o PWA.
- Marketplace de productos para mascotas.
- Integración con productos físicos personalizados de Pinxel.

---

# 14. PWA

Se recomienda que `paw.pinxel.co` pueda convertirse en PWA.

Beneficios:

- El usuario puede instalar el carnet en su celular.
- Se siente como una app.
- No obliga a pasar por App Store o Play Store.
- Ideal para clientes que consultan el carnet frecuentemente.

---

# 15. Diseño UX recomendado

## 15.1 Estilo visual

Debe sentirse como una extensión premium de Pinxel:

- Limpio.
- Amigable.
- Con enfoque emocional.
- Fácil de usar.
- Muy claro para usuarios no técnicos.

## 15.2 Pantallas clave

- Dashboard con tarjetas de mascotas.
- Perfil visual de mascota.
- Botón claro para “Agregar registro”.
- Estado del NFC.
- Vista pública bonita y rápida.
- Configuración simple de privacidad.

## 15.3 Principio de UX

El usuario no debe sentir que está llenando una historia clínica compleja.  
Debe sentir que está organizando la vida de su compañero peludo de forma simple, bonita y segura.

---

# 16. Branding del producto

Nombre del sistema:

```txt
Paw Pinxel
```

Nombre descriptivo:

```txt
Registro Veterinario Digital
```

Posibles frases:

```txt
El carnet digital de tu compañero peludo.
```

```txt
Toda la información importante de tu mascota, organizada y siempre a la mano.
```

```txt
Un registro físico y digital para cuidar mejor a tu compañero peludo.
```

---

# 17. Comandos iniciales sugeridos

## Crear proyecto Next.js

```bash
npx create-next-app@latest pinxel-paw
```

Opciones recomendadas:

```txt
TypeScript: Yes
ESLint: Yes
Tailwind CSS: Yes
App Router: Yes
src directory: Optional
Import alias: Yes
```

## Instalar Supabase

```bash
npm install @supabase/supabase-js
```

## Instalar utilidades recomendadas

```bash
npm install zod react-hook-form
```

Opcional:

```bash
npx shadcn@latest init
```

---

# 18. Reglas para Codex

## 18.1 Principios de desarrollo

- No mezclar lógica de negocio con componentes visuales.
- Crear tipos TypeScript para cada entidad.
- Usar validaciones con Zod.
- Mantener rutas públicas y privadas separadas.
- No exponer claves privadas.
- Crear componentes reutilizables.
- Documentar decisiones importantes en `/docs`.
- Crear primero MVP, luego automatizaciones.

## 18.2 Prioridad inicial para Codex

Orden recomendado:

1. Crear estructura base del proyecto.
2. Configurar Tailwind.
3. Configurar Supabase client.
4. Crear tipos base.
5. Crear rutas públicas.
6. Crear autenticación.
7. Crear dashboard privado.
8. Crear CRUD de mascotas.
9. Crear vista pública por token.
10. Crear CRUD de registros veterinarios.
11. Crear configuración de privacidad.
12. Crear panel admin básico.
13. Preparar integración WooCommerce.

---

# 19. Consideraciones legales y de privacidad

El sistema manejará datos personales del propietario de la mascota.  
Se debe incluir:

- Política de tratamiento de datos.
- Consentimiento al crear cuenta.
- Opción para editar datos.
- Opción para solicitar eliminación de cuenta.
- Información pública configurable.
- Términos de uso.

La vista NFC nunca debe mostrar datos privados sin consentimiento explícito.

---

# 20. Resumen de decisión

La estructura recomendada para Pinxel es:

```txt
pinxel.co
```

Para vender productos físicos y personalizados con WooCommerce.

```txt
paw.pinxel.co
```

Para el sistema digital independiente de registros veterinarios.

Stack recomendado:

```txt
Next.js + TypeScript + Tailwind CSS + Supabase + Vercel + GitHub
```

Esta arquitectura permite iniciar rápido, trabajar bien con Codex, mantener el sistema limpio y escalar el Registro Veterinario Digital como producto premium dentro del ecosistema Pinxel.


---

# 21. Ajuste final MVP (con login de usuario)

## Enfoque definitivo para iniciar

El sistema **sí debe incluir login desde el inicio**, pero manteniendo una arquitectura simple y controlada.

## 21.1 Componentes del MVP

### 1. Vista pública NFC

Ruta:

```txt
/p/[publicToken]
```

Contenido:

- Nombre de la mascota
- Foto
- Especie / raza
- Alergias importantes
- Contacto de emergencia (opcional)
- Estado básico del carnet

### 2. Login de usuario

Ruta:

```txt
/login
```

Funcionalidad:

- Acceso con email y contraseña
- Recuperación de contraseña

### 3. Panel del cliente

Ruta:

```txt
/dashboard
```

El usuario puede:

- Editar información de su mascota
- Actualizar vacunas
- Agregar desparasitaciones
- Agregar notas médicas
- Subir foto
- Configurar privacidad de datos públicos

### 4. Panel admin (interno)

Ruta:

```txt
/admin
```

Funciones:

- Crear usuario
- Crear mascota
- Asociar mascota a usuario
- Generar URL pública (token NFC)
- Editar registros
- Reenviar acceso al cliente

---

## 21.2 Flujo manual inicial (sin automatización)

1. Cliente compra el producto
2. Pinxel crea usuario desde el admin
3. Pinxel crea la mascota
4. Se genera el token público
5. Se programa el NFC con la URL
6. Cliente recibe acceso por correo o WhatsApp
7. Cliente actualiza su registro

---

## 21.3 Alcance del MVP (lo que SÍ incluye)

- Autenticación de usuarios
- CRUD de mascotas
- CRUD de registros veterinarios
- Vista pública NFC
- Configuración de privacidad
- Panel admin básico

---

## 21.4 Alcance excluido del MVP (por ahora)

No incluir en esta fase:

- Integración con WooCommerce
- Automatización de creación de usuarios
- Roles avanzados (veterinarios, staff)
- Recordatorios automáticos
- Exportación a PDF
- Integraciones externas
- Sistema de pagos dentro de paw
- Aplicación móvil

---

## 21.5 Principio clave del MVP

El sistema debe cumplir:

```txt
Admin crea → Cliente edita → NFC muestra
```

Todo lo demás es expansión futura.

---

## 21.6 Objetivo del MVP

Validar que:

- El cliente percibe valor en el registro digital
- El flujo NFC funciona correctamente
- El usuario realmente usa el sistema
- El producto se puede vender de forma recurrente

Una vez validado esto, se escala el sistema.

