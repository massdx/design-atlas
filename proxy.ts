import { auth } from '@/features/auth/server';
import { NextResponse, type NextRequest } from 'next/server';

const authMiddleware = auth.middleware({
  // Redirects unauthenticated users to sign-in page
  loginUrl: '/manager/sign-in',
});

export default function middleware(req: NextRequest) {
  // Let server-action POSTs through. They expect an RSC payload, not an HTML
  // redirect — getAdmin() inside the action returns { error } when the user is
  // not authenticated, so the client can surface it via toast.
  if (req.method === 'POST' && req.headers.has('next-action')) {
    return NextResponse.next();
  }
  return authMiddleware(req);
}

export const config = {
  matcher: [
    // Protect the admin manager area. The sign-in page itself is excluded
    // so unauthenticated users can reach it.
    '/manager/((?!sign-in|sign-up|forgot-password|reset-password).*)',
    '/manager',
  ],
};
