/* eslint-disable react-hooks/exhaustive-deps */
import { AdvancedImage, placeholder, responsive } from "@cloudinary/react";
import { CloudinaryImage } from "@cloudinary/url-gen";
import { Button, ButtonGroup } from "@material-tailwind/react";
import { LoaderFunctionArgs, json } from "@remix-run/node";
import { Link, useFetcher, useLoaderData } from "@remix-run/react";
import { useContext, useEffect, useState } from "react";

import BidModal from "~/components/BidModal";
import Card from "~/components/Card";
import { AlertContext } from "~/contexts/AlertContext";
import { CloudinaryContext } from "~/contexts/CloudinaryContext";
import { getAuctionItem } from "~/models/auction.server";
import { createBid } from "~/models/bid.server";
import { requireUser } from "~/session.server";
import { formatMoney, useOptionalUser } from "~/utils/utils";

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const id = params["auctionId"];
  if (id) {
    const auctionItem = await getAuctionItem(id);
    return json(auctionItem);
  }
  throw new Response("not found", { status: 404 });
};

export const action = async ({
  params,
  request,
  context,
}: LoaderFunctionArgs): Promise<{ success: boolean; message: string }> => {
  const user = await requireUser(request);

  const auction_item_id = params["auctionId"];
  if (auction_item_id) {
    const formData = await request.formData();
    const amount = Number(formData.get("amount"));
    if (isNaN(amount)) {
      throw new Response("invalid bid", { status: 400 });
    }

    let name;
    try {
      const res = await createBid({
        user_id: user.id,
        auction_item_id,
        amount,
      });
      name = res?.name;
    } catch (e) {
      return { success: false, message: String(e) };
    }

    context.IO.emit("newBid", {
      auctionItemId: auction_item_id,
      amount,
      itemName: name || undefined,
      userId: user.id,
    });

    return { success: true, message: "ok" };
  }
  throw new Response("not found", { status: 404 });
};

export default function AuctionPage() {
  const auctionItem = useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();
  const alerts = useContext(AlertContext);
  const cloudinary = useContext(CloudinaryContext);
  const user = useOptionalUser();

  const [currentBid, setCurrentBid] = useState(
    Number(auctionItem.max_bid || auctionItem.starting_bid),
  );
  const [highlight, setHighlight] = useState(false);

  const [photoUrl, setPhotoUrl] = useState<CloudinaryImage | null>(null);

  // const handleNewBid = ({
  //   amount,
  //   auctionItemId,
  // }: {
  //   amount: number;
  //   auctionItemId: string;
  // }) => {
  //   console.log("NEW BID!");
  //   if (auctionItemId === auctionItem.id) {
  //     setCurrentBid(amount);
  //     setTimeout(() => {
  //       setHighlight(true);
  //     }, 500);
  //     setTimeout(() => {
  //       setHighlight(false);
  //     }, 1200);
  //   }
  // };

  useEffect(() => {
    const url = auctionItem.photo_id
      ? cloudinary.image(auctionItem.photo_id)
      : null;

    setPhotoUrl(url);
  }, []);

  useEffect(() => {
    if (
      Number(auctionItem.max_bid || auctionItem.starting_bid) !== currentBid
    ) {
      setCurrentBid(Number(auctionItem.max_bid || auctionItem.starting_bid));
      setTimeout(() => {
        setHighlight(true);
      }, 500);
      setTimeout(() => {
        setHighlight(false);
      }, 1200);
    }
  }, [auctionItem]);

  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (fetcher.data?.success) {
      setOpen(false);
      alerts?.addAlert({
        message: "Your bid was successful!",
        color: "green",
      });
    } else if (fetcher.data && !fetcher.data.success && fetcher.data.message) {
      setOpen(false);
      alerts?.addAlert({
        message: `An error occurred while sending your bid: ${fetcher.data.message}`,
        color: "red",
      });
    }
  }, [fetcher.data]);

  const bid = Number(auctionItem.max_bid || auctionItem.starting_bid);
  const defaultIncrease = bid + (bid <= 10 ? 1 : 10);
  const [defaultVal, setDefaultVal] = useState(defaultIncrease);

  const toggleModalFunc = (increase?: number) => {
    return () => {
      setDefaultVal(increase ? bid + increase : defaultIncrease);
      toggleModal();
    };
  };

  const toggleModal = () => {
    setOpen(!open);
  };

  return (
    <div>
      <BidModal
        fetcher={fetcher}
        open={open}
        defaultValue={defaultVal}
        handler={toggleModal}
      >
        {""}
      </BidModal>
      <Link
        className="absolute top-34 left-4 text-gray-500 border-gray-500 rounded-[7px] hover:bg-gray-400 hover:text-white py-2 px-4 transition-colors duration-200"
        to="/auctions"
        prefetch="intent"
      >
        Back to Auctions
      </Link>
      <Card className="flex !w-[60vw] max-w-none relative">
        <div className="image-container w-5/12 max-h-[60vh] !justify-start min-h-64">
          {photoUrl ? (
            <AdvancedImage
              cldImg={photoUrl}
              plugins={[responsive(), placeholder()]}
            ></AdvancedImage>
          ) : null}
        </div>
        <div className="grow flex-col flex items-end">
          <h1 className="text-3xl font-bold mb-4 text-gray-800">
            {auctionItem.name}
          </h1>
          <p className="italic text-sm text-gray-500 mb-8">
            {auctionItem.description}
          </p>
          <p className="text-lg text-gray-700 flex justify-between w-2/3">
            <span className="font-bold mr-4">Estimated Value: </span>
            {formatMoney(auctionItem.estimated_value)}
          </p>
          <p className="text-lg text-gray-700 flex justify-between w-2/3">
            <span className="font-bold mr-4">Current Bid: </span>
            <span
              className={
                "transition-colors duration-200 " +
                (highlight
                  ? "text-white bg-green-400 px-2 py-1 relative -top-1 -right-2 rounded-[7px]"
                  : "")
              }
            >
              {formatMoney(currentBid)}
            </span>
          </p>
        </div>
        {user ? (
          <div>
            <div className="mt-20 absolute bottom-8 right-8">
              <h3 className="text-xl text-gray-600 mr-4">Increase Bid By:</h3>
              <ButtonGroup variant="gradient" color="red">
                <Button type="button" onClick={toggleModalFunc(1)}>
                  $1
                </Button>
                <Button type="button" onClick={toggleModalFunc(5)}>
                  $5
                </Button>
                <Button type="button" onClick={toggleModalFunc(10)}>
                  $10
                </Button>
                <Button type="button" onClick={toggleModalFunc()}>
                  Other
                </Button>
              </ButtonGroup>
            </div>
          </div>
        ) : (
          <h3 className="text-xl text-gray-600 font-bold absolute bottom-8 right-8">
            Please{" "}
            <Link to="/login" prefetch="intent" className="text-blue-500">
              sign in
            </Link>{" "}
            to bid on this item
          </h3>
        )}
      </Card>
    </div>
  );
}
