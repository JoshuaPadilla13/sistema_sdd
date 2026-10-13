import { NextResponse } from "next/server";
import { auth0 } from "../../../../lib/auth0.js";
import { syncAuth0User, isAuthorizedSuperAdmin } from "../../../../lib/services/users.js";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await auth0.getSession();

    if (!session || !session.user) {
      return NextResponse.json({
        isAuthenticated: false,
        user: null,
        roles: [],
      });
    }

    // Sincronizar usuario con Neon PostgreSQL y obtener sus roles
    const dbUser = await syncAuth0User(session.user);

    return NextResponse.json({
      isAuthenticated: true,
      user: {
        name: dbUser.name || session.user.name,
        email: dbUser.email || session.user.email,
        picture: dbUser.picture || session.user.picture,
      },
      roles: dbUser.roles || [],
      isSuperAdmin: isAuthorizedSuperAdmin(dbUser.email),
    });
  } catch (error) {
    // Si auth0 no está configurado aún o no hay sesión, responder seguro
    return NextResponse.json({
      isAuthenticated: false,
      user: null,
      roles: [],
    });
  }
}
