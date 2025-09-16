export const ROLES = {
  PRODUCCION_READ: 'produccion_read',
  PROYECCION_READ: 'proyeccion_read',
  RAZAS_READ: 'razas_read',
  AVIARIOS_READ: 'aviarios_read',
  UNIDADES_READ: 'ppr_unidad_read',
  INFORMES_READ: 'informes_read',
  INFORMES_PPR_READ: 'informes_ppr_read',
  INFORMES_VENTA_READ: 'informes_venta_read',
  INFORMES_AVIARIOS_READ: 'informes_aviarios_read',
  REGISTRO_READ: 'reg_create',

  MODULO_TIC: 'modulo_tic',
  MODULO_COMERCIAL: 'modulo_comercial',
  MODULO_SEGURIDAD: 'modulo_seguridad',
  MODULO_NOTIFICACION: 'modulo_notificacion',
  MODULO_SOLICITUD_TIC: 'modulo_solicitudes_tic',
  MODULO_SOLICITUD_COMERCIAL: 'modulo_solicitudes_comercial',
  MODULO_INVENTARIO_TIC: 'modulo_inventario_tic',
  MODULO_USUARIOS: 'modulo_usuarios',
  MODULO_ROLES: 'modulo_roles',
  /*
  MODULO DE TIC
  */
      /**
       * MODULO SOLICITUD TIC
       */
      GENERACION_SOLICITUD_TIC_NUEVO_EQUIPO_VIEW:'pantalla__solicitud_tic__solicitud_nuevo_equipo__view',
      GENERACION_SOLICITUD_TIC_NUEVO_EQUIPO_CREATE:
        'pantalla__solicitud_tic__solicitud_nuevo_equipo__create',

      /**
       * MODULO INVENTARIO TIC
       */
      MARCA_INVENTARIO_TIC_VIEW: 'pantalla__inventario_tic__crear_nueva_marca__view',
      MARCA_INVENTARIO_TIC_CREATE: 'pantalla__inventario_tic__crear_nueva_marca__create',

      LISTA_MARCAS_INVENTARIO_TIC_VIEW: 'pantalla__inventario_tic__lista_marcas__view',
      LISTA_MARCAS_INVENTARIO_TIC_CREATE: 'pantalla__inventario_tic__lista_marcas__create',
      LISTA_MARCAS_INVENTARIO_TIC_ENABLE: 'pantalla__inventario_tic__lista_marcas__enable',
      LISTA_MARCAS_INVENTARIO_TIC_DISABLE: 'pantalla__inventario_tic__lista_marcas__disable',
      LISTA_MARCAS_INVENTARIO_TIC_UPDATE: 'pantalla__inventario_tic__lista_marcas__update',


      MODELO_INVENTARIO_TIC_VIEW: 'pantalla__inventario_tic__crear_nuevo_modelo__view',
      MODELO_INVENTARIO_TIC_CREATE: 'pantalla__inventario_tic__crear_nuevo_modelo__create',

      LISTA_MODELOS_INVENTARIO_TIC_VIEW: 'pantalla__inventario_tic__lista_modelos__view',
      LISTA_MODELOS_INVENTARIO_TIC_CREATE: 'pantalla__inventario_tic__lista_modelos__create',
      LISTA_MODELOS_INVENTARIO_TIC_ENABLE: 'pantalla__inventario_tic__lista_modelos__enable',
      LISTA_MODELOS_INVENTARIO_TIC_DISABLE: 'pantalla__inventario_tic__lista_modelos__disable',
      LISTA_MODELOS_INVENTARIO_TIC_UPDATE: 'pantalla__inventario_tic__lista_modelos__update', 
    
      EQUIPO_INVENTARIO_TIC_VIEW: 'pantalla__inventario_tic__crear_nuevo_equipo__view',
      EQUIPO_INVENTARIO_TIC_CREATE: 'pantalla__inventario_tic__crear_nuevo_equipo__create',

      LISTA_EQUIPOS_INVENTARIO_TIC_VIEW: 'pantalla__inventario_tic__lista_equipos__view',
      LISTA_EQUIPOS_INVENTARIO_TIC_CREATE: 'pantalla__inventario_tic__lista_equipos__create',
      LISTA_EQUIPOS_INVENTARIO_TIC_ENABLE: 'pantalla__inventario_tic__lista_equipos__enable',
      LISTA_EQUIPOS_INVENTARIO_TIC_DISABLE: 'pantalla__inventario_tic__lista_equipos__disable',
      LISTA_EQUIPOS_INVENTARIO_TIC_UPDATE: 'pantalla__inventario_tic__lista_equipos__update',

      ATRIBUTO_INVENTARIO_TIC_VIEW: 'pantalla__inventario_tic__crear_nuevo_atributo_tipo_equipo__view',
      ATRIBUTO_INVENTARIO_TIC_CREATE: 'pantalla__inventario_tic__crear_nuevo_atributo_tipo_equipo__create',

      LISTA_ATRIBUTOS_INVENTARIO_TIC_VIEW: 'pantalla__inventario_tic__lista_atributo_tipo_equipo__view',
      LISTA_ATRIBUTOS_INVENTARIO_TIC_CREATE: 'pantalla__inventario_tic__lista_atributo_tipo_equipo__create',
      LISTA_ATRIBUTOS_INVENTARIO_TIC_ENABLE: 'pantalla__inventario_tic__lista_atributo_tipo_equipo__enable',
      LISTA_ATRIBUTOS_INVENTARIO_TIC_DISABLE: 'pantalla__inventario_tic__lista_atributo_tipo_equipo__disable',
      LISTA_ATRIBUTOS_INVENTARIO_TIC_UPDATE: 'pantalla__inventario_tic__lista_atributo_tipo_equipo__update',

      TIPO_EQUIPO_INVENTARIO_TIC_VIEW:    'pantalla__inventario_tic__crear_nuevo_tipo_equipo__view',
      TIPO_EQUIPO_INVENTARIO_TIC_CREATE:  'pantalla__inventario_tic__crear_nuevo_tipo_equipo__create',

      LISTA_TIPOS_EQUIPO_INVENTARIO_TIC_VIEW: 'pantalla__inventario_tic__lista_tipos_equipo__view',
      LISTA_TIPOS_EQUIPO_INVENTARIO_TIC_CREATE: 'pantalla__inventario_tic__lista_tipos_equipo__create',
      LISTA_TIPOS_EQUIPO_INVENTARIO_TIC_ENABLE: 'pantalla__inventario_tic__lista_tipos_equipo__enable',
      LISTA_TIPOS_EQUIPO_INVENTARIO_TIC_DISABLE: 'pantalla__inventario_tic__lista_tipos_equipo__disable',
      LISTA_TIPOS_EQUIPO_INVENTARIO_TIC_UPDATE: 'pantalla__inventario_tic__lista_tipos_equipo__update',


  /*
  MODULO COMERCIAL
  */
  GENERACION_SOLICITUD_COMERCIAL_NUEVO_EQUIPO_VIEW:
    'pantalla__solicitud_comercial__solicitud_nuevo_equipo__view',
  GENERACION_SOLICITUD_COMERCIAL_NUEVO_EQUIPO_CREATE:
    'pantalla__solicitud_comercial__solicitud_nuevo_equipo__create',

  /*
  MODULO SEGURIDAD
  */
  PARAMETRIZAR_NOTIFICACION_VIEW: 'pantalla__notificacion_seguridad__envio_notificacion__view',
  PARAMETRIZAR_NOTIFICACION_CREATE: 'pantalla__notificacion_seguridad__envio_notificacion__create',

  PARAMETRIZAR_FIRMA_VIEW: 'pantalla__parametrizaciones_seguridad__autorizacion_firma__view',
  PARAMETRIZAR_FIRMA_CREATE: 'pantalla__parametrizaciones_seguridad__autorizacion_firma__create',

  /*
  MODULO USUARIOS
  */
  GENERACION_NUEVO_USUARIO_VIEW:    'pantalla__usuarios__crear_nuevo_usuario__view',
  GENERACION_NUEVO_USUARIO_CREATE:  'pantalla__usuarios__crear_nuevo_usuario__create',
  GENERACION_NUEVO_USUARIO_ENABLE:  'pantalla__usuarios__crear_nuevo_usuario__enable',

  
  LISTA_USUARIOS_VIEW: 'pantalla__usuarios__lista_usuario__view',
  LISTA_USUARIOS_PERMISSION: 'pantalla__usuarios__lista_usuario__permission',
  LISTA_USUARIOS_ENABLE:  'pantalla__usuarios__lista_usuario__enable',
  LISTA_USUARIOS_DISABLE: 'pantalla__usuarios__lista_usuario__disable',
  LISTA_USUARIOS_CREATE:  'pantalla__usuarios__lista_usuario__create',
  LISTA_USUARIOS_UPDATE:  'pantalla__usuarios__lista_usuario__update',
  LISTA_USUARIOS_PASSWORD: 'pantalla__usuarios__lista_usuario__password',
     /*
  MODULO ROLES
  */

  GENERACION_NUEVO_ROL_VIEW:      'pantalla__roles__crear_nuevo_rol__view',
  GENERACION_NUEVO_ROL_CREATE:    'pantalla__roles__crear_nuevo_rol__create',
  LISTA_ROLES_VIEW: 'pantalla__roles__lista_roles__view',
  LISTA_ROLES_UPDATE: 'pantalla__roles__lista_roles__update',
  LISTA_ROLES_DELETE: 'pantalla__roles__lista_roles__delete',
  LISTA_ROLES_PERMISSION: 'pantalla__roles__lista_roles__permission',
  LISTA_ROLES_ENABLE: 'pantalla__roles__lista_roles__enable',
  LISTA_ROLES_DISABLE: 'pantalla__roles__lista_roles__disable',


  };
  