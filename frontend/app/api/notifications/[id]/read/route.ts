import type { NextRequest } from "next/server";
import { staffResponse } from "../../../../../lib/staff-proxy";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  return staffResponse(request, ["notifications", id, "read"]);
}