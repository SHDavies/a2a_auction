import { Form, Link } from "@remix-run/react";

import Button from "./Button";
import ButtonLink from "./ButtonLink";
import ProgressBar from "./ProgressBar";

export default function Header({ loggedIn = false }: { loggedIn?: boolean }) {
  return (
    <header className="fixed w-full top-0 h-24 px-4 py-6 bg-red-600 bg-opacity-90 flex justify-between items-center z-40">
      <Link to="https://www.addicttoathlete.com/" className="w-fit block">
        <img
          src="/img/AIIALogo.png"
          alt="Addict To Athlete Logo"
          className="h-12"
        />
      </Link>
      {loggedIn ? (
        <Form action="/logout" method="post">
          <Button type="submit">Logout</Button>
        </Form>
      ) : (
        <div>
          <ButtonLink to="/login" buttonStyle="outline" className="mr-4">
            Sign In
          </ButtonLink>
          <ButtonLink to="/join">Sign Up</ButtonLink>
        </div>
      )}
      <div className="w-full absolute -bottom-1 left-0">
        <ProgressBar />
      </div>
    </header>
  );
}
