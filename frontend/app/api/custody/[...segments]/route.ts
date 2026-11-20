import type { NextRequest } from "next/server";
import { custodyResponse } from "../../../../lib/custody-proxy";
type Context = { params: Promise<{ segments: string[] }> };
async function handle(request: NextRequest, context: Context) {
  return custodyResponse(request, (await context.params).segments);
}
export { handle as GET, handle as POST };
