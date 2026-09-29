# Decisiones de alcance, permisos y criterios de aceptación

Este documento registra las principales decisiones tomadas para el desarrollo de **Ritmo Claro API**.

El objetivo es dejar definido el comportamiento esperado de la aplicación antes de implementar la lógica del backend, especialmente en situaciones relacionadas con autenticación, autorización, propiedad de recursos, manejo de errores y eliminación de hábitos.

---

# 1. Identidad del usuario

## Decisión

La identidad del usuario que realiza una petición se obtendrá exclusivamente del **JWT autenticado**.

El sistema nunca utilizará un `usuarioId` enviado por el cliente para determinar el propietario de un hábito.

## Justificación

Aceptar un `usuarioId` desde el body permitiría que un usuario intentara crear o modificar recursos asociados a otra cuenta.

El JWT ya representa una identidad autenticada y validada por el servidor, por lo que debe ser la fuente utilizada para determinar quién realiza la operación.

## Ejemplo

Usuario autenticado:

```text
sub = 15
```

Petición:

```json
{
  "nombre": "Meditar",
  "frecuencia": "DIARIA",
  "usuarioId": 30
}
```

El valor `usuarioId = 30` no debe utilizarse para establecer el propietario.

El hábito debe quedar asociado al usuario autenticado:

```text
usuarioId = 15
```

---

# 2. Registro de usuarios

## Decisión

El endpoint:

```text
POST /auth/register
```

solo permitirá registrar cuentas con el rol:

```text
USUARIO
```

El cliente no podrá seleccionar el rol durante el registro.

## Justificación

Permitir que el cliente envíe el rol podría provocar una escalada de privilegios.

Por ejemplo, un usuario podría intentar enviar:

```json
{
  "nombre": "Usuario",
  "email": "usuario@example.com",
  "password": "12345678",
  "rol": "ADMIN"
}
```

Aunque el cliente envíe ese campo, el servidor nunca debe utilizarlo para crear una cuenta administrativa.

El rol `ADMIN` será asignado fuera del flujo público de registro.

---

# 3. Email único

## Decisión

El email de cada usuario será único.

Cuando una persona intente registrar un email que ya se encuentra registrado, la API responderá con:

```text
409 Conflict
```

## Justificación

La petición puede estar correctamente formada, pero entra en conflicto con un recurso existente.

El email será además protegido mediante una restricción de unicidad en la base de datos.

---

# 4. Contraseñas

## Decisión

Las contraseñas nunca se almacenarán directamente en la base de datos.

El sistema almacenará únicamente:

```text
passwordHash
```

generado mediante `bcrypt`.

## Justificación

Una contraseña no debe almacenarse en texto plano.

El hash permitirá verificar las credenciales durante el login sin conservar la contraseña original.

Además, `passwordHash` nunca debe ser enviado en respuestas HTTP.

---

# 5. Credenciales inválidas

## Decisión

Cuando una persona intente iniciar sesión con credenciales incorrectas, la respuesta será:

```text
401 Unauthorized
```

El mensaje será genérico.

Por ejemplo:

```json
{
  "message": "Credenciales inválidas"
}
```

## Justificación

El sistema no debe indicar si:

- el email no existe;
- o la contraseña es incorrecta.

Diferenciar ambos casos podría permitir que una persona descubra cuáles emails están registrados en el sistema.

---

# 6. Diferencia entre 401 y 403

## Decisión

Se utilizará:

```text
401 Unauthorized
```

cuando no exista una identidad autenticada válida.

Ejemplos:

- No se proporciona un JWT.
- El JWT está vencido.
- El JWT fue alterado.
- El JWT no puede validarse.
- Las credenciales del login son inválidas.

Se utilizará:

```text
403 Forbidden
```

cuando exista una identidad válida, pero dicha identidad no tenga permiso para realizar la operación.

Ejemplos:

- Un usuario intenta consultar el hábito de otra persona.
- Un usuario intenta modificar el hábito de otra persona.
- Un usuario intenta eliminar el hábito de otra persona.
- Un usuario con rol `USUARIO` intenta acceder a una ruta exclusiva de `ADMIN`.

## Justificación

Autenticación y autorización representan responsabilidades diferentes.

La autenticación responde:

> ¿Quién eres?

La autorización responde:

> ¿Tienes permiso para realizar esta acción?

---

# 7. Acceso a hábitos de otros usuarios

## Decisión

Cuando un usuario autenticado intente consultar, modificar o eliminar un hábito que existe pero pertenece a otra persona, la API responderá:

```text
403 Forbidden
```

## Ejemplo

Usuario A crea:

```text
Hábito #10
```

Usuario B intenta ejecutar:

```text
GET /habitos/10
```

Resultado:

```text
403 Forbidden
```

También debe producir `403` si Usuario B intenta:

```text
PATCH /habitos/10
```

o:

```text
DELETE /habitos/10
```

## Justificación

El recurso existe, pero la persona autenticada no es su propietaria.

Por tanto, existe una identidad válida pero no existe autorización para realizar la operación.

---

# 8. Recurso inexistente

## Decisión

Cuando un usuario solicite un hábito cuyo identificador no existe, la API responderá:

```text
404 Not Found
```

## Ejemplo

Petición:

```text
GET /habitos/999999
```

Si el hábito no existe:

```text
404 Not Found
```

## Justificación

`404` representa que el recurso solicitado no fue encontrado.

Este caso es diferente a un recurso que sí existe pero pertenece a otro usuario.

---

# 9. Propiedad de los hábitos

## Decisión

Todos los hábitos tendrán un propietario.

La relación será:

```text
Usuario 1 -------- N Habitos
```

Un usuario puede tener múltiples hábitos.

Cada hábito pertenece a un único usuario.

## Justificación

La propiedad permite garantizar el aislamiento de información entre las diferentes cuentas.

Las consultas normales siempre deben limitar los resultados al usuario autenticado.

---

# 10. Creación de hábitos

## Decisión

Cuando un usuario autenticado cree un hábito mediante:

```text
POST /habitos
```

el `usuarioId` será establecido por el servidor utilizando el identificador contenido en el JWT.

El DTO de creación no permitirá recibir:

```text
id
usuarioId
creadoEn
```

## Justificación

Esos valores son responsabilidad del servidor.

Permitir que el cliente controle `usuarioId` rompería el modelo de seguridad basado en propiedad.

---

# 11. Listado de hábitos

## Decisión

El endpoint:

```text
GET /habitos
```

devolverá únicamente los hábitos pertenecientes al usuario autenticado.

## Ejemplo

Si existen los siguientes registros:

```text
Hábito 1 -> Usuario A
Hábito 2 -> Usuario A
Hábito 3 -> Usuario B
```

Cuando Usuario A consulte:

```text
GET /habitos
```

la API devolverá:

```text
Hábito 1
Hábito 2
```

El hábito perteneciente al Usuario B no debe aparecer.

---

# 12. Consulta individual

## Decisión

El endpoint:

```text
GET /habitos/:id
```

solo devolverá el recurso cuando:

1. El hábito exista.
2. El usuario esté autenticado.
3. El usuario sea propietario del hábito.

## Resultados posibles

Sin token:

```text
401 Unauthorized
```

Hábito existente perteneciente a otra persona:

```text
403 Forbidden
```

Hábito inexistente:

```text
404 Not Found
```

Hábito propio existente:

```text
200 OK
```

---

# 13. Actualización de hábitos

## Decisión

La actualización se realizará mediante:

```text
PATCH /habitos/:id
```

y será una actualización parcial.

Solo se modificarán los campos enviados en la petición.

## Ejemplo

Estado actual:

```json
{
  "nombre": "Leer",
  "descripcion": "Leer 20 minutos",
  "estado": "ACTIVO",
  "frecuencia": "DIARIA"
}
```

Petición:

```json
{
  "estado": "PAUSADO"
}
```

Resultado esperado:

```json
{
  "nombre": "Leer",
  "descripcion": "Leer 20 minutos",
  "estado": "PAUSADO",
  "frecuencia": "DIARIA"
}
```

## Justificación

Los campos que no forman parte de la petición no deben modificarse ni perder su valor.

---

# 14. Eliminación de hábitos

## Decisión

El endpoint:

```text
DELETE /habitos/:id
```

eliminará permanentemente el registro cuando:

1. El hábito exista.
2. El usuario tenga una identidad válida.
3. El hábito pertenezca al usuario autenticado.

La implementación utilizará:

```text
204 No Content
```

como respuesta para una eliminación exitosa.

Después de eliminar el hábito, una nueva consulta utilizando el mismo identificador deberá producir:

```text
404 Not Found
```

## Ejemplo

Primera petición:

```text
DELETE /habitos/10
```

Resultado:

```text
204 No Content
```

Luego:

```text
GET /habitos/10
```

Resultado:

```text
404 Not Found
```

## Justificación

El MVP no requiere:

- papelera;
- restauración;
- historial de eliminaciones;
- soft delete.

Por lo tanto, se realizará una eliminación física del registro.

> **Nota:** el taller exige demostrar que después de eliminar el recurso una nueva consulta produce `404`, pero no establece un código HTTP específico para la respuesta exitosa de `DELETE`. Para este proyecto se adopta `204 No Content` como decisión de implementación.

---

# 15. Ruta administrativa

## Decisión

El endpoint:

```text
GET /habitos/admin/todos
```

solo podrá ser utilizado por una identidad autenticada con rol:

```text
ADMIN
```

Será necesario cumplir simultáneamente:

1. JWT válido.
2. Rol `ADMIN`.

## Resultados

Sin JWT:

```text
401 Unauthorized
```

JWT válido con rol `USUARIO`:

```text
403 Forbidden
```

JWT válido con rol `ADMIN`:

```text
200 OK
```

## Justificación

La autenticación comprueba la identidad del usuario.

La autorización basada en roles comprueba si dicha identidad posee los privilegios requeridos para acceder a la información global.

---

# 16. Respuesta administrativa

## Decisión

La ruta administrativa devolverá únicamente la información necesaria sobre los hábitos.

Nunca deberá devolver información sensible como:

```text
passwordHash
JWT_SECRET
DATABASE_URL
contraseñas
```

## Justificación

El hecho de que un usuario sea administrador no significa que las respuestas HTTP deban exponer secretos o credenciales internas.

---

# 17. Cambio de rol y JWT

## Decisión

El JWT incluirá el rol que tenía el usuario en el momento en que fue emitido.

Si posteriormente el rol cambia en la base de datos, el JWT emitido anteriormente conservará el rol original hasta que:

- expire;
- o se emita un nuevo token.

## Ejemplo

Token emitido:

```json
{
  "sub": 5,
  "email": "usuario@example.com",
  "rol": "USUARIO"
}
```

Posteriormente, en la base de datos:

```text
USUARIO -> ADMIN
```

El token anterior seguirá conteniendo:

```text
rol = USUARIO
```

Por tanto, será necesario iniciar sesión nuevamente para obtener un token con el nuevo rol.

---

# 18. Validación de registro

## Decisión

El registro deberá validar:

### Nombre

Mínimo:

```text
2 caracteres
```

### Email

Debe tener formato válido.

### Password

Mínimo:

```text
8 caracteres
```

Los datos inválidos responderán:

```text
400 Bad Request
```

---

# 19. Validación de hábitos

## Decisión

Los hábitos deberán cumplir las siguientes reglas.

### Nombre

Longitud mínima:

```text
3 caracteres
```

Longitud máxima:

```text
120 caracteres
```

### Descripción

Será opcional.

Longitud máxima:

```text
500 caracteres
```

### Estado

Solo serán permitidos:

```text
ACTIVO
PAUSADO
ARCHIVADO
```

### Frecuencia

Solo serán permitidos:

```text
DIARIA
SEMANAL
MENSUAL
```

Un valor fuera de esos enums producirá:

```text
400 Bad Request
```

---

# 20. ValidationPipe

## Decisión

La aplicación utilizará globalmente `ValidationPipe` con:

```typescript
whitelist: true,
transform: true
```

## whitelist

Permitirá que únicamente las propiedades declaradas en los DTO formen parte de los datos procesados por la aplicación.

## transform

Permitirá transformar los valores recibidos al tipo esperado cuando sea necesario.

## Justificación

Los DTO representan el contrato de entrada de la aplicación.

Esto reduce el riesgo de aceptar accidentalmente propiedades protegidas como:

```text
usuarioId
rol
passwordHash
creadoEn
```

---

# 21. Contrato de errores

## Decisión

Las respuestas de error tendrán una estructura uniforme.

Formato:

```json
{
  "statusCode": 400,
  "timestamp": "2026-09-21T20:00:00.000Z",
  "path": "/habitos",
  "message": "Descripción comprensible del error"
}
```

Campos obligatorios:

```text
statusCode
timestamp
path
message
```

## Códigos utilizados

| Código | Situación |
|---|---|
| 400 | Datos de entrada inválidos |
| 401 | Falta una identidad válida |
| 403 | Existe identidad, pero no tiene permiso |
| 404 | Recurso inexistente |
| 409 | Conflicto, como email duplicado |
| 500 | Error inesperado |

---

# 22. Errores inesperados

## Decisión

Cuando ocurra un error inesperado, la API responderá:

```text
500 Internal Server Error
```

El mensaje enviado al cliente será genérico.

Por ejemplo:

```json
{
  "statusCode": 500,
  "timestamp": "2026-09-21T20:00:00.000Z",
  "path": "/habitos",
  "message": "Error interno del servidor"
}
```

Los detalles técnicos permanecerán únicamente en los logs del servidor.

## Nunca debe exponerse

```text
stack traces
passwordHash
password
JWT_SECRET
DATABASE_URL
```

## Justificación

La información técnica es útil para diagnosticar errores, pero no debe exponerse al cliente.

---

# 23. Separación de responsabilidades

## Decisión

La aplicación seguirá la siguiente separación:

```text
HTTP Request
     |
     v
Controller
     |
     v
Service
     |
     v
Prisma
     |
     v
PostgreSQL
```

## Controller

Será responsable de:

- recibir peticiones HTTP;
- recibir parámetros;
- recibir DTO;
- obtener la identidad autenticada;
- delegar al service.

## Service

Será responsable de:

- reglas de negocio;
- validaciones relacionadas con negocio;
- propiedad;
- consultas;
- persistencia mediante Prisma.

## Prisma

Será responsable de comunicarse con PostgreSQL.

## Justificación

Los controllers no deben contener consultas directas a Prisma.

Separar responsabilidades facilita:

- mantenimiento;
- pruebas;
- diagnóstico de errores;
- comprensión del código.

---

# 24. Variables de entorno

## Decisión

Los valores privados se almacenarán como variables de entorno.

Como mínimo se utilizarán:

```env
DATABASE_URL=
JWT_SECRET=
PORT=
```

Los valores reales estarán en:

```text
.env
```

El archivo:

```text
.env
```

no será almacenado en Git.

El repositorio incluirá:

```text
.env.example
```

sin credenciales reales.

## Justificación

Esto permite separar el código fuente de la configuración privada de cada entorno.

---

# 25. JWT

## Decisión

El token incluirá como mínimo:

```text
sub
email
rol
exp
```

El token tendrá una expiración de:

```text
1 hora
```

## No debe contener

```text
password
passwordHash
JWT_SECRET
DATABASE_URL
```

## Justificación

El JWT debe contener únicamente la información necesaria para identificar y autorizar al usuario.

---

# 26. Swagger

## Decisión

La documentación de la API estará disponible en:

```text
/docs
```

Swagger documentará los ocho endpoints obligatorios.

También permitirá autenticación:

```text
Bearer
```

para probar las rutas protegidas.

---

# 27. Persistencia

## Decisión

Los datos serán almacenados permanentemente en:

```text
PostgreSQL
```

Prisma será utilizado como capa de acceso a datos.

Las modificaciones de la estructura de la base de datos serán versionadas utilizando migraciones.

## Justificación

Los datos deben permanecer incluso después de reiniciar la aplicación.

---

# 28. Matriz resumida de permisos

| Endpoint | Acceso | Restricción |
|---|---|---|
| `POST /auth/register` | Público | Siempre crea `USUARIO` |
| `POST /auth/login` | Público | Requiere credenciales válidas |
| `POST /habitos` | Autenticado | Propietario obtenido del JWT |
| `GET /habitos` | Autenticado | Solo hábitos propios |
| `GET /habitos/:id` | Dueño | Solo recurso propio |
| `PATCH /habitos/:id` | Dueño | Solo recurso propio |
| `DELETE /habitos/:id` | Dueño | Solo recurso propio |
| `GET /habitos/admin/todos` | ADMIN | Requiere JWT + rol `ADMIN` |

---

# 29. Resumen de respuestas HTTP

| Situación | Respuesta |
|---|---:|
| Registro correcto | `201` |
| Email duplicado | `409` |
| Login correcto | `200` |
| Login inválido | `401` |
| Datos inválidos | `400` |
| Ruta protegida sin JWT | `401` |
| JWT inválido | `401` |
| Crear hábito correctamente | `201` |
| Listar hábitos | `200` |
| Consultar hábito propio | `200` |
| Hábito inexistente | `404` |
| Hábito de otro usuario | `403` |
| PATCH correcto | `200` |
| DELETE correcto | `204` |
| USUARIO accede a ruta ADMIN | `403` |
| ADMIN accede a ruta global | `200` |
| Error inesperado | `500` |

---

# 30. Criterios de aceptación principales

## Registro correcto

**Dado** que el email no está registrado,

**cuando** el visitante envía nombre, email y contraseña válidos,

**entonces** la API crea una cuenta con rol `USUARIO`.

---

## Email duplicado

**Dado** que ya existe una cuenta con el mismo email,

**cuando** se intenta realizar nuevamente el registro,

**entonces** la API responde con `409 Conflict`.

---

## Login correcto

**Dado** un usuario registrado,

**cuando** proporciona las credenciales correctas,

**entonces** la API devuelve un `access_token`.

---

## Login incorrecto

**Dado** un intento de login,

**cuando** el email o la contraseña no son correctos,

**entonces** la API responde con `401 Unauthorized` y un mensaje genérico.

---

## Creación de hábito

**Dado** un usuario autenticado,

**cuando** crea un hábito válido,

**entonces** el hábito queda asociado automáticamente al usuario identificado en el JWT.

---

## Listado propio

**Dado** un usuario autenticado,

**cuando** solicita `GET /habitos`,

**entonces** recibe únicamente sus propios hábitos.

---

## Propiedad

**Dado** un hábito perteneciente al Usuario A,

**cuando** el Usuario B intenta consultar, modificar o eliminar ese hábito,

**entonces** la API responde con `403 Forbidden`.

---

## Recurso inexistente

**Dado** un identificador que no corresponde a ningún hábito,

**cuando** se intenta consultarlo,

**entonces** la API responde con `404 Not Found`.

---

## Actualización parcial

**Dado** un hábito existente,

**cuando** su propietario envía mediante `PATCH` únicamente uno de los campos,

**entonces** solo ese campo es modificado y los demás mantienen sus valores.

---

## Acceso administrativo inválido

**Dado** un usuario autenticado con rol `USUARIO`,

**cuando** intenta acceder a:

```text
GET /habitos/admin/todos
```

**entonces** la API responde con `403 Forbidden`.

---

## Acceso administrativo correcto

**Dado** un usuario autenticado con rol `ADMIN`,

**cuando** accede a:

```text
GET /habitos/admin/todos
```

**entonces** la API responde con `200 OK` y devuelve el listado general sin información sensible.

---

## Eliminación

**Dado** un hábito perteneciente al usuario autenticado,

**cuando** el propietario lo elimina,

**entonces** el recurso desaparece del sistema.

Si posteriormente intenta consultarlo nuevamente,

**entonces** la API responde con:

```text
404 Not Found
```

---

# 31. Principios de seguridad adoptados

1. `usuarioId` nunca será confiado desde el body.
2. El registro público nunca permitirá seleccionar `ADMIN`.
3. La identidad se obtendrá del JWT.
4. Todas las rutas de hábitos requerirán autenticación.
5. Se verificará propiedad antes de consultar, actualizar o eliminar un hábito por id.
6. La ruta global requerirá rol `ADMIN`.
7. Las contraseñas se almacenarán mediante hash.
8. Los secretos permanecerán fuera del repositorio.
9. Los errores no expondrán información interna.
10. Las respuestas nunca incluirán `passwordHash`.
11. Los JWT alterados o vencidos serán rechazados.
12. Las entradas serán validadas mediante DTO y `ValidationPipe`.
13. Se utilizará Helmet como protección HTTP básica.

---

# 32. Decisión final sobre 403, 404 y eliminación

Las tres decisiones principales solicitadas para esta etapa quedan definidas de la siguiente manera:

### 403

Si el recurso existe pero pertenece a otra persona:

```text
403 Forbidden
```

### 404

Si el recurso solicitado no existe:

```text
404 Not Found
```

### Eliminación

El propietario podrá eliminar permanentemente su hábito.

La eliminación exitosa utilizará:

```text
204 No Content
```

Después de eliminar el hábito, una nueva consulta producirá:

```text
404 Not Found
```

Estas decisiones serán utilizadas posteriormente para implementar y comprobar el comportamiento real de la API.