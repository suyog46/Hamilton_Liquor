import { redirect } from "next/navigation";

const WinePage = () => {
  redirect("/shop?category=Wine");
};

export default WinePage;
