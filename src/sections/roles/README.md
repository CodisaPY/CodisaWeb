# 🎭 Módulo de Roles - GraphQL

Este módulo maneja la gestión de roles usando GraphQL en lugar de REST API.

## 📁 Estructura de Archivos

```
src/sections/roles/
├── hooks/
│   └── use-get-roles.ts          # Hook migrado a GraphQL
├── components/
│   └── roles-list.tsx            # Componente de ejemplo
├── examples/
│   └── roles-example.tsx         # Ejemplo completo de CRUD
└── README.md                     # Esta documentación
```

## 🔧 Hooks Disponibles

### `useGetRoles()`
Hook para obtener la lista de roles usando GraphQL.

```typescript
import { useGetRoles } from '../hooks/use-get-roles';

function MyComponent() {
  const { roles, loading, error, refetch } = useGetRoles();
  
  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div>
      {roles.map(role => (
        <div key={role.id}>{role.name}</div>
      ))}
    </div>
  );
}
```

### Hooks de Mutaciones (en `src/hooks/use-graphql-roles.ts`)

#### `useCreateRole()`
```typescript
import { useCreateRole } from 'src/hooks/use-graphql-roles';

function CreateRoleForm() {
  const { createRole, loading } = useCreateRole();
  
  const handleSubmit = async (data) => {
    await createRole({
      variables: {
        input: {
          name: data.name,
          description: data.description,
          attributes: {
            name: [data.description]
          }
        },
      },
    });
  };
}
```

#### `useUpdateRole()`
```typescript
import { useUpdateRole } from 'src/hooks/use-graphql-roles';

function EditRoleForm() {
  const { updateRole, loading } = useUpdateRole();
  
  const handleSubmit = async (data) => {
    await updateRole({
      variables: {
        input: {
          id: roleId,
          name: data.name,
          description: data.description,
          attributes: {
            name: [data.description]
          }
        },
      },
    });
  };
}
```

#### `useDeleteRole()`
```typescript
import { useDeleteRole } from 'src/hooks/use-graphql-roles';

function DeleteRoleButton() {
  const { deleteRole, loading } = useDeleteRole();
  
  const handleDelete = async (roleName) => {
    await deleteRole({
      variables: {
        roleName,
      },
    });
  };
}
```

#### `useAddRolesToGroup()`
```typescript
import { useAddRolesToGroup } from 'src/hooks/use-graphql-roles';

function AddRolesToGroupButton() {
  const { addRolesToGroup, loading } = useAddRolesToGroup();
  
  const handleAddRoles = async (groupName: string, rolesToAdd: string[]) => {
    await addRolesToGroup({
      variables: {
        groupName,
        input: {
          rolesToAdd,
        },
      },
    });
  };
}
```

#### `useRemoveRolesFromGroup()`
```typescript
import { useRemoveRolesFromGroup } from 'src/hooks/use-graphql-roles';

function RemoveRolesFromGroupButton() {
  const { removeRolesFromGroup, loading } = useRemoveRolesFromGroup();
  
  const handleRemoveRoles = async (groupName: string, rolesToRemove: string[]) => {
    await removeRolesFromGroup({
      variables: {
        groupName,
        input: {
          rolesToRemove,
        },
      },
    });
  };
}
```

#### `useGetScreenHierarchyLevel3()`
```typescript
import { useGetScreenHierarchyLevel3 } from 'src/hooks/use-graphql-roles';

function PermissionsTree() {
  const { data, loading, error } = useGetScreenHierarchyLevel3();
  
  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div>
      {/* Renderizar el árbol de permisos */}
      {data?.screenHierarchyLevel3 && (
        <PermissionTree data={data.screenHierarchyLevel3} />
      )}
    </div>
  );
}
```

#### `useGetRolePermissions()`
```typescript
import { useGetRolePermissions } from 'src/hooks/use-graphql-roles';

function RolePermissions({ roleName }: { roleName: string }) {
  const { data, loading, error } = useGetRolePermissions(roleName);
  
  if (loading) return <div>Cargando permisos...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div>
      {data?.rolePermissions.data.map(permission => (
        <div key={permission.id}>{permission.name}</div>
      ))}
    </div>
  );
}
```

## 📊 Tipos TypeScript

Los tipos están definidos en `src/types/role.ts`:

```typescript
export interface Role {
  id: string;
  name: string;
  description: string;
  composite: boolean;
  clientRole: boolean;
  containerId: string;
}
```

## 🔄 Migración de REST a GraphQL

### Antes (REST)
```typescript
// src/sections/roles/hooks/use-get-roles.ts (versión anterior)
export function useGetRoles() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRoles = useCallback(async () => {
    const response = await fetch(`${CONFIG.serverUrl}/api/keycloak/groups/roles`);
    const result = await response.json();
    if (result.success) {
      setRoles(result.data);
    }
  }, []);

  return { roles, loading, refetch: fetchRoles };
}
```

### Después (GraphQL)
```typescript
// src/sections/roles/hooks/use-get-roles.ts (versión actual)
export function useGetRoles() {
  const { data, loading, error, refetch } = useQuery<RolesQueryResponse>(ROLES_QUERY, {
    errorPolicy: 'all',
    fetchPolicy: 'cache-and-network',
  });

  return { 
    roles: data?.roles || [], 
    loading, 
    error,
    refetch 
  };
}
```

## 🚀 Ventajas de GraphQL

1. **Cache Inteligente**: Apollo Client maneja automáticamente el cache
2. **Refetch Automático**: Los hooks refetch automáticamente después de mutaciones
3. **Manejo de Errores**: Mejor manejo de errores con `errorPolicy`
4. **Optimistic Updates**: Posibilidad de actualizaciones optimistas
5. **Type Safety**: Mejor tipado con TypeScript

## 📝 Ejemplo de Uso Completo

Ver `src/sections/roles/examples/roles-example.tsx` para un ejemplo completo de CRUD de roles.

## 🔐 Autenticación

Los hooks de roles requieren autenticación. El token se maneja automáticamente a través del contexto de Apollo Client.

## 🐛 Troubleshooting

### Error de Token Inválido
Si recibes el error "Token inválido o inactivo", verifica que:
1. El usuario esté autenticado
2. El token no haya expirado
3. El header de autorización se esté enviando correctamente

### Error de Red
Si hay problemas de conectividad:
1. Verifica que el servidor GraphQL esté corriendo en el puerto 4001
2. Revisa la configuración de Apollo Client en `src/lib/apollo.ts`

## 📚 Referencias

- [Apollo Client Documentation](https://www.apollographql.com/docs/react/)
- [GraphQL Queries](https://graphql.org/learn/queries/)
- [GraphQL Mutations](https://graphql.org/learn/queries/#mutations) 