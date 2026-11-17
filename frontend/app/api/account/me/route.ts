import type { NextRequest } from "next/server";
import { profileResponse } from "../../../../lib/profile-proxy";

export async function GET(request: NextRequest) {
  return profileResponse(request);
}

export async function PATCH(request: NextRequest) {
  return profileResponse(request);
}
