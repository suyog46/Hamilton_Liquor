import { Icon } from "@iconify/react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import GlowBackground from "@/components/Common/GlowBackground/GlowBackground";
import { siteConfig } from "@/lib/utils";

interface Review {
  name: string;
  initials: string;
  rating: number;
  timeAgo: string;
  text: string;
}

const reviews: Review[] = [
  {
    name: "Michael R.",
    initials: "MR",
    rating: 5,
    timeAgo: "2 weeks ago",
    text: "Great selection of whiskey and the staff picks are always spot on. Pickup order was ready in 20 minutes.",
  },
  {
    name: "Sarah T.",
    initials: "ST",
    rating: 5,
    timeAgo: "1 month ago",
    text: "Delivery was fast and the driver checked ID at the door. Prices are competitive with weekly specials worth watching.",
  },
  {
    name: "James K.",
    initials: "JK",
    rating: 4,
    timeAgo: "1 month ago",
    text: "Solid wine selection and friendly staff. Would love to see more craft beer options but overall a great local shop.",
  },
];

const GoogleReviews = () => {
  return (
    <section className="relative bg-gray-50 py-16 overflow-hidden">
      <GlowBackground />
      <div className="relative max-w-[1280px] mx-auto px-6">
        <div className="flex flex-col items-center text-center gap-3 mb-10">
          <span className="text-xs font-semibold uppercase tracking-widest text-primary-normal">Customer Love</span>
          <h2 className="font-title text-2xl sm:text-3xl font-bold text-black">What Customers Say</h2>
          <div className="flex items-center gap-2">
            <Icon icon="logos:google-icon" className="w-5 h-5" />
            <span className="text-lg font-bold text-black">{siteConfig.googleRating.toFixed(1)}</span>
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Icon
                  key={i}
                  icon="solar:star-bold"
                  className={`w-4 h-4 ${i < Math.round(siteConfig.googleRating) ? "text-yellow-500" : "text-gray-200"}`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-500">({siteConfig.googleReviewCount} Google reviews)</span>
          </div>
          <a
            href={siteConfig.googleReviewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold text-primary-normal hover:opacity-80 transition-opacity"
          >
            Leave us a review &rarr;
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          {reviews.map((review) => (
            <div key={review.name} className="flex flex-col gap-4 p-6 rounded-2xl bg-white border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback className="bg-black text-primary-normal text-xs font-semibold">
                    {review.initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-semibold text-black">{review.name}</p>
                  <p className="text-xs text-gray-400">{review.timeAgo}</p>
                </div>
              </div>
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Icon
                    key={i}
                    icon="solar:star-bold"
                    className={`w-4 h-4 ${i < review.rating ? "text-yellow-500" : "text-gray-200"}`}
                  />
                ))}
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">{review.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default GoogleReviews;
