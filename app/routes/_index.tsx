import { Button } from "@material-tailwind/react";
import { Link } from "@remix-run/react";

export default function Index() {
  const thisYear = new Date().getFullYear();
  return (
    <div className="h-full">
      <div
        id="hero"
        className="h-full w-screen bg-hero bg-contain bg-no-repeat bg-center bg-gray-100 flex flex-col justify-center"
      >
        <h1 className="text-4xl text-white p-8 rounded-sm bg-gray-700 opacity-90 text-center">
          Welcome to the {thisYear} <br />
          Addict II Athlete Silent Auction!
        </h1>
        <div className="flex mt-4 justify-center">
          <Link to="/auctions" prefetch="intent">
            <Button size="lg" className="mt-8 bg-red-600">
              View Auctions
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
