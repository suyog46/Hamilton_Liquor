import NavbarClient from "./NavbarClient";
import type {
  OperatingHour,
  StoreInformation,
  StoreLocation,
} from "@/redux/features/store/storeApiSlice";

export interface NavbarProps {
  information?: StoreInformation | null;
  location?: StoreLocation | null;
  hours?: OperatingHour[];
}

const Navbar = ({ information, location, hours }: NavbarProps) => {
  return (
    <NavbarClient
      initialInformation={information}
      initialLocation={location}
      initialHours={hours}
    />
  );
};

export default Navbar;
