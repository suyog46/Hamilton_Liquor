import { redirect } from "next/navigation";

const BeerPage = () => {
  redirect("/shop?category=Beer");
};

export default BeerPage;
