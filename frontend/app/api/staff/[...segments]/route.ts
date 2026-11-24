import type { NextRequest } from "next/server";
import { staffResponse } from "../../../../lib/staff-proxy";
type Context = { params: Promise<{ segments: string[] }> };
async function handle(request: NextRequest, context: Context) { return staffResponse(request, (await context.params).segments); }
export { handle as GET, handle as POST };
