import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

const protectedRoutes = [
  '/dashboard',
  '/dashboard/*',
  '/tutor',
  '/tutor/*',
  '/admin',
  '/admin/*',
];

const adminRoutes = ['/admin', '/admin/*'];
const tutorRoutes = ['/tutor', '/tutor/*'];

const roleRedirects: Record<string, string> = {
  admin: '/admin',
  tutor: '/tutor',
  student: '/dashboard',
};

export default auth((req) => {
  const { nextUrl } = req;
  const pathname = nextUrl.pathname;

  const isProtectedRoute = protectedRoutes.some((route) => {
    if (route.endsWith('/*')) {
      const baseRoute = route.replace('/*', '');
      return pathname.startsWith(baseRoute);
    }
    return pathname === route;
  });

  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  const isAuthenticated = !!req.auth;

  if (!isAuthenticated) {
    const loginUrl = new URL('/auth/login', nextUrl);
    loginUrl.searchParams.set('callbackUrl', nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  const userRole = req.auth?.user?.role || 'student';

  const isAdminRoute = adminRoutes.some((route) => {
    if (route.endsWith('/*')) {
      const baseRoute = route.replace('/*', '');
      return pathname.startsWith(baseRoute);
    }
    return pathname === route;
  });

  if (isAdminRoute && userRole !== 'admin') {
    const redirectUrl = new URL(roleRedirects[userRole] || '/dashboard', nextUrl);
    return NextResponse.redirect(redirectUrl);
  }

  const isTutorRoute = tutorRoutes.some((route) => {
    if (route.endsWith('/*')) {
      const baseRoute = route.replace('/*', '');
      return pathname.startsWith(baseRoute);
    }
    return pathname === route;
  });

  if (isTutorRoute && userRole !== 'tutor' && userRole !== 'admin') {
    const redirectUrl = new URL(roleRedirects[userRole] || '/dashboard', nextUrl);
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
