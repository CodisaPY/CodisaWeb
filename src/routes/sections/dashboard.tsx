import { lazy, Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { ROLES } from '@guard/roles.constants';

import { CONFIG } from 'src/config-global';
import {} from 'src/pages/auth/auth0/update-password';
import { DashboardLayout } from 'src/layouts/dashboard';

import { LoadingScreen } from 'src/components/loading-screen';

import { UserEditView } from 'src/sections/user/view';
import { NewRoleView } from 'src/sections/roles/view/new-role-view';
import { RoleListView } from 'src/sections/roles/view/role-list-view';
import { RolePermissionsView } from 'src/sections/roles/view/role-permissions-view';

import { AuthGuard } from 'src/auth/guard';
import { RoleGuard } from 'src/auth/guard/role-guard';

// ----------------------------------------------------------------------

const UpdatePassView = lazy(() => import('src/pages/auth/auth0/update-password'));

// Overview
const IndexPage = lazy(() => import('src/pages/dashboard'));
const OverviewEcommercePage = lazy(() => import('src/pages/dashboard/ecommerce'));
const OverviewAnalyticsPage = lazy(() => import('src/pages/dashboard/analytics'));
const OverviewBankingPage = lazy(() => import('src/pages/dashboard/banking'));
const OverviewBookingPage = lazy(() => import('src/pages/dashboard/booking'));
const OverviewFilePage = lazy(() => import('src/pages/dashboard/file'));
const OverviewCoursePage = lazy(() => import('src/pages/dashboard/course'));
// Product
const ProductDetailsPage = lazy(() => import('src/pages/dashboard/product/details'));
const ProductListPage = lazy(() => import('src/pages/dashboard/product/list'));
const ProductCreatePage = lazy(() => import('src/pages/dashboard/product/new'));
const ProductEditPage = lazy(() => import('src/pages/dashboard/product/edit'));
// Order
const OrderListPage = lazy(() => import('src/pages/dashboard/order/list'));
const OrderDetailsPage = lazy(() => import('src/pages/dashboard/order/details'));
// Invoice
const InvoiceListPage = lazy(() => import('src/pages/dashboard/invoice/list'));
const InvoiceDetailsPage = lazy(() => import('src/pages/dashboard/invoice/details'));
const InvoiceCreatePage = lazy(() => import('src/pages/dashboard/invoice/new'));
const InvoiceEditPage = lazy(() => import('src/pages/dashboard/invoice/edit'));
// User
const UserProfilePage = lazy(() => import('src/pages/dashboard/user/profile'));
const UserCardsPage = lazy(() => import('src/pages/dashboard/user/cards'));
const UserListPage = lazy(() => import('src/pages/user-management/user-list'));
const UserAccountPage = lazy(() => import('src/pages/dashboard/user/account'));
const UserCreatePage = lazy(() => import('src/pages/dashboard/user/new'));
const NewUserPage = lazy(() => import('src/pages/dashboard/user/new'));


const Notificaciones = lazy(() => import('src/pages/dashboard/notificaciones/edit'));
const AutorizacionesFirmas = lazy(() => import('src/pages/dashboard/autorizacionesFirmas/edit'));

const UserEditPage = lazy(() => import('src/pages/dashboard/user/edit'));
// Blog
const BlogPostsPage = lazy(() => import('src/pages/dashboard/post/list'));
const BlogPostPage = lazy(() => import('src/pages/dashboard/post/details'));
const BlogNewPostPage = lazy(() => import('src/pages/dashboard/post/new'));
const BlogEditPostPage = lazy(() => import('src/pages/dashboard/post/edit'));
// Job
const JobDetailsPage = lazy(() => import('src/pages/dashboard/job/details'));
const JobListPage = lazy(() => import('src/pages/dashboard/job/list'));
const JobCreatePage = lazy(() => import('src/pages/dashboard/job/new'));
const JobEditPage = lazy(() => import('src/pages/dashboard/job/edit'));
// Tour
const TourDetailsPage = lazy(() => import('src/pages/dashboard/tour/details'));
const TourListPage = lazy(() => import('src/pages/dashboard/tour/list'));
const TourCreatePage = lazy(() => import('src/pages/dashboard/tour/new'));
const TourEditPage = lazy(() => import('src/pages/dashboard/tour/edit'));
// File manager
const FileManagerPage = lazy(() => import('src/pages/dashboard/file-manager'));
// App
const ChatPage = lazy(() => import('src/pages/dashboard/chat'));
const MailPage = lazy(() => import('src/pages/dashboard/mail'));
const CalendarPage = lazy(() => import('src/pages/dashboard/calendar'));
const KanbanPage = lazy(() => import('src/pages/dashboard/kanban'));
// Test render page by role
const PermissionDeniedPage = lazy(() => import('src/pages/dashboard/permission'));
// Blank page
const ParamsPage = lazy(() => import('src/pages/dashboard/params'));
const BlankPage = lazy(() => import('src/pages/dashboard/blank'));

const UserEditPageNew = lazy(() => import('src/sections/user-management/view/user-edit-view'));

const PermisosSistemasPage = lazy(() => import('src/pages/dashboard/permisosSistemas'));

 
// ----------------------------------------------------------------------

const layoutContent = (
  <DashboardLayout>
    <Suspense fallback={<LoadingScreen />}>
      <Outlet />
    </Suspense>
  </DashboardLayout>
);

export const dashboardRoutes = [
  {
    path: 'dashboard',
    element: CONFIG.auth.skip ? <>{layoutContent}</> : <AuthGuard>{layoutContent}</AuthGuard>,
    children: [
      { element: <IndexPage />, index: true },
      { path: 'ecommerce', element: <OverviewEcommercePage /> },
      { path: 'analytics', element: <OverviewAnalyticsPage /> },
      { path: 'banking', element: <OverviewBankingPage /> },
      { path: 'booking', element: <OverviewBookingPage /> },
      { path: 'file', element: <OverviewFilePage /> },
      { path: 'course', element: <OverviewCoursePage /> },
      {
        path: 'user',
        children: [
          { element: <UserProfilePage />, index: true },
          { path: 'profile', element: <UserProfilePage /> },
          { path: 'cards', element: <UserCardsPage /> },
          { path: 'list', element: <UserListPage /> },
          { path: 'new', element: <NewUserPage /> },
          { path: ':id/edit', element: <UserEditPage /> },
          { path: 'account', element: <UserAccountPage /> },
        ],
      },
      {
        path: 'product',
        children: [
          { element: <ProductListPage />, index: true },
          { path: 'list', element: <ProductListPage /> },
          { path: ':id', element: <ProductDetailsPage /> },
          { path: 'new', element: <ProductCreatePage /> },
          { path: ':id/edit', element: <ProductEditPage /> },
        ],
      },
      {
        path: 'order',
        children: [
          { element: <OrderListPage />, index: true },
          { path: 'list', element: <OrderListPage /> },
          { path: ':id', element: <OrderDetailsPage /> },
        ],
      },
      {
        path: 'invoice',
        children: [
          { element: <InvoiceListPage />, index: true },
          { path: 'list', element: <InvoiceListPage /> },
          { path: ':id', element: <InvoiceDetailsPage /> },
          { path: ':id/edit', element: <InvoiceEditPage /> },
          { path: 'new', element: <InvoiceCreatePage /> },
        ],
      },
      {
        path: 'produccionPrimaria',
        children: [
          {
            path: 'unidades',
            element: (
              <RoleGuard requiredRoles={[ROLES.UNIDADES_READ]}>
                <UserCardsPage />
              </RoleGuard>
            ), // La página correspondiente al informe de ventas
          },

          {
            element: (
              <RoleGuard requiredRoles={['sadasd']}>
                <ProductListPage />
              </RoleGuard>
            ),
          },

          {
            path: ':id',
            element: (
              <RoleGuard requiredRoles={['sadasd']}>
                <InvoiceListPage />
              </RoleGuard>
            ),
          },
          {
            path: ':id/edit',
            element: (
              <RoleGuard requiredRoles={['sadasd']}>
                <InvoiceListPage />
              </RoleGuard>
            ),
          },
          {
            path: 'new',
            element: (
              <RoleGuard requiredRoles={['sadasd']}>
                <InvoiceListPage />
              </RoleGuard>
            ),
          },
        ],
      },

      {
        path: 'tic',
        children: [
          {
            path: 'moduloSolicitudes',
            children: [
              {
                path: 'nuevaSolicitudMaquina',
                element: (
                  <RoleGuard
                    requiredRoles={[
                      ROLES.GENERACION_SOLICITUD_TIC_NUEVO_EQUIPO_CREATE,
                      ROLES.GENERACION_SOLICITUD_TIC_NUEVO_EQUIPO_VIEW,
                    ]}
                  >
                    <UserCreatePage />
                  </RoleGuard>
                ), // La página correspondiente al informe de ventas
              },
              {
                path: 'informeVentas2',
                element: (
                  <RoleGuard requiredRoles={['informes_venta_read']}>
                    <ProductListPage />
                  </RoleGuard>
                ), // Detalle de un informe específico
              },
            ],
          },
        ],
      },

      {
        path: 'comercial',
        children: [
          {
            path: 'moduloSolicitudes',
            children: [
              {
                path: 'nuevaSolicitudMaquina',
                element: (
                  <RoleGuard
                    requiredRoles={[
                      ROLES.GENERACION_SOLICITUD_COMERCIAL_NUEVO_EQUIPO_CREATE,
                      ROLES.GENERACION_SOLICITUD_COMERCIAL_NUEVO_EQUIPO_VIEW,
                    ]}
                  >
                    <UserCreatePage />
                  </RoleGuard>
                ), // La página correspondiente al informe de ventas
              },
              {
                path: 'informeVentas2',
                element: (
                  <RoleGuard requiredRoles={['informes_venta_read']}>
                    <ProductListPage />
                  </RoleGuard>
                ), // Detalle de un informe específico
              },
            ],
          },
        ],
      },

      {
        path: 'seguridad',
        children: [
          {
            path: 'parametrizaciones',
            children: [
              {
                path: 'ajusteEnvioNotificaciones',
                element: (
                  <RoleGuard
                    requiredRoles={[
                      ROLES.PARAMETRIZAR_NOTIFICACION_CREATE,
                      ROLES.PARAMETRIZAR_NOTIFICACION_VIEW,
                    ]}
                  >
                    <Notificaciones />
                  </RoleGuard>
                ), // La página correspondiente al informe de ventas
              },

              {
                path: 'autorizacionesFirmas',
                element: (
                  <RoleGuard
                    requiredRoles={[ROLES.PARAMETRIZAR_FIRMA_CREATE, ROLES.PARAMETRIZAR_FIRMA_VIEW]}
                  >
                    <AutorizacionesFirmas />
                  </RoleGuard>
                ), // La página correspondiente al informe de ventas
              },

              {
                path: 'informeVentas2',
                element: (
                  <RoleGuard requiredRoles={['informes_venta_read']}>
                    <ProductListPage />
                  </RoleGuard>
                ), // Detalle de un informe específico
              },
            ],
          },

          {
            path: 'usuarios',
            children: [
              {
                path: 'nuevo',
                element: (
                  <RoleGuard
                    requiredRoles={[
                      ROLES.GENERACION_NUEVO_USUARIO_VIEW,
                      ROLES.LISTA_USUARIOS_CREATE,
                    ]}
                  >
                    <NewUserPage />
                  </RoleGuard>
                ),
              },
              {
                path: 'lista',
                element: (
                  <RoleGuard
                    requiredRoles={[
                      ROLES.LISTA_USUARIOS_VIEW,
                      ROLES.LISTA_USUARIOS_CREATE,
                      ROLES.LISTA_USUARIOS_UPDATE,
                      ROLES.LISTA_USUARIOS_ENABLE,
                      ROLES.LISTA_USUARIOS_DISABLE,
                      ROLES.LISTA_USUARIOS_PERMISSION,
                    ]}
                  >
                    <UserListPage />
                  </RoleGuard>
                ),
              },
              {
                path: ':id/editar',
                element: (
                     <UserEditView />
                 ),
              },
              {
                path: 'permisos',
                element: (
                  <RoleGuard requiredRoles={[ROLES.LISTA_USUARIOS_PERMISSION]}>
                    <PermisosSistemasPage />
                  </RoleGuard>
                ),
              },
            ],
          },

          {
            path: 'roles',
            element: (
              <RoleGuard
                requiredRoles={[
                  ROLES.LISTA_ROLES_VIEW,
                  ROLES.GENERACION_NUEVO_ROL_VIEW,
                  ROLES.LISTA_ROLES_PERMISSION,
                ]}
              >
                <Outlet />
              </RoleGuard>
            ),
            children: [
              {
                path: 'nuevo',
                element: (
                  <RoleGuard
                    requiredRoles={[
                      ROLES.GENERACION_NUEVO_ROL_VIEW,
                      ROLES.GENERACION_NUEVO_ROL_CREATE,
                    ]}
                  >
                    <NewRoleView />
                  </RoleGuard>
                ),
              },
              {
                path: 'lista',
                element: (
                  <RoleGuard
                    requiredRoles={[
                      ROLES.LISTA_ROLES_VIEW,
                    ]}
                  >
                    <RoleListView />
                  </RoleGuard>
                ),
              },
              {
                path: 'permisos',
                element: (
                  <RoleGuard
                    requiredRoles={[
                      ROLES.LISTA_ROLES_PERMISSION,
                    ]}
                  >
                    <RolePermissionsView />
                  </RoleGuard>
                ),
              }
            ]
          },

        ],
      },

      {
        path: 'seguridad',
        children: [
          {
            path: 'cambioPass',
            element: <UpdatePassView />, // Edición de un informe específico
          },
        ],
      },

      {
        path: 'post',
        children: [
          { element: <BlogPostsPage />, index: true },
          { path: 'list', element: <BlogPostsPage /> },
          { path: ':title', element: <BlogPostPage /> },
          { path: ':title/edit', element: <BlogEditPostPage /> },
          { path: 'new', element: <BlogNewPostPage /> },
        ],
      },
      {
        path: 'job',
        children: [
          { element: <JobListPage />, index: true },
          { path: 'list', element: <JobListPage /> },
          { path: ':id', element: <JobDetailsPage /> },
          { path: 'new', element: <JobCreatePage /> },
          { path: ':id/edit', element: <JobEditPage /> },
        ],
      },
      {
        path: 'tour',
        children: [
          { element: <TourListPage />, index: true },
          { path: 'list', element: <TourListPage /> },
          { path: ':id', element: <TourDetailsPage /> },
          { path: 'new', element: <TourCreatePage /> },
          { path: ':id/edit', element: <TourEditPage /> },
        ],
      },
      { path: 'file-manager', element: <FileManagerPage /> },
      { path: 'mail', element: <MailPage /> },
      { path: 'chat', element: <ChatPage /> },
      { path: 'calendar', element: <CalendarPage /> },
      { path: 'kanban', element: <KanbanPage /> },
      { path: 'permission', element: <PermissionDeniedPage /> },
      { path: 'params', element: <ParamsPage /> },
      { path: 'blank', element: <BlankPage /> },
    ],
  },
];
