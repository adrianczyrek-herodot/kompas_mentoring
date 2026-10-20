import { getRequestScope } from "@/server/container";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const scope = await getRequestScope();
    const db = await scope.resolve("dbHealthCheck").check();
    if (!db.ok) console.error("Health check: database unavailable —", db.reason);
    return Response.json(
      { status: db.ok ? "ok" : "degraded", db: db.ok, time: scope.resolve("clock").now().toISOString() },
      { status: db.ok ? 200 : 503 },
    );
  } catch (error) {
    console.error("Health check failed", error);
    return Response.json({ status: "error", db: false }, { status: 503 });
  }
}
