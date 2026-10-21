import { NextResponse } from "next/server";
import { auth0 } from "../../../../lib/auth0.js";
import { reorderDocuments } from "../../../../lib/services/docs";

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const body = await request.json();
    const { orderedIds } = body;

    if (!Array.isArray(orderedIds)) {
      return NextResponse.json(
        { error: "orderedIds debe ser un arreglo de IDs" },
        { status: 400 }
      );
    }

    let userId = null;
    try {
      const session = await auth0.getSession();
      userId = session?.user?.sub || session?.user?.email || null;
    } catch (e) {}

    await reorderDocuments(orderedIds, userId);
    return NextResponse.json({ success: true, message: "Orden actualizado exitosamente" });
  } catch (error) {
    console.error("Error al reordenar documentos:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
