import type { NextRequest } from "next/server";
import { collectionPointsResponse } from "../../../../lib/collection-points-proxy";

type Context = { params: Promise<{ segments?: string[] }> };

async function handle(request: NextRequest, context: Context) {
  return collectionPointsResponse(request, (await context.params).segments ?? []);
}

export { handle as GET, handle as POST, handle as PUT, handle as PATCH };
