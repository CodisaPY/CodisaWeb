# 🚀 Migración a GraphQL - Plan de Implementación

## 📋 Resumen del Proyecto

Este proyecto está siendo migrado de REST API a GraphQL para mejorar la eficiencia de las consultas y reducir el over-fetching/under-fetching de datos.

### 🔧 Configuración Actual
- **Frontend**: React + TypeScript + Material-UI
- **Backend GraphQL**: Node.js + Apollo Server (puerto 4001)
- **Backend REST**: Spring Boot (puerto 9003)
- **Autenticación**: Keycloak

---

## ✅ **COMPLETADO**

### 🔐 Autenticación
- ✅ **Login GraphQL** - Mutation implementada y funcionando
- ✅ **Logout GraphQL** - Mutation implementada y funcionando
- ✅ **Refresh Token GraphQL** - Mutation implementada y funcionando
- ✅ **Check Session GraphQL** - Query implementada y funcionando
- ✅ **Change Password GraphQL** - Mutation implementada y funcionando
- ✅ **Login with OTP GraphQL** - Mutation implementada y funcionando
- ✅ **Search User GraphQL** - Query implementada y funcionando
- ✅ **Apollo Client** - Configurado y funcionando
- ✅ **Tipos TypeScript** - Definidos para autenticación completa
- ✅ **Hooks personalizados** - `useGraphQLLogin`, `useGraphQLChangePassword` y `useGraphQLLoginWithOTP` implementados
- ✅ **Pantalla OTP** - Componente `JwtOTPView` implementado para verificación de códigos OTP

---

## 🔄 **EN PROGRESO**

### 🔐 Autenticación (Fase 1)
- ✅ **Logout** - `POST /api/keycloak/logout` - **COMPLETADO**
- ✅ **Refresh Token** - `POST /api/keycloak/refresh-token` - **COMPLETADO**
- ✅ **Check Session** - `POST /api/keycloak/check-session` - **COMPLETADO**
- ✅ **Change Password** - `POST /api/keycloak/change-password` - **COMPLETADO**
- ✅ **Get User ID** - `GET /api/keycloak/user-id` - **COMPLETADO**
- 🔄 **Check Password Change** - `GET /api/keycloak/user/{userId}/check-password-change`

---

## 📝 **PENDIENTE**

### 👥 **Fase 2: Gestión de Usuarios**

#### Usuarios CRUD
- ✅ `GET /api/keycloak/usuarios` - Listar usuarios - **COMPLETADO**
- ✅ `POST /api/keycloak/create-user` - Crear usuario - **COMPLETADO**
- ✅ `PUT /api/keycloak/user/{userId}` - Actualizar usuario - **COMPLETADO**
- ✅ `PATCH /api/keycloak/user/{id}/toggle-status` - Activar/desactivar usuario - **COMPLETADO**

#### Roles y Permisos
- ✅ `GET /api/keycloak/groups/roles` - Listar roles - **COMPLETADO (GraphQL)**
- ✅ `POST /api/keycloak/roles` - Crear rol - **COMPLETADO**
- ✅ `DELETE /api/keycloak/roles/{name}` - Eliminar rol - **COMPLETADO**
- ✅ `GET /api/keycloak/groups/{roleName}/pantallas` - Permisos por rol - **COMPLETADO (REST temporal)**
- ✅ `POST /api/keycloak/groups/{roleName}/roles` - Asignar roles al grupo - **COMPLETADO**
- ✅ `DELETE /api/keycloak/groups/{roleName}/roles` - Remover roles del grupo - **COMPLETADO**
- ✅ `GET /api/keycloak/pantallas/acciones` - Pantallas y acciones - **COMPLETADO (GraphQL)**

#### Gestión de Permisos de Usuario
- ⏳ `GET /api/keycloak/user/{userData.id}/roles` - Roles del usuario
- ⏳ `POST /api/keycloak/user/{userData.id}/roles` - Asignar roles
- ⏳ `DELETE /api/keycloak/user/{userData.id}/roles` - Remover roles

#### Estructura Organizacional
- ⏳ `GET /api/keycloak/sucursales/tree` - Árbol de sucursales
- ⏳ `GET /api/keycloak/cargos/tree` - Árbol de cargos
- ⏳ `GET /api/keycloak/modulos/tree` - Árbol de módulos
- ⏳ `GET /api/keycloak/usuarios-por-roles?roles=cargos_todos` - Usuarios por roles

### 🏢 **Fase 3: Gestión de Equipos (Spring Boot)**

#### Tipos de Equipo
- ⏳ `GET /backend-linker/api/tipos-equipo` - Listar tipos
- ⏳ `GET /backend-linker/api/tipos-equipo/{id}` - Obtener tipo
- ⏳ `POST /backend-linker/api/tipos-equipo` - Crear tipo
- ⏳ `PUT /backend-linker/api/tipos-equipo/{id}` - Actualizar tipo
- ⏳ `DELETE /backend-linker/api/tipos-equipo/{id}` - Eliminar tipo

#### Marcas
- ⏳ `GET /backend-linker/api/marcas` - Listar marcas
- ⏳ `GET /backend-linker/api/marcas/{id}` - Obtener marca
- ⏳ `POST /backend-linker/api/marcas` - Crear marca
- ⏳ `PUT /backend-linker/api/marcas/{id}` - Actualizar marca
- ⏳ `DELETE /backend-linker/api/marcas/{id}` - Eliminar marca

#### Modelos
- ⏳ `GET /backend-linker/api/modelos` - Listar modelos
- ⏳ `GET /backend-linker/api/modelos/{id}` - Obtener modelo
- ⏳ `POST /backend-linker/api/modelos` - Crear modelo
- ⏳ `PUT /backend-linker/api/modelos/{id}` - Actualizar modelo
- ⏳ `DELETE /backend-linker/api/modelos/{id}` - Eliminar modelo

#### Atributos
- ⏳ `GET /backend-linker/api/atributos` - Listar atributos
- ⏳ `GET /backend-linker/api/atributos/{id}` - Obtener atributo
- ⏳ `POST /backend-linker/api/atributos` - Crear atributo
- ⏳ `PUT /backend-linker/api/atributos/{id}` - Actualizar atributo
- ⏳ `DELETE /backend-linker/api/atributos/{id}` - Eliminar atributo

#### Equipos
- ⏳ `GET /backend-linker/api/equipos` - Listar equipos
- ⏳ `GET /backend-linker/api/equipos/{id}` - Obtener equipo
- ⏳ `POST /backend-linker/api/equipos` - Crear equipo
- ⏳ `PUT /backend-linker/api/equipos/{id}` - Actualizar equipo
- ⏳ `DELETE /backend-linker/api/equipos/{id}` - Eliminar equipo

### 📋 **Fase 4: Autorizaciones y Notificaciones**

#### Autorizaciones
- ⏳ `GET /backend-linker/api/firma-autorizacion?pantallaId={pantallaId}` - Configuración de autorizaciones
- ⏳ `GET /backend-linker/api/tipos-autorizacion-firma` - Tipos de autorización

#### Notificaciones
- ⏳ `GET /backend-linker/estado-formulario/por-pantalla/{pantallaId}` - Estados por pantalla
- ⏳ `GET /backend-linker/tipo-destino-notificaciones` - Tipos de destino

### 🎯 **Fase 5: Funcionalidades Auxiliares**

#### Chat
- ⏳ `POST /api/chat` - Enviar mensaje
- ⏳ `PUT /api/chat` - Actualizar mensaje
- ⏳ `GET /api/chat?conversationId={id}&endpoint=mark-as-seen` - Marcar como leído

#### Kanban
- ⏳ `POST /api/kanban?endpoint=create-column` - Crear columna
- ⏳ `POST /api/kanban?endpoint=update-column` - Actualizar columna
- ⏳ `POST /api/kanban?endpoint=move-column` - Mover columna
- ⏳ `POST /api/kanban?endpoint=clear-column` - Limpiar columna
- ⏳ `POST /api/kanban?endpoint=delete-column` - Eliminar columna
- ⏳ `POST /api/kanban?endpoint=create-task` - Crear tarea
- ⏳ `POST /api/kanban?endpoint=update-task` - Actualizar tarea
- ⏳ `POST /api/kanban?endpoint=move-task` - Mover tarea
- ⏳ `POST /api/kanban?endpoint=delete-task` - Eliminar tarea

#### Calendar
- ⏳ `POST /api/calendar` - Crear evento
- ⏳ `PUT /api/calendar` - Actualizar evento
- ⏳ `PATCH /api/calendar` - Actualizar parcialmente evento

---

## 🛠️ **ARCHIVOS A CREAR/MODIFICAR**

### 📁 **Estructura de Archivos GraphQL**

```
src/
├── graphql/
│   ├── mutations/
│   │   ├── auth.ts ✅
│   │   ├── users.ts ✅
│   │   ├── roles.ts ✅
│   │   ├── equipment.ts ⏳
│   │   └── notifications.ts ⏳
│   ├── queries/
│   │   ├── auth.ts ✅
│   │   ├── users.ts ✅
│   │   ├── roles.ts ✅
│   │   ├── equipment.ts ⏳
│   │   └── notifications.ts ⏳
│   └── fragments/
│       ├── user.ts ⏳
│       ├── role.ts ⏳
│       └── equipment.ts ⏳
├── types/
│   ├── auth.ts ✅
│   ├── user.ts ✅
│   ├── role.ts ✅
│   ├── equipment.ts ⏳
│   └── notification.ts ⏳
└── hooks/
    ├── use-graphql-auth.ts ✅
    ├── use-graphql-users.ts ✅
    ├── use-graphql-roles.ts ✅
    └── use-graphql-equipment.ts ⏳
```

---

## 🚀 **PRÓXIMOS PASOS**

### **Inmediato (Esta semana)**
1. ✅ Completar **Fase 1** - Autenticación
   - ✅ Implementar logout GraphQL
   - ✅ Implementar refresh token GraphQL
   - ✅ Implementar check session GraphQL
   - ✅ Migrar change password a GraphQL

### **Corto plazo (Próximas 2 semanas)**
2. 🎯 Implementar **Fase 2** - Gestión de Usuarios y Roles
   - ✅ Listar usuarios - **COMPLETADO**
   - ✅ Hook `useGetUsers` migrado a GraphQL - **COMPLETADO**
   - ✅ Componente de permisos migrado a GraphQL - **COMPLETADO**
   - ✅ Crear usuario - **COMPLETADO**
   - ✅ Actualizar usuario - **COMPLETADO**
   - ✅ Formulario de edición migrado a GraphQL - **COMPLETADO**
   - ✅ Toggle estado de usuario - **COMPLETADO**
   - ✅ Componente de lista migrado a GraphQL - **COMPLETADO**
   - ✅ Listar roles - **COMPLETADO**
   - ✅ Hook `useGetRoles` migrado a GraphQL - **COMPLETADO**
   - ✅ Tipos TypeScript para roles - **COMPLETADO**
   - ✅ Queries y mutations para roles - **COMPLETADO**
   - ✅ Crear rol - **COMPLETADO**
   - ✅ Formulario de crear rol migrado a GraphQL - **COMPLETADO**
   - ✅ Eliminar rol - **COMPLETADO**
   - ✅ Componente de eliminar rol migrado a GraphQL - **COMPLETADO**
   - ⏳ Permisos por rol (query GraphQL creada, componentes pendientes)
   - ⏳ Árbol de permisos migrado a GraphQL
   - ✅ Asignar roles a grupo - **COMPLETADO**
   - ⏳ CRUD de usuarios (eliminar)
   - ⏳ CRUD de roles (actualizar)
   - ⏳ Gestión de permisos

### **Mediano plazo (1 mes)**
3. 🏢 Implementar **Fase 3** - Gestión de Equipos
   - Migrar endpoints de Spring Boot a GraphQL
   - CRUD de tipos, marcas, modelos, atributos, equipos

### **Largo plazo (2 meses)**
4. 📋 Implementar **Fase 4 y 5** - Funcionalidades específicas
   - Autorizaciones y notificaciones
   - Chat, Kanban, Calendar

---

## 📊 **ESTADÍSTICAS**

- **Total de endpoints**: ~62 endpoints
- **Completados**: 16/62 (26%) - **AUTENTICACIÓN COMPLETA + USUARIOS INICIADO + ROLES COMPLETO + ASIGNAR/REMOVER ROLES A GRUPO + PERMISOS GRAPHQL**
- **En progreso**: 0/62 (0%)
- **Pendientes**: 46/62 (74%)

---

## 🔗 **ENDPOINTS POR PRIORIDAD**

### **🔥 CRÍTICO (Autenticación)**
- ✅ `POST /api/keycloak/logout` - **COMPLETADO**
- ✅ `POST /api/keycloak/refresh-token` - **COMPLETADO**
- ✅ `POST /api/keycloak/check-session` - **COMPLETADO**

### **⚡ ALTA (Usuarios y Roles)**
- `GET /api/keycloak/usuarios`
- `GET /api/keycloak/groups/roles`
- `POST /api/keycloak/create-user`

### **📈 MEDIA (Equipos)**
- `GET /backend-linker/api/tipos-equipo`
- `GET /backend-linker/api/marcas`
- `GET /backend-linker/api/modelos`

### **📋 BAJA (Funcionalidades auxiliares)**
- Chat, Kanban, Calendar
- Autorizaciones y notificaciones

---

## 💡 **NOTAS IMPORTANTES**

1. **Compatibilidad**: Mantener compatibilidad con endpoints REST durante la migración
2. **Testing**: Probar cada endpoint migrado antes de continuar
3. **Documentación**: Actualizar documentación de API
4. **Performance**: Monitorear performance de GraphQL vs REST
5. **Error Handling**: Implementar manejo de errores consistente

---

## 🎯 **OBJETIVOS**

- [ ] Migrar 100% de endpoints REST a GraphQL
- [ ] Mantener funcionalidad existente
- [ ] Mejorar performance de consultas
- [ ] Reducir over-fetching/under-fetching
- [ ] Implementar cache inteligente con Apollo Client
- [ ] Documentar todas las mutations y queries

---

*Última actualización: $(date)*
*Estado: En progreso - Fase 1* 