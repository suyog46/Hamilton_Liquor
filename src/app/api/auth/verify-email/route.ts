import { NextRequest } from "next/server";
import { forwardAuthRequest } from "@/lib/api/forwardAuthRequest";

export async function POST(req: NextRequest) {
  return forwardAuthRequest(req, "auth/verify-email", "This verification link is invalid or has expired.");
}
