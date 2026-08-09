import { NextRequest } from "next/server";
import { forwardAuthRequest } from "@/lib/api/forwardAuthRequest";

export async function POST(req: NextRequest) {
  return forwardAuthRequest(req, "auth/resend-verification", "Could not resend the verification email.");
}
