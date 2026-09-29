# Ritmo Claro API

## Descripción

Ritmo Claro es una empresa que acompaña a equipos remotos en la creación
y seguimiento de hábitos de bienestar, como leer, realizar pausas activas
o meditar.

Actualmente, la información de los hábitos se gestiona mediante formularios
y hojas compartidas. Esto puede producir correos duplicados, estados escritos
de formas diferentes y riesgos de privacidad, ya que una persona podría
consultar o modificar información que no le pertenece.

El objetivo de este proyecto es desarrollar una API backend que permita
registrar usuarios, autenticar su identidad, gestionar hábitos de manera
segura y controlar el acceso según el rol y la propiedad de cada recurso.

La aplicación almacenará la información en PostgreSQL, utilizará Prisma
como ORM, JWT para autenticación, Swagger para documentación y Docker
para facilitar la ejecución en distintos entornos.

---

# Objetivo del MVP

El MVP permitirá que una persona se registre e inicie sesión para administrar
sus propios hábitos mediante una API REST.

Los usuarios con rol `USUARIO` podrán crear, consultar, modificar y eliminar
únicamente sus propios hábitos.

Los usuarios con rol `ADMIN`, además de poder administrar sus propios hábitos,
podrán consultar el listado general de hábitos registrados en el sistema.

El sistema deberá garantizar que:

- Cada usuario solo pueda acceder a sus propios hábitos.
- El identificador del propietario se obtenga del JWT.
- El cliente nunca pueda enviar `usuarioId` para apropiarse de un recurso.
- El registro público siempre cree usuarios con rol `USUARIO`.
- Solo un `ADMIN` pueda acceder al listado general.
- Las contraseñas nunca se almacenen en texto plano.
- Los secretos de configuración permanezcan fuera del repositorio.
- Los errores tengan un formato uniforme.
- La API esté documentada mediante Swagger.
- Los datos persistan en PostgreSQL.

---

# Alcance

## Funcionalidades incluidas

El MVP incluye:

- Registro de usuarios.
- Inicio de sesión.
- Autenticación mediante JWT.
- Hash de contraseñas mediante bcrypt.
- CRUD completo de hábitos.
- Control de propiedad de los hábitos.
- Control de acceso mediante roles.
- Ruta administrativa para consultar todos los hábitos.
- Validación de datos de entrada.
- Manejo uniforme de errores.
- Persistencia mediante PostgreSQL y Prisma.
- Documentación Swagger.
- Pruebas manuales mediante Postman.
- Dockerización.
- Despliegue público.

## Funcionalidades fuera del alcance

El MVP no incluye:

- Frontend.
- Aplicación móvil.
- Panel administrativo visual.
- Recordatorios.
- Rachas.
- Marcación diaria.
- Estadísticas.
- Notificaciones.
- Pagos.
- Inteligencia artificial.
- Recuperación de contraseña.
- Cambio público de rol.

---

# Actores del sistema

## Visitante

Persona que todavía no posee una sesión autenticada.

Puede:

- Registrar una cuenta.
- Iniciar sesión.

No puede acceder a los hábitos.

---

## USUARIO

Persona autenticada con rol `USUARIO`.

Puede:

- Crear hábitos.
- Consultar sus propios hábitos.
- Consultar un hábito propio.
- Modificar un hábito propio.
- Eliminar un hábito propio.

No puede:

- Consultar hábitos pertenecientes a otros usuarios.
- Modificar hábitos de otros usuarios.
- Eliminar hábitos de otros usuarios.
- Consultar el listado administrativo de todos los hábitos.
- Elegir o cambiar su rol mediante la API pública.

---

## ADMIN

Persona autenticada con rol `ADMIN`.

Puede:

- Crear sus propios hábitos.
- Consultar sus propios hábitos.
- Modificar sus propios hábitos.
- Eliminar sus propios hábitos.
- Consultar el listado general de hábitos registrados en el sistema.

El rol `ADMIN` no se asigna mediante el registro público.

---

# Historias de usuario

## HU-01 — Registro

Como visitante,
quiero crear una cuenta utilizando mi nombre, email y contraseña,
para poder identificarme y utilizar las funcionalidades protegidas
de Ritmo Claro.

### Resultado verificable

La API crea una cuenta con rol `USUARIO` sin permitir que el cliente
seleccione el rol.

---

## HU-02 — Inicio de sesión

Como usuario registrado,
quiero iniciar sesión utilizando mi email y contraseña,
para obtener un token que me permita acceder a las rutas protegidas.

### Resultado verificable

Cuando las credenciales son válidas, la API devuelve un `access_token`.

---

## HU-03 — Crear hábito

Como usuario autenticado,
quiero crear un hábito,
para organizar las actividades de bienestar que deseo realizar.

### Resultado verificable

El hábito queda asociado automáticamente al usuario identificado por
el JWT.

---

## HU-04 — Consultar mis hábitos

Como usuario autenticado,
quiero consultar mis hábitos,
para visualizar las actividades de bienestar que he registrado.

### Resultado verificable

La API devuelve únicamente los hábitos pertenecientes al usuario
autenticado.

---

## HU-05 — Consultar un hábito

Como usuario autenticado,
quiero consultar uno de mis hábitos mediante su identificador,
para visualizar sus detalles.

### Resultado verificable

La API devuelve el hábito únicamente cuando pertenece al usuario
autenticado.

---

## HU-06 — Actualizar hábito

Como usuario autenticado,
quiero modificar algunos datos de uno de mis hábitos,
para mantener actualizada su información.

### Resultado verificable

La API modifica únicamente los campos enviados y conserva los demás
valores existentes.

---

## HU-07 — Eliminar hábito

Como usuario autenticado,
quiero eliminar uno de mis hábitos,
para retirar del sistema una actividad que ya no deseo conservar.

### Resultado verificable

La API permite eliminar el hábito únicamente cuando pertenece al
usuario autenticado.

Después de eliminarlo, una nueva consulta del mismo recurso debe
indicar que ya no existe.

---

## HU-08 — Consulta administrativa

Como administrador,
quiero consultar los hábitos registrados por todas las personas,
para poder revisar el estado general de los programas de bienestar.

### Resultado verificable

La ruta administrativa permite el acceso únicamente a una identidad
autenticada con rol `ADMIN`.

---

# Modelo de datos

## Usuario

Un usuario contiene como mínimo:

- `id`
- `nombre`
- `email`
- `passwordHash`
- `rol`
- `creadoEn`

### Restricciones

- El `id` es autogenerado.
- El email debe ser único.
- La contraseña se almacena únicamente como hash.
- El rol puede ser `USUARIO` o `ADMIN`.
- El rol inicial es `USUARIO`.

---

## Habito

Un hábito contiene como mínimo:

- `id`
- `nombre`
- `descripcion`
- `estado`
- `frecuencia`
- `usuarioId`
- `creadoEn`

### Restricciones

El campo `nombre` debe contener entre:

- 3 caracteres mínimo.
- 120 caracteres máximo.

La descripción:

- Es opcional.
- Puede contener hasta 500 caracteres.

Valores válidos para `estado`:

- `ACTIVO`
- `PAUSADO`
- `ARCHIVADO`

Valores válidos para `frecuencia`:

- `DIARIA`
- `SEMANAL`
- `MENSUAL`

Cada hábito pertenece a un único usuario.

Un usuario puede tener múltiples hábitos.

---

# Endpoints

## Autenticación

### POST /auth/register

Acceso:

Público.

Permite registrar una cuenta.

El request puede recibir:

- nombre
- email
- password

No debe aceptar:

- rol
- usuarioId

Resultado esperado:

- Crea una cuenta.
- El rol asignado por el servidor es `USUARIO`.
- Nunca devuelve `passwordHash`.

---

### POST /auth/login

Acceso:

Público.

Permite validar las credenciales de una cuenta.

Resultado esperado:

Cuando las credenciales son correctas devuelve:

- `access_token`

El token contiene:

- `sub`
- `email`
- `rol`
- expiración

Las credenciales inválidas producen una respuesta genérica que no
permite conocer si el email existe.

---

# Hábitos

Todas las rutas de hábitos requieren autenticación.

---

### POST /habitos

Acceso:

Usuario autenticado.

Resultado:

Crea un hábito perteneciente al usuario autenticado.

El propietario se obtiene desde el JWT.

El request nunca debe aceptar `usuarioId`.

---

### GET /habitos

Acceso:

Usuario autenticado.

Resultado:

Devuelve únicamente los hábitos pertenecientes al usuario autenticado.

---

### GET /habitos/:id

Acceso:

Usuario autenticado y propietario del recurso.

Resultado:

Devuelve un hábito cuando pertenece al usuario autenticado.

Un usuario no puede consultar hábitos de otra persona.

---

### PATCH /habitos/:id

Acceso:

Usuario autenticado y propietario del recurso.

Resultado:

Actualiza únicamente los campos enviados.

Los campos no enviados deben conservar su valor anterior.

---

### DELETE /habitos/:id

Acceso:

Usuario autenticado y propietario del recurso.

Resultado:

Elimina el hábito cuando pertenece al usuario autenticado.

Después de eliminarlo, una nueva consulta del mismo identificador debe
producir `404 Not Found`.

---

### GET /habitos/admin/todos

Acceso:

Solo `ADMIN`.

Resultado:

Devuelve el listado general de hábitos registrados en el sistema.

La respuesta no debe incluir información sensible como:

- passwordHash
- contraseñas
- secretos
- cadenas de conexión

---

# Matriz de permisos

| Endpoint | Visitante | USUARIO | ADMIN | Restricción |
|---|---|---|---|---|
| POST /auth/register | Sí | Sí | Sí | Ruta pública |
| POST /auth/login | Sí | Sí | Sí | Ruta pública |
| POST /habitos | No | Sí | Sí | Requiere JWT |
| GET /habitos | No | Sí | Sí | Solo hábitos propios |
| GET /habitos/:id | No | Sí | Sí | Debe ser propietario |
| PATCH /habitos/:id | No | Sí | Sí | Debe ser propietario |
| DELETE /habitos/:id | No | Sí | Sí | Debe ser propietario |
| GET /habitos/admin/todos | No | No | Sí | Requiere rol ADMIN |

---

# Criterios de aceptación

## Registro

### CA-01 — Registro válido

Dado que un visitante utiliza un email no registrado,

cuando envía un nombre válido, un email válido y una contraseña válida,

entonces la API crea una cuenta con rol `USUARIO`.

---

### CA-02 — Email repetido

Dado que ya existe una cuenta con un determinado email,

cuando otra petición intenta registrar nuevamente el mismo email,

entonces la API responde con:

`409 Conflict`.

---

### CA-03 — Rol no permitido

Dado que el registro público solo debe crear usuarios normales,

cuando el cliente intenta enviar un campo `rol`,

entonces dicho campo no debe permitir crear una cuenta administrativa.

El servidor siempre asigna el rol inicial `USUARIO`.

---

### CA-04 — Datos de registro inválidos

Dado un request de registro,

cuando:

- el nombre tiene menos de 2 caracteres,
- el email no tiene formato válido,
- o la contraseña tiene menos de 8 caracteres,

entonces la API responde con:

`400 Bad Request`.

---

# Login

## CA-05 — Login válido

Dado un usuario registrado,

cuando proporciona email y contraseña correctos,

entonces la API devuelve un `access_token` válido.

---

## CA-06 — Login inválido

Dado un intento de autenticación,

cuando el email o la contraseña son incorrectos,

entonces la API responde con:

`401 Unauthorized`.

El mensaje debe ser genérico y no revelar cuál de las credenciales
fue incorrecta.

---

# Autenticación

## CA-07 — Acceso sin token

Dado que una ruta de hábitos requiere autenticación,

cuando una persona intenta acceder sin enviar un JWT válido,

entonces la API responde con:

`401 Unauthorized`.

---

## CA-08 — Token inválido

Dado un JWT alterado, vencido o inválido,

cuando se intenta utilizar para acceder a una ruta protegida,

entonces la API rechaza la petición con:

`401 Unauthorized`.

---

# Creación de hábitos

## CA-09 — Crear hábito

Dado un usuario autenticado,

cuando envía datos válidos para crear un hábito,

entonces la API crea el recurso y lo relaciona automáticamente con
el usuario identificado en el JWT.

---

## CA-10 — usuarioId no permitido

Dado un usuario autenticado,

cuando intenta enviar `usuarioId` en el request de creación,

entonces dicho valor no debe utilizarse para determinar el propietario.

El propietario se obtiene exclusivamente del JWT.

---

# Consulta de hábitos

## CA-11 — Listado propio

Dado un usuario autenticado,

cuando consulta:

`GET /habitos`

entonces la API devuelve únicamente sus propios hábitos.

---

## CA-12 — Recurso inexistente

Dado un identificador de hábito que no existe,

cuando el usuario intenta consultarlo,

entonces la API responde con:

`404 Not Found`.

---

# Propiedad

## CA-13 — Acceso a hábito de otro usuario

Dado:

- Usuario A
- Usuario B
- un hábito perteneciente al usuario A

cuando el usuario B intenta consultar el hábito del usuario A,

entonces la API responde con:

`403 Forbidden`.

---

## CA-14 — Modificación de hábito ajeno

Cuando el usuario B intenta modificar mediante `PATCH` un hábito
perteneciente al usuario A,

entonces la API responde con:

`403 Forbidden`.

---

## CA-15 — Eliminación de hábito ajeno

Cuando el usuario B intenta eliminar un hábito perteneciente al
usuario A,

entonces la API responde con:

`403 Forbidden`.

---

# Actualización

## CA-16 — Actualización parcial

Dado un hábito existente,

cuando su propietario modifica únicamente uno de sus campos mediante
`PATCH`,

entonces únicamente ese campo cambia.

Los demás campos conservan su valor anterior.

---

# Roles

## CA-17 — USUARIO intenta utilizar ruta administrativa

Dado un usuario autenticado con rol `USUARIO`,

cuando solicita:

`GET /habitos/admin/todos`

entonces la API responde con:

`403 Forbidden`.

---

## CA-18 — ADMIN utiliza ruta administrativa

Dado un usuario autenticado con rol `ADMIN`,

cuando solicita:

`GET /habitos/admin/todos`

entonces la API responde correctamente y devuelve el listado general
de hábitos sin información sensible.

---

# Eliminación

## CA-19 — Eliminación válida

Dado un hábito existente,

cuando su propietario solicita eliminarlo,

entonces el hábito es eliminado del sistema.

---

## CA-20 — Consulta posterior a eliminación

Dado un hábito que fue eliminado,

cuando se intenta consultar nuevamente utilizando su antiguo
identificador,

entonces la API responde con:

`404 Not Found`.

---

# Contrato de errores

Todos los errores deben mantener una estructura uniforme.

Formato esperado:

```json
{
  "statusCode": 400,
  "timestamp": "fecha-y-hora",
  "path": "/ruta",
  "message": "Descripción comprensible del error"
}