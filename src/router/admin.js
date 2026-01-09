import AdminLayout from '@/admin/AdminLayout.vue'

export default {
  path: '/admin',
  component: AdminLayout,
  meta: { requiresAdmin: true },
  children: [
    { path: '', component: () => import('@/admin/pages/Dashboard.vue') },
    { path: 'users', component: () => import('@/admin/pages/Users.vue') },
    { path: 'users/:id', component: () => import('@/admin/pages/UserDetail.vue') },
    { path: 'requests', component: () => import('@/admin/pages/Requests.vue') },
    { path: 'allocations', component: () => import('@/admin/pages/Allocations.vue') },
    { path: 'stats', component: () => import('@/admin/pages/Statistics.vue') },
    { path: 'settings', component: () => import('@/admin/pages/Settings.vue') },
  ]
}
