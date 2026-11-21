import type { NextRequest } from "next/server";
import { staffResponse } from "../../../lib/staff-proxy";

export function GET(request: NextRequest) {
  return staffResponse(request, ["notifications"]);
}