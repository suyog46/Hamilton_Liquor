import { Icon } from "@iconify/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const NewsletterSignup = () => {
  return (
    <section className="relative bg-black py-16 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_rgba(227,185,125,0.15)_0%,_rgba(0,0,0,0)_60%)]" />
      <div className="relative max-w-[720px] mx-auto px-6 flex flex-col items-center text-center gap-4">
        <div className="flex items-center justify-center w-14 h-14 rounded-full bg-primary-normal/10 border border-primary-normal/40">
          <Icon icon="solar:letter-outline" className="w-6 h-6 text-primary-normal" />
        </div>
        <span className="text-xs font-semibold uppercase tracking-widest text-primary-normal">Stay in the Know</span>
        <h2 className="font-title text-2xl sm:text-3xl font-bold text-white">
          Get 10% Off Your First Order
        </h2>
        <p className="text-sm sm:text-base text-white/60 max-w-md">
          Sign up for SMS or email alerts on weekly specials, new arrivals, and exclusive discounts.
        </p>

        <form className="flex flex-col sm:flex-row gap-3 w-full mt-2">
          <Input
            type="text"
            placeholder="Email or mobile number"
            className="h-12 rounded-lg px-4 text-sm bg-white/5 border-white/15 text-white placeholder:text-white/40"
          />
          <Button
            type="submit"
            className="h-12 px-8 rounded-lg bg-primary-normal text-black text-sm font-semibold hover:opacity-90 shrink-0"
          >
            Sign Up
          </Button>
        </form>
        <p className="text-[11px] text-white/40">
          By signing up you agree to receive marketing messages. Msg &amp; data rates may apply. Unsubscribe anytime.
        </p>
      </div>
    </section>
  );
};

export default NewsletterSignup;
