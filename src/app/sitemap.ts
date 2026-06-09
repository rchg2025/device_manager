import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://qltb.ite.id.vn'

  const routes = [
    '',
    '/login',
    '/register',
    '/dashboard',
    '/dashboard/borrow',
    '/dashboard/categories',
    '/dashboard/classroom-equipments',
    '/dashboard/classroom-maintenance',
    '/dashboard/equipments',
    '/dashboard/inventory',
    '/dashboard/maintenance',
    '/dashboard/members',
    '/dashboard/profile',
    '/dashboard/requests',
    '/dashboard/settings',
    '/dashboard/superadmin',
    '/dashboard/system-logs'
  ]

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'yearly' : 'weekly',
    priority: route === '' ? 1 : (route.startsWith('/dashboard') ? 0.8 : 0.5),
  }))
}
