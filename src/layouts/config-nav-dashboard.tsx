import { paths } from 'src/routes/paths';
import { CONFIG } from 'src/config-global';
import { SvgColor } from 'src/components/svg-color';
import { jwtDecode } from 'jwt-decode';  
import { ROLES_HIERARCHY, RoleKey } from 'src/auth/guard/roles-hierarchy';
import { ROLES } from '@guard/roles.constants';

 
const icon = (name: string) => (
  <SvgColor src={`${CONFIG.assetsDir}/assets/icons/navbar/${name}.svg`} />
);

const ICONS = {
  job: icon('ic-job'),
  settings: icon('ic-settings'),
  tic: icon('ic-tic'),
  blog: icon('ic-blog'),
  chat: icon('ic-chat'),
  mail: icon('ic-mail'),
  user: icon('ic-user'),
  file: icon('ic-file'),
  lock: icon('ic-lock'),
  tour: icon('ic-tour'),
  order: icon('ic-order'),
  label: icon('ic-label'),
  blank: icon('ic-blank'),
  kanban: icon('ic-kanban'),
  folder: icon('ic-folder'),
  course: icon('ic-course'),
  banking: icon('ic-banking'),
  booking: icon('ic-booking'),
  invoice: icon('ic-invoice'),
  product: icon('ic-product'),
  calendar: icon('ic-calendar'),
  disabled: icon('ic-disabled'),
  external: icon('ic-external'),
  menuItem: icon('ic-menu-item'),
  ecommerce: icon('ic-ecommerce'),
  analytics: icon('ic-analytics'),
  dashboard: icon('ic-dashboard'),
  parameter: icon('ic-parameter'),
  chicken: icon('ic-chicken'), // Nuevo ícono de gallina
  proyeccion: icon('ic-proyeccion'), // Nuevo ícono de gallina
  embarque: icon('ic-embarque'),
};

export const navData = [
  {
    subheader: 'Linker Codisa',
    items: [
      {
        title: 'Módulo de TIC',
        path: paths.dashboard.tic.root,
        icon: ICONS.tic,
        roles: [ROLES.MODULO_TIC],
        children: [
          {
            title: 'Solicitudes',
            path: paths.dashboard.tic.moduloSolicitudes.root,
            icon: ICONS.folder,
            roles: [ROLES.MODULO_SOLICITUD_TIC],
            children: [
              {
                title: 'Solicitud de Equipo',
                path: paths.dashboard.tic.moduloSolicitudes.crearSolicitudNuevaMaquina,
                roles: [
                  ROLES.GENERACION_SOLICITUD_TIC_NUEVO_EQUIPO_VIEW,
                  ROLES.GENERACION_SOLICITUD_TIC_NUEVO_EQUIPO_CREATE,
                ],
              },
            ],
          },
        ],
      },
      {
        title: 'Módulo de comercial',
        path: paths.dashboard.comercial.root,
        icon: ICONS.label,
        roles: [ROLES.MODULO_COMERCIAL],
        children: [
          {
            title: 'Solicitudes',
            path: paths.dashboard.comercial.moduloSolicitudes.root,
            icon: ICONS.folder,
            roles: [ROLES.MODULO_SOLICITUD_COMERCIAL],
            children: [
              {
                title: 'Solicitud de Equipo',
                path: paths.dashboard.comercial.moduloSolicitudes.crearSolicitudNuevaMaquina,
                roles: [
                  ROLES.GENERACION_SOLICITUD_COMERCIAL_NUEVO_EQUIPO_VIEW,
                  ROLES.GENERACION_SOLICITUD_COMERCIAL_NUEVO_EQUIPO_CREATE,
                ],
              },
            ],
          },
        ],
      },

      {
        title: 'Módulo de seguridad',
        path: paths.dashboard.seguridad.root,
        icon: ICONS.settings,
        roles: [ROLES.MODULO_SEGURIDAD],
        children: [
          {
            title: 'Parametrizaciones',
            path: paths.dashboard.seguridad.moduloNotificaciones.root,
            icon: ICONS.mail,
            roles: [ROLES.MODULO_NOTIFICACION],
            children: [
              {
                title: 'Ajustes de notificaciones',
                path: paths.dashboard.seguridad.moduloNotificaciones.ajusteEnvioNotificaciones,
                roles: [
                  ROLES.PARAMETRIZAR_NOTIFICACION_VIEW,
                  ROLES.PARAMETRIZAR_NOTIFICACION_CREATE,
                ],
              },
              {
                title: 'Autorizaciones por firma',
                path: paths.dashboard.seguridad.moduloNotificaciones.ajusteAutorizacionesFirmas,
                roles: [ROLES.PARAMETRIZAR_FIRMA_VIEW, ROLES.PARAMETRIZAR_FIRMA_CREATE],
              },
            ],
          },
          {
            title: 'Usuarios',
            path: paths.dashboard.seguridad.moduloUsuarios.root,
            icon: ICONS.user,
            roles: [ROLES.MODULO_USUARIOS],
            children: [
              {
                title: 'Nuevo usuario',
                path: paths.dashboard.seguridad.moduloUsuarios.nuevoUsuario,
                roles: [
                  ROLES.GENERACION_NUEVO_USUARIO_VIEW,
                ],
              } 
            ],
          },
        ],
      },
    ],
  },
];

export const filterNavDataByRoles = (roles: string[], initialNavData: any[]): any[] => {
  const getExpandedRoles = (userRoles: string[]): string[] => {
    const expandedRoles = new Set<string>(userRoles);
    return Array.from(expandedRoles);
  };

  const expandedRoles = getExpandedRoles(roles);

  const filterItems = (items: any[]): any[] =>
    items
      .map((item) => {
        const children = item.children ? filterItems(item.children) : undefined;
        const hasRole = item.roles
          ? item.roles.some((role: string) => expandedRoles.includes(role))
          : false;

        if (hasRole || (children && children.length > 0)) {
          return {
            ...item,
            children,
          };
        }

        return null;
      })
      .filter(Boolean);

  const newNav = initialNavData
    .map((section) => ({
      ...section,
      items: filterItems(section.items),
    }))
    .filter((section) => section.items.length > 0); // Oculta secciones vacías

  return newNav;
};


