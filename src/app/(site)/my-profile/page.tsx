"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import AddressSection from "@/components/Profile/AddressSection";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetMeQuery } from "@/redux/features/user/userApiSlice";

export default function MyProfilePage() {
  const router = useRouter();
  const { data, isLoading, isError } = useGetMeQuery();

  useEffect(() => {
    if (!isLoading && (isError || !data?.data)) router.replace("/login?redirect=/my-profile");
  }, [data, isError, isLoading, router]);

  if (isLoading || !data?.data) {
    return <div className="mx-auto max-w-5xl px-6 py-32"><Skeleton className="h-96 rounded-xl" /></div>;
  }

  const user = data.data;
  return (
    <div className="min-h-screen bg-gray-50 pt-28 pb-16">
      <div className="mx-auto max-w-5xl space-y-8 px-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary-normal">My account</p>
          <h1 className="mt-1 font-title text-3xl font-bold">My profile</h1>
        </div>
        <div className="rounded-xl bg-white p-6 ring-1 ring-gray-200">
          <div className="flex items-center gap-4">
            <div className="flex size-12 items-center justify-center rounded-full bg-primary-normal/20">
              <Icon icon="solar:user-linear" className="size-6" />
            </div>
            <div>
              <p className="font-semibold">{user.name}</p>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl bg-white p-6 ring-1 ring-gray-200">
          <AddressSection />
        </div>
      </div>
    </div>
  );
}
