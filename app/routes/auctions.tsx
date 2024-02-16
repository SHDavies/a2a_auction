import { Outlet } from "@remix-run/react";

export default function Auctions() {
  return (
    <div className="pt-32">
      <Outlet />
    </div>
  );
}
