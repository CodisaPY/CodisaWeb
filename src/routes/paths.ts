import { paramCase } from 'src/utils/change-case';

import { _id, _postTitles } from 'src/_mock/assets';

// ----------------------------------------------------------------------

const MOCK_ID = _id[1];

const MOCK_TITLE = _postTitles[2];

const ROOTS = {
  AUTH: '/auth',
  AUTH_DEMO: '/auth-demo',
  DASHBOARD: '/dashboard',
};

// ----------------------------------------------------------------------

export const paths = {
  comingSoon: '/coming-soon',
  maintenance: '/maintenance',
  pricing: '/pricing',
  payment: '/payment',
  about: '/about-us',
  contact: '/contact-us',
  faqs: '/faqs',
  page403: '/error/403',
  page404: '/error/404',
  page500: '/error/500',
  components: '/components',
  docs: 'https://docs.minimals.cc',
  changelog: 'https://docs.minimals.cc/changelog',
  zoneStore: 'https://mui.com/store/items/zone-landing-page/',
  minimalStore: 'https://mui.com/store/items/minimal-dashboard/',
  freeUI: 'https://mui.com/store/items/minimal-dashboard-free/',
  figmaUrl: 'https://www.figma.com/design/cAPz4pYPtQEXivqe11EcDE/%5BPreview%5D-Minimal-Web.v6.0.0',
  product: {
    root: `/product`,
    checkout: `/product/checkout`,
    details: (id: string) => `/product/${id}`,
    demo: { details: `/product/${MOCK_ID}` },
  },
  post: {
    root: `/post`,
    details: (title: string) => `/post/${paramCase(title)}`,
    demo: { details: `/post/${paramCase(MOCK_TITLE)}` },
  },
  // AUTH
  auth: {
    amplify: {
      signIn: `${ROOTS.AUTH}/amplify/sign-in`,
      verify: `${ROOTS.AUTH}/amplify/verify`,
      signUp: `${ROOTS.AUTH}/amplify/sign-up`,
      updatePassword: `${ROOTS.AUTH}/amplify/update-password`,
      resetPassword: `${ROOTS.AUTH}/amplify/reset-password`,
    },
    jwt: {
      signIn: `${ROOTS.AUTH}/jwt/sign-in`,
      signUp: `${ROOTS.AUTH}/jwt/sign-up`,
    },
    firebase: {
      signIn: `${ROOTS.AUTH}/firebase/sign-in`,
      verify: `${ROOTS.AUTH}/firebase/verify`,
      signUp: `${ROOTS.AUTH}/firebase/sign-up`,
      resetPassword: `${ROOTS.AUTH}/firebase/reset-password`,
    },
    auth0: {
      signIn: `${ROOTS.AUTH}/auth0/sign-in`,
    },
    supabase: {
      signIn: `${ROOTS.AUTH}/supabase/sign-in`,
      verify: `${ROOTS.AUTH}/supabase/verify`,
      signUp: `${ROOTS.AUTH}/supabase/sign-up`,
      updatePassword: `${ROOTS.AUTH}/supabase/update-password`,
      resetPassword: `${ROOTS.AUTH}/supabase/reset-password`,
    },
  },
  authDemo: {
    split: {
      signIn: `${ROOTS.AUTH_DEMO}/split/sign-in`,
      signUp: `${ROOTS.AUTH_DEMO}/split/sign-up`,
      resetPassword: `${ROOTS.AUTH_DEMO}/split/reset-password`,
      updatePassword: `${ROOTS.AUTH_DEMO}/split/update-password`,
      verify: `${ROOTS.AUTH_DEMO}/split/verify`,
    },
    centered: {
      signIn: `${ROOTS.AUTH_DEMO}/centered/sign-in`,
      signUp: `${ROOTS.AUTH_DEMO}/centered/sign-up`,
      resetPassword: `${ROOTS.AUTH_DEMO}/centered/reset-password`,
      updatePassword: `${ROOTS.AUTH_DEMO}/centered/update-password`,
      verify: `${ROOTS.AUTH_DEMO}/centered/verify`,
    },
  },
  // DASHBOARD
  dashboard: {
    /** */ root: ROOTS.DASHBOARD,
    mail: `${ROOTS.DASHBOARD}/mail`,
    chat: `${ROOTS.DASHBOARD}/chat`,
    blank: `${ROOTS.DASHBOARD}/blank`,
    kanban: `${ROOTS.DASHBOARD}/kanban`,
    calendar: `${ROOTS.DASHBOARD}/calendar`,
    fileManager: `${ROOTS.DASHBOARD}/file-manager`,
    permission: `${ROOTS.DASHBOARD}/permission`,
    general: {
      app: `${ROOTS.DASHBOARD}/app`,
      ecommerce: `${ROOTS.DASHBOARD}/ecommerce`,
      analytics: `${ROOTS.DASHBOARD}/analytics`,
      banking: `${ROOTS.DASHBOARD}/banking`,
      booking: `${ROOTS.DASHBOARD}/booking`,
      file: `${ROOTS.DASHBOARD}/file`,
      course: `${ROOTS.DASHBOARD}/course`,
    },
    user: {
      root: `${ROOTS.DASHBOARD}/user`,
      new: `${ROOTS.DASHBOARD}/user/new`,
      list: `${ROOTS.DASHBOARD}/user/list`,
      cards: `${ROOTS.DASHBOARD}/user/cards`,
      profile: `${ROOTS.DASHBOARD}/user/profile`,
      account: `${ROOTS.DASHBOARD}/user/account`,
      edit: (id: string) => `${ROOTS.DASHBOARD}/user/${id}/edit`,
      demo: {
        edit: `${ROOTS.DASHBOARD}/user/${MOCK_ID}/edit`,
      },
    },
    product: {
      root: `${ROOTS.DASHBOARD}/product`,
      new: `${ROOTS.DASHBOARD}/product/new`,
      details: (id: string) => `${ROOTS.DASHBOARD}/product/${id}`,
      edit: (id: string) => `${ROOTS.DASHBOARD}/product/${id}/edit`,
      demo: {
        details: `${ROOTS.DASHBOARD}/product/${MOCK_ID}`,
        edit: `${ROOTS.DASHBOARD}/product/${MOCK_ID}/edit`,
      },
    },
    invoice: {
      root: `${ROOTS.DASHBOARD}/invoice`,
      new: `${ROOTS.DASHBOARD}/invoice/new`,
      details: (id: string) => `${ROOTS.DASHBOARD}/invoice/${id}`,
      edit: (id: string) => `${ROOTS.DASHBOARD}/invoice/${id}/edit`,
      demo: {
        details: `${ROOTS.DASHBOARD}/invoice/${MOCK_ID}`,
        edit: `${ROOTS.DASHBOARD}/invoice/${MOCK_ID}/edit`,
      },
    },

    auditoria: {
      root: `${ROOTS.DASHBOARD}/auditoria/moduloInventario`,
      moduloInventario: {
        root: `${ROOTS.DASHBOARD}/auditoria`,
        crearToma: `${ROOTS.DASHBOARD}/auditoria/moduloInventario/crearToma`,
      },
      mis: {
        details: `${ROOTS.DASHBOARD}/auditoria/${MOCK_ID}`,
        edit: `${ROOTS.DASHBOARD}/auditoria/${MOCK_ID}/edit`,
      },
    },

    tic: {
      root: `${ROOTS.DASHBOARD}/tic/`,
      moduloSolicitudes: {
        root: `${ROOTS.DASHBOARD}/tic`,
        crearSolicitudNuevaMaquina: `${ROOTS.DASHBOARD}/tic/moduloSolicitudes/nuevaSolicitudMaquina`,
      },
      moduloInventario: {
        root: `${ROOTS.DASHBOARD}/tic`,
        crearNuevaMarca: `${ROOTS.DASHBOARD}/tic/moduloInventario/nuevaMarca`,
        editarMarca: (id: string) => `${ROOTS.DASHBOARD}/tic/moduloInventario/editarMarca/${id}`,
        crearNuevoModelo: `${ROOTS.DASHBOARD}/tic/moduloInventario/nuevoModelo`,
        editarModelo: (id: string) => `${ROOTS.DASHBOARD}/tic/moduloInventario/editarModelo/${id}`,
        listaMarcas: `${ROOTS.DASHBOARD}/tic/moduloInventario/listaMarcas`,
        listaModelos: `${ROOTS.DASHBOARD}/tic/moduloInventario/listaModelos`,
        crearNuevoEquipo: `${ROOTS.DASHBOARD}/tic/moduloInventario/nuevoEquipo`,
        editarEquipo: (id: string) => `${ROOTS.DASHBOARD}/tic/moduloInventario/editarEquipo/${id}`,
        listaEquipos: `${ROOTS.DASHBOARD}/tic/moduloInventario/listaEquipos`,
        crearNuevoAtributo: `${ROOTS.DASHBOARD}/tic/moduloInventario/nuevoAtributo`,
        editarAtributo: (id: string) => `${ROOTS.DASHBOARD}/tic/moduloInventario/editarAtributo/${id}`,
        listaAtributos: `${ROOTS.DASHBOARD}/tic/moduloInventario/listaAtributos`,
        crearNuevoTipoEquipo: `${ROOTS.DASHBOARD}/tic/moduloInventario/nuevoTipoEquipo`,
        editarTipoEquipo: (id: string) => `${ROOTS.DASHBOARD}/tic/moduloInventario/editarTipoEquipo/${id}`,
        listaTiposEquipo: `${ROOTS.DASHBOARD}/tic/moduloInventario/listaTiposEquipo`,
      },
    },

    comercial: {
      root: `${ROOTS.DASHBOARD}/comercial/moduloSolicitudes`,
      moduloSolicitudes: {
        root: `${ROOTS.DASHBOARD}/comercial`,
        crearSolicitudNuevaMaquina: `${ROOTS.DASHBOARD}/comercial/moduloSolicitudes/nuevaSolicitudMaquina`,
      },
    },
    seguridad: {
      root: `${ROOTS.DASHBOARD}/seguridad`,
      cambioPass: `${ROOTS.DASHBOARD}/seguridad/cambioPass`,
      moduloNotificaciones: {
        root: `${ROOTS.DASHBOARD}/seguridad/parametrizaciones`,
        ajusteEnvioNotificaciones: `${ROOTS.DASHBOARD}/seguridad/parametrizaciones/ajusteEnvioNotificaciones`,
        ajusteAutorizacionesFirmas: `${ROOTS.DASHBOARD}/seguridad/parametrizaciones/autorizacionesFirmas`,
      },
      moduloUsuarios: {
        root: `${ROOTS.DASHBOARD}/seguridad/usuarios`,
        nuevoUsuario: `${ROOTS.DASHBOARD}/seguridad/usuarios/nuevo`,
        listaUsuario: `${ROOTS.DASHBOARD}/seguridad/usuarios/lista`,
        permisos: `${ROOTS.DASHBOARD}/seguridad/usuarios/permisos`,
        edit: (id: string) => `${ROOTS.DASHBOARD}/seguridad/usuarios/${id}/editar`,
      },
      moduloRoles: {
        root: `${ROOTS.DASHBOARD}/seguridad/roles`,
        nuevoRol: `${ROOTS.DASHBOARD}/seguridad/roles/nuevo`,
        listaRol: `${ROOTS.DASHBOARD}/seguridad/roles/lista`,
        permisos: `${ROOTS.DASHBOARD}/seguridad/roles/permisos`,
      },
    },
    post: {
      root: `${ROOTS.DASHBOARD}/post`,
      new: `${ROOTS.DASHBOARD}/post/new`,
      details: (title: string) => `${ROOTS.DASHBOARD}/post/${paramCase(title)}`,
      edit: (title: string) => `${ROOTS.DASHBOARD}/post/${paramCase(title)}/edit`,
      demo: {
        details: `${ROOTS.DASHBOARD}/post/${paramCase(MOCK_TITLE)}`,
        edit: `${ROOTS.DASHBOARD}/post/${paramCase(MOCK_TITLE)}/edit`,
      },
    },
    order: {
      root: `${ROOTS.DASHBOARD}/order`,
      details: (id: string) => `${ROOTS.DASHBOARD}/order/${id}`,
      demo: {
        details: `${ROOTS.DASHBOARD}/order/${MOCK_ID}`,
      },
    },
    job: {
      root: `${ROOTS.DASHBOARD}/job`,
      new: `${ROOTS.DASHBOARD}/job/new`,
      details: (id: string) => `${ROOTS.DASHBOARD}/job/${id}`,
      edit: (id: string) => `${ROOTS.DASHBOARD}/job/${id}/edit`,
      demo: {
        details: `${ROOTS.DASHBOARD}/job/${MOCK_ID}`,
        edit: `${ROOTS.DASHBOARD}/job/${MOCK_ID}/edit`,
      },
    },
    tour: {
      root: `${ROOTS.DASHBOARD}/tour`,
      new: `${ROOTS.DASHBOARD}/tour/new`,
      details: (id: string) => `${ROOTS.DASHBOARD}/tour/${id}`,
      edit: (id: string) => `${ROOTS.DASHBOARD}/tour/${id}/edit`,
      demo: {
        details: `${ROOTS.DASHBOARD}/tour/${MOCK_ID}`,
        edit: `${ROOTS.DASHBOARD}/tour/${MOCK_ID}/edit`,
      },
    },
    tipoEquipo: {
      root: `${ROOTS.DASHBOARD}/tipo-equipo`,
      new: `${ROOTS.DASHBOARD}/tipo-equipo/new`,
      details: (id: string) => `${ROOTS.DASHBOARD}/tipo-equipo/${id}`,
      edit: (id: string) => `${ROOTS.DASHBOARD}/tipo-equipo/${id}/edit`,
      demo: {
        details: `${ROOTS.DASHBOARD}/tipo-equipo/${MOCK_ID}`,
        edit: `${ROOTS.DASHBOARD}/tipo-equipo/${MOCK_ID}/edit`,
      },
    },
  },
};
