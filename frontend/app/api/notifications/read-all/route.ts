import type { NextRequest } from "next/server";
import { staffResponse } from "../../../../lib/staff-proxy";

export function PATCH(request: NextRequest) {
  return staffResponse(request, ["notifications", "read-all"]);
}