import { Cloudinary } from "@cloudinary/url-gen";
import { cssBundleHref } from "@remix-run/css-bundle";
import type {
  LinksFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
  useLoaderData,
  useRouteError,
} from "@remix-run/react";
import { ReactNode, useEffect, useState } from "react";
import { Socket, io } from "socket.io-client";

import { getUserFromSession } from "~/session.server";
import stylesheet from "~/tailwind.css";

import Alerts from "./components/Alerts";
import ButtonLink from "./components/ButtonLink";
import Header from "./components/Header";
import { AlertContextProvider } from "./contexts/AlertContext";
import { CloudinaryContext } from "./contexts/CloudinaryContext";
import LoaderProvider from "./contexts/LoaderContext";
import { SocketProvider } from "./contexts/SocketContext";
import { S2CEvents, C2SEvents } from "./models/socket";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;700&display=swap",
  },
  ...(cssBundleHref ? [{ rel: "stylesheet", href: cssBundleHref }] : []),
];

export const meta: MetaFunction = () => [{ title: "AIIA Silent Auction" }];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  return json({
    user: await getUserFromSession(request),
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  });
};

export default function App() {
  const { user, cloudName } = useLoaderData<typeof loader>();

  const [cloudinary] = useState(
    new Cloudinary({
      cloud: {
        cloudName,
      },
    }),
  );

  const [socket, setSocket] = useState<Socket>();
  useEffect(() => {
    const socket: Socket<S2CEvents, C2SEvents> = io({
      reconnectionAttempts: 10,
      autoConnect: true,
    });
    setSocket(socket);
    return () => {
      socket.close();
    };
  }, []);

  return (
    <html lang="en" className="h-full">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="h-full bg-gray-100">
        <LoaderProvider>
          <AlertContextProvider>
            <SocketProvider socket={socket}>
              <CloudinaryContext.Provider value={cloudinary}>
                <Alerts />
                <Header loggedIn={!!user} />
                <Outlet />
              </CloudinaryContext.Provider>
            </SocketProvider>
          </AlertContextProvider>
        </LoaderProvider>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}

export const ErrorBoundary = () => {
  const error = useRouteError();

  let content: ReactNode;
  if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
      content = (
        <div className="mt-32">
          <h1 className="text-center text-3xl">We couldnt find that page!</h1>
          <div className="justify-center flex mt-8">
            <ButtonLink to="/">Go Home</ButtonLink>
          </div>
        </div>
      );
    } else {
      content = (
        <div className="mt-32">
          <h1 className="text-center text-3xl">Something went wrong!</h1>
          <div className="justify-center flex mt-8">
            <ButtonLink to="/">Go Home</ButtonLink>
          </div>
        </div>
      );
    }
  } else {
    content = (
      <div className="mt-32">
        <h1 className="text-center text-3xl">Something went wrong!</h1>
        <div className="justify-center flex mt-8">
          <ButtonLink to="/">Go Home</ButtonLink>
        </div>
      </div>
    );
  }

  return (
    <html lang="en" className="h-full">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <Header />
        {content}
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
};
