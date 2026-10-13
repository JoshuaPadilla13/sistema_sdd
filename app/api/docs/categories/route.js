import { NextResponse } from "next/server";
import { db } from "../../../../lib/db/index";
import * as schema from "../../../../lib/db/schema";
import { asc } from "drizzle-orm";

export async function GET() {
  try {
    const categories = await db
      .select()
      .from(schema.categories)
      .orderBy(asc(schema.categories.orderIndex));

    return NextResponse.json(categories);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
