import { redirect } from "next/navigation";

const SpiritsPage = () => {
  redirect("/shop?category=Spirits");
};

export default SpiritsPage;
