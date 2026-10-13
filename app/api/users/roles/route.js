import { NextResponse } from "next/server";
import { getAllUsersWithRoles, assignUserRole, removeUserRole } from "../../../../lib/services/users.js";

export async function GET() {
  try {
    const users = await getAllUsersWithRoles();
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { userId, roleId } = await request.json();
    if (!userId || !roleId) {
      return NextResponse.json({ error: "userId y roleId son requeridos" }, { status: 400 });
    }
    await assignUserRole(userId, roleId);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
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
