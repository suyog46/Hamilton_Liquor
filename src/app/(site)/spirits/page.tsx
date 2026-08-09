import { redirect } from "next/navigation";

const SpiritsPage = () => {
  redirect("/shop?category=spirits");
};

export default SpiritsPage;
