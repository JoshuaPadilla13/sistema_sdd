import { NextResponse } from "next/server";
import { auth0 } from "./lib/auth0";

export async function proxy(request) {
  let authRes = NextResponse.next();
  try {
    authRes = await auth0.middleware(request);
  } catch (e) {
    // Si las variables de Auth0 aún no están configuradas, continuar de forma segura
  }

  const { pathname } = request.nextUrl;

  // 1. Rutas de autenticación de Auth0
  if (pathname.startsWith("/auth")) {
    return authRes;
  }

  // 2. Rutas PÚBLICAS (Sin requerir sesión)
  // - Inicio: "/"
  // - Documentación pública: "/docs" y "/docs/*"
  // - Pantalla de login: "/login"
  // - Endpoints API: "/api/*"
  if (
    pathname === "/" ||
    pathname.startsWith("/docs") ||
    pathname === "/login" ||
    pathname.startsWith("/api")
  ) {
    return authRes;
  }

  // 3. Rutas PROTEGIDAS (Panel Admin y Super Admin)
  if (pathname.startsWith("/admin") || pathname.startsWith("/superadmin")) {
    try {
      const session = await auth0.getSession();
      if (!session || !session.user) {
        const { origin } = new URL(request.url);
        return NextResponse.redirect(`${origin}/login`);
      }

      // Restricción estricta: un admin normal NO puede entrar a /superadmin
      if (pathname.startsWith("/superadmin")) {
        const userEmail = (session.user.email || "").toLowerCase().trim();
        const superAdmins = [
          "nayeli.carrizales.diaz@gmail.com",
          "joshuapadillags@gmail.com"
        ];
        if (!superAdmins.includes(userEmail)) {
          const { origin } = new URL(request.url);
          // Redirigir al panel de administración regular
          return NextResponse.redirect(`${origin}/admin`);
        }
      }
    } catch (e) {
      const { origin } = new URL(request.url);
      return NextResponse.redirect(`${origin}/login`);
    }
  }

  return authRes;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};