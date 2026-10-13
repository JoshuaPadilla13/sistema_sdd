import { NextResponse } from "next/server";
import { auth0 } from "../../../../lib/auth0.js";
import { getAllUsersWithRoles, assignUserRole, removeUserRole, isAuthorizedSuperAdmin } from "../../../../lib/services/users.js";

export const dynamic = "force-dynamic";

/**
 * Valida estrictamente que la sesión actual pertenezca a un Super Admin autorizado.
 */
async function verifySuperAdminSession() {
  try {
    const session = await auth0.getSession();
    if (!session || !session.user) return false;
    return isAuthorizedSuperAdmin(session.user.email);
  } catch (error) {
    return false;
  }
}

export async function GET() {
  try {
    const isSuperAdmin = await verifySuperAdminSession();
    if (!isSuperAdmin) {
      return NextResponse.json(
        { error: "Acceso denegado: El control de roles es de acceso exclusivo para Super Administradores." },
        { status: 403 }
      );
    }

    const users = await getAllUsersWithRoles();
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const isSuperAdmin = await verifySuperAdminSession();
    if (!isSuperAdmin) {
      return NextResponse.json(
        { error: "Acceso denegado: Solo un Super Administrador puede asignar roles." },
        { status: 403 }
      );
    }

    const { userId, roleId } = await request.json();
    if (!userId || !roleId) {
      return NextResponse.json({ error: "userId y roleId son requeridos" }, { status: 400 });
    }

    await assignUserRole(userId, roleId);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function DELETE(request) {
  try {
    const isSuperAdmin = await verifySuperAdminSession();
    if (!isSuperAdmin) {
      return NextResponse.json(
        { error: "Acceso denegado: Solo un Super Administrador puede remover roles." },
        { status: 403 }
      );
    }

    const { userId, roleId } = await request.json();
    if (!userId || !roleId) {
      return NextResponse.json({ error: "userId y roleId son requeridos" }, { status: 400 });
    }

    await removeUserRole(userId, roleId);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
