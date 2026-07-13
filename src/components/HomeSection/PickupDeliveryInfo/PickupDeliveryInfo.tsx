import { Icon } from "@iconify/react";

const PickupDeliveryInfo = () => {
  return (
    <section className="bg-gray-50 py-16">
      <div className="max-w-[1280px] mx-auto px-6">
        <div className="flex flex-col items-center text-center gap-2 mb-10">
          <span className="text-xs font-semibold uppercase tracking-widest text-primary-normal">How It Works</span>
          <h2 className="font-title text-2xl sm:text-3xl font-bold text-black">Pickup &amp; Delivery</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="flex flex-col gap-4 p-6 sm:p-8 rounded-2xl bg-white border border-gray-100 shadow-sm">
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-black">
              <Icon icon="solar:bag-check-outline" className="w-7 h-7 text-primary-normal" />
            </div>
            <h3 className="font-title text-xl font-semibold text-black">In-Store Pickup</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Order online and pick up in as little as 30 minutes. Ready-for-pickup notifications sent straight to
              your phone.
            </p>
            <ul className="flex flex-col gap-2 text-sm text-gray-700">
              <li className="flex items-center gap-2">
                <Icon icon="solar:check-circle-bold" className="w-4 h-4 text-primary-normal" />
                Ready in 30&ndash;60 minutes
              </li>
              <li className="flex items-center gap-2">
                <Icon icon="solar:check-circle-bold" className="w-4 h-4 text-primary-normal" />
                Free, no minimum order
              </li>
              <li className="flex items-center gap-2">
                <Icon icon="solar:check-circle-bold" className="w-4 h-4 text-primary-normal" />
                Curbside available
              </li>
            </ul>
            <a
              href="/location-hours"
              className="mt-2 inline-flex items-center justify-center px-6 py-3 rounded-lg bg-primary-normal text-black text-sm font-semibold hover:opacity-90 transition w-full sm:w-fit"
            >
              Get Directions
            </a>
          </div>

          <div className="flex flex-col gap-4 p-6 sm:p-8 rounded-2xl bg-white border border-gray-100 shadow-sm">
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-black">
              <Icon icon="solar:delivery-outline" className="w-7 h-7 text-primary-normal" />
            </div>
            <h3 className="font-title text-xl font-semibold text-black">Local Delivery</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Delivery to your door within our local service area, where legally available. Age verification
              required at drop-off.
            </p>
            <ul className="flex flex-col gap-2 text-sm text-gray-700">
              <li className="flex items-center gap-2">
                <Icon icon="solar:check-circle-bold" className="w-4 h-4 text-primary-normal" />
                Within a 2&ndash;2.5 mile radius
              </li>
              <li className="flex items-center gap-2">
                <Icon icon="solar:check-circle-bold" className="w-4 h-4 text-primary-normal" />
                $30 minimum &middot; $4.99 fee, free over $200
              </li>
              <li className="flex items-center gap-2">
                <Icon icon="solar:check-circle-bold" className="w-4 h-4 text-primary-normal" />
                ID check on delivery
              </li>
            </ul>
            <a
              href="/pickup-delivery-policy"
              className="mt-2 inline-flex items-center justify-center px-6 py-3 rounded-lg bg-black text-white text-sm font-semibold hover:opacity-90 transition w-full sm:w-fit"
            >
              Delivery Details
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PickupDeliveryInfo;
