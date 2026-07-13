import { Icon } from "@iconify/react";
import PageBanner from "@/components/Common/PageBanner/PageBanner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { siteConfig } from "@/lib/utils";

const ContactPage = () => {
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
          <form className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="name" className="text-xs font-semibold text-gray-600">
                  Full Name
                </label>
                <Input id="name" type="text" placeholder="Jane Smith" className="h-11 rounded-lg text-sm border-gray-200" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="phone" className="text-xs font-semibold text-gray-600">
                  Phone
                </label>
                <Input id="phone" type="tel" placeholder="(443) 555-0100" className="h-11 rounded-lg text-sm border-gray-200" />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-xs font-semibold text-gray-600">
                Email
              </label>
              <Input id="email" type="email" placeholder="jane@email.com" className="h-11 rounded-lg text-sm border-gray-200" />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="subject" className="text-xs font-semibold text-gray-600">
                Subject
              </label>
              <Input id="subject" type="text" placeholder="Order question, product request, feedback…" className="h-11 rounded-lg text-sm border-gray-200" />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="message" className="text-xs font-semibold text-gray-600">
                Message
              </label>
              <Textarea id="message" placeholder="How can we help?" rows={5} className="rounded-lg text-sm border-gray-200" />
            </div>

            <Button type="button" className="h-12 rounded-lg bg-primary-normal text-black text-sm font-semibold hover:opacity-90 w-full sm:w-fit px-8">
              Send Message
            </Button>
          </form>

          {/* Store info */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-5 p-6 sm:p-8 rounded-2xl bg-black">
              <div className="flex items-start gap-3">
                <Icon icon="solar:map-point-linear" className="w-5 h-5 text-primary-normal shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-white">{siteConfig.name}</p>
                  <p className="text-sm text-white/60">{siteConfig.address.full}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Icon icon="solar:phone-linear" className="w-5 h-5 text-primary-normal shrink-0 mt-0.5" />
                <a href={siteConfig.phoneHref} className="text-sm text-white/60 hover:text-primary-normal transition-colors">
                  {siteConfig.phone}
                </a>
              </div>
              <div className="flex items-start gap-3">
                <Icon icon="solar:letter-linear" className="w-5 h-5 text-primary-normal shrink-0 mt-0.5" />
                <a href={`mailto:${siteConfig.email}`} className="text-sm text-white/60 hover:text-primary-normal transition-colors">
                  {siteConfig.email}
                </a>
              </div>
              <div className="flex items-start gap-3">
                <Icon icon="solar:clock-circle-linear" className="w-5 h-5 text-primary-normal shrink-0 mt-0.5" />
                <div className="text-sm text-white/60">
                  <p>Mon&ndash;Thu: 9:00am &ndash; 10:00pm</p>
                  <p>Fri&ndash;Sat: 9:00am &ndash; 11:00pm</p>
                  <p>Sunday: Closed</p>
                </div>
              </div>
              <a
                href={siteConfig.mapsDirectionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-primary-normal text-black text-sm font-semibold hover:opacity-90 transition w-full sm:w-fit"
              >
                <Icon icon="solar:routing-2-linear" className="w-4 h-4" />
                Get Directions
              </a>
            </div>

            <div className="p-6 rounded-2xl border border-gray-100 bg-gray-50">
              <p className="text-sm text-gray-600 leading-relaxed">
                Must be 21+ to purchase alcohol. A valid government-issued photo ID is required for all pickup and
                delivery orders.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ContactPage;
