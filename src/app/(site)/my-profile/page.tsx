"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import AddressSection from "@/components/Profile/AddressSection";
import ChangePasswordSection from "@/components/Profile/ChangePasswordSection";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetMeQuery } from "@/redux/features/user/userApiSlice";

type ProfileTab = "addresses" | "password";

export default function MyProfilePage() {
  const router = useRouter();
  const { data, isLoading, isError } = useGetMeQuery();
  const [activeTab, setActiveTab] = useState<ProfileTab>("addresses");

  useEffect(() => {
    if (!isLoading && (isError || !data?.data)) {
      router.replace("/login?redirect=/my-profile");
    }
  }, [data, isError, isLoading, router]);

  if (isLoading || !data?.data) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-32">
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  const user = data.data;
  const initial = user.name ? user.name.charAt(0).toUpperCase() : "U";

  return (
    <div className="min-h-screen bg-gray-50 pt-28 pb-16">
      <div className="mx-auto max-w-6xl space-y-6 px-4 sm:px-6">
        {/* Page Title */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary-normal">
            My Account
          </p>
          <h1 className="mt-1 font-title text-3xl font-bold text-gray-900">
            Account Settings
          </h1>
        </div>

        {/* 2-Column Layout: Sidebar + Main Content */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
          {/* Sidebar */}
          <aside className="space-y-4 md:col-span-4 lg:col-span-3">
            {/* User Profile Summary */}
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3.5">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary-normal font-semibold text-black shadow-inner">
                  {initial}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-gray-900">{user.name}</p>
                  <p className="truncate text-xs text-gray-500">{user.email}</p>
                </div>
              </div>
            </div>

            {/* Sidebar Navigation Tabs */}
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white p-1.5 shadow-sm">
              <nav className="flex flex-col gap-1">
                <button
                  type="button"
                  onClick={() => setActiveTab("addresses")}
                  className={`flex w-full items-center gap-3 rounded-lg px-3.5 py-2.5 text-left text-xs font-medium transition-all ${
                    activeTab === "addresses"
                      ? "bg-primary-normal font-semibold text-black shadow-sm"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  <Icon
                    icon="solar:map-point-linear"
                    className={`size-4 shrink-0 ${
                      activeTab === "addresses" ? "text-black" : "text-gray-500"
                    }`}
                  />
                  <span>Saved Addresses</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("password")}
                  className={`flex w-full items-center gap-3 rounded-lg px-3.5 py-2.5 text-left text-xs font-medium transition-all ${
                    activeTab === "password"
                      ? "bg-primary-normal font-semibold text-black shadow-sm"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  <Icon
                    icon="solar:lock-password-linear"
                    className={`size-4 shrink-0 ${
                      activeTab === "password" ? "text-black" : "text-gray-500"
                    }`}
                  />
                  <span>Change Password</span>
                </button>
              </nav>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="md:col-span-8 lg:col-span-9">
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              {activeTab === "addresses" && <AddressSection />}
              {activeTab === "password" && <ChangePasswordSection />}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
