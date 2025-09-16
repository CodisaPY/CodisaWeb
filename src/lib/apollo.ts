import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

// Configuración del servidor GraphQL
const httpLink = createHttpLink({
  uri: `${import.meta.env.VITE_GRAPHQL_SERVER_URL || 'https://linker-app-backend.braveglacier-674d7e00.eastus2.azurecontainerapps.io'}/graphql`,
});

// Link para agregar el token de autorización solo cuando sea necesario
const authLink = setContext((_, { headers, operationName }) => {
  // Obtener el token del localStorage
  const token = localStorage.getItem('accessToken');
  
  // Lista de operaciones que NO requieren token
  const operationsWithoutAuth = [
    'createAtributo',
    'updateAtributo',
    'deleteAtributo',
    'CreateReservaSala',
    'UpdateReservaSala',
    'GetReservasSalasCalendario',
  ];
  
  console.log('🔍 Operation name:', operationName);
  console.log('🔍 Operations without auth:', operationsWithoutAuth);
  console.log('🔍 Should skip auth:', operationName && operationsWithoutAuth.includes(operationName));
  
  // Si la operación NO requiere token, no enviar autorización
  if (operationName && operationsWithoutAuth.includes(operationName)) {
    console.log('✅ No enviando token para operación:', operationName);
    return { headers };
  }
  
  // Para otras operaciones, enviar el token si existe
  console.log('🔐 Enviando token para operación:', operationName);
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