import { NextRequest } from "next/server";
import { proxyItems } from "../../../../lib/items-proxy";

type Context = { params: Promise<{ segments: string[] }> };

export async function GET(request: NextRequest, context: Context) {
  return proxyItems(request, (await context.params).segments);
}

export async function POST(request: NextRequest, context: Context) {
  return proxyItems(request, (await context.params).segments);
}
