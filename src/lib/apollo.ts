import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

// Configuración del servidor GraphQL
// En contenedor unificado con nginx, usar localhost/graphql
// En desarrollo/producción separada, usar la URL externa
const getGraphQLUri = () => {
  // Si estamos en un contenedor unificado (detectado por variable de entorno)
  if (import.meta.env.VITE_UNIFIED_CONTAINER === 'true') {
    return '/graphql'; // Usar ruta relativa para nginx
  }
  
  // URL por defecto para desarrollo/producción separada
  return `${import.meta.env.VITE_GRAPHQL_SERVER_URL || 'https://linker-app-backend.braveglacier-674d7e00.eastus2.azurecontainerapps.io'}/graphql`;
};

const httpLink = createHttpLink({
  uri: getGraphQLUri(),
});

// Link para agregar el token de autorización solo cuando sea necesario
const authLink = setContext((_, { headers, operationName }) => {
  // Obtener el token del localStorage
  const token = localStorage.getItem('accessToken');
  
  // Lista de operaciones que NO requieren token
  const operationsWithoutAuth = ['createAtributo', 'updateAtributo', 'deleteAtributo'];
  
  // Si la operación NO requiere token, no enviar autorización
  if (operationName && operationsWithoutAuth.includes(operationName)) {
    return { headers };
  }
  
  // Para otras operaciones, enviar el token si existe
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    }
  }
});

// Crear el cliente Apollo con autorización selectiva
export const apolloClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
    },
    query: {
      errorPolicy: 'all',
    },
  },
}); 