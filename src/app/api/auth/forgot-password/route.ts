import { NextRequest } from "next/server";
import { forwardAuthRequest } from "@/lib/api/forwardAuthRequest";

export async function POST(req: NextRequest) {
  return forwardAuthRequest(
    req,
    "auth/forgot-password",
    "Could not send the password reset email.",
  );
}
