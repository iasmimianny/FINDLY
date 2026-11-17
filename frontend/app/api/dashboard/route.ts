import type { NextRequest } from "next/server";
import { dashboardResponse } from "../../../lib/dashboard-proxy";

export async function GET(request: NextRequest) {
  return dashboardResponse(request);
}
