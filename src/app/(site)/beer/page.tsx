import { redirect } from "next/navigation";

const BeerPage = () => {
  redirect("/shop?category=beer");
};

export default BeerPage;
