import { redirect } from "next/navigation";

const WinePage = () => {
  redirect("/shop?category=wine");
};

export default WinePage;
