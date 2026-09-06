"use client";

import { useState } from "react";
import { toast } from "sonner";
import PageBanner from "@/components/Common/PageBanner/PageBanner";
import StoreInfoCard from "@/components/Common/StoreInfoCard/StoreInfoCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { isFetchBaseQueryError } from "@/lib/api/isFetchBaseQueryError";
import { useCreateContactMessageMutation } from "@/redux/features/contactMessage/contactMessageApiSlice";

const getErrorMessage = (error: unknown, fallback: string) => {
  if (isFetchBaseQueryError(error)) {
    const data = error.data as { message?: string } | undefined;
    if (typeof data?.message === "string") return data.message;
  }
  return fallback;
};

const initialForm = {
  full_name: "",
  phone: "",
  email: "",
  subject: "",
  message: "",
};

const ContactPage = () => {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [createContactMessage, { isLoading }] =
    useCreateContactMessageMutation();

  const handleChange =
    (field: keyof typeof initialForm) =>
    (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const nextErrors: Record<string, string> = {};
    if (!form.full_name.trim()) nextErrors.full_name = "Full name is required.";
    if (!form.phone.trim()) nextErrors.phone = "Phone number is required.";
    if (!form.email.trim()) nextErrors.email = "Email is required.";
    if (!form.subject.trim()) nextErrors.subject = "Subject is required.";
    if (!form.message.trim()) nextErrors.message = "Message is required.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    try {
      await createContactMessage({
        full_name: form.full_name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        subject: form.subject.trim(),
        message: form.message.trim(),
      }).unwrap();
      toast.success("Message sent! We'll get back to you shortly.");
      setForm(initialForm);
      setErrors({});
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to send your message."));
    }
  };

  return (
    <>
      <PageBanner
        eyebrow="Get in Touch"
        title="Contact Us"
        subtitle="Questions about an order, a product, or pickup? Send us a message or give us a call."
        breadcrumbs={[{ name: "Contact Us" }]}
      />

      <section className="bg-white py-14 sm:py-20">
        <div className="max-w-[1280px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-10">
          {/* Contact form */}
          <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="name"
                  className="text-xs font-semibold text-gray-600"
                >
                  Full Name
                </label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Jane Smith"
                  className="h-11 rounded-lg text-sm border-gray-200"
                  value={form.full_name}
                  onChange={handleChange("full_name")}
                />
                {errors.full_name && (
                  <p className="text-xs text-destructive">{errors.full_name}</p>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="phone"
                  className="text-xs font-semibold text-gray-600"
                >
                  Phone
                </label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="(443) 555-0100"
                  className="h-11 rounded-lg text-sm border-gray-200"
                  value={form.phone}
                  onChange={handleChange("phone")}
                />
                {errors.phone && (
                  <p className="text-xs text-destructive">{errors.phone}</p>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="email"
                className="text-xs font-semibold text-gray-600"
              >
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="jane@email.com"
                className="h-11 rounded-lg text-sm border-gray-200"
                value={form.email}
                onChange={handleChange("email")}
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="subject"
                className="text-xs font-semibold text-gray-600"
              >
                Subject
              </label>
              <Input
                id="subject"
                type="text"
                placeholder="Order question, product request, feedback…"
                className="h-11 rounded-lg text-sm border-gray-200"
                value={form.subject}
                onChange={handleChange("subject")}
              />
              {errors.subject && (
                <p className="text-xs text-destructive">{errors.subject}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="message"
                className="text-xs font-semibold text-gray-600"
              >
                Message
              </label>
              <Textarea
                id="message"
                placeholder="How can we help?"
                rows={5}
                className="rounded-lg text-sm border-gray-200"
                value={form.message}
                onChange={handleChange("message")}
              />
              {errors.message && (
                <p className="text-xs text-destructive">{errors.message}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="h-12 rounded-lg bg-primary-normal text-black text-sm font-semibold hover:opacity-90 w-full sm:w-fit px-8"
            >
              {isLoading ? "Sending…" : "Send Message"}
            </Button>
          </form>

          {/* Store info */}
          <div className="flex flex-col gap-4">
            <StoreInfoCard />

            <div className="p-6 rounded-2xl border border-gray-100 bg-gray-50">
              <p className="text-sm text-gray-600 leading-relaxed">
                Must be 21+ to purchase alcohol. A valid government-issued photo
                ID is required for all pickup and delivery orders.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ContactPage;
