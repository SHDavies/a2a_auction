import { Server } from "socket.io";

import { C2SEvents, S2CEvents, SocketData } from "./models/socket";
import { getUserWatches, setWatch, unwatch } from "./models/watches.server";

export const IO = new Server<C2SEvents, S2CEvents, never, SocketData>();

export type IO = Server<C2SEvents, S2CEvents, never, SocketData>;

export interface LoaderContext {
  IO: IO;
}

export function sendBid(bid: {
  auctionItemId: string;
  amount: number;
  itemName?: string;
  userId?: string;
}) {
  console.log("NEW BID");
  console.log(IO.sockets.adapter.rooms);
  IO.to(bid.auctionItemId).emit("newBid", bid);
}

IO.on("connection", async (socket) => {
  console.log(socket.id, "connected");

  socket.emit("confirmation");

  socket.onAny((e, ...args) => {
    console.log(e, args);
  });
  socket.onAnyOutgoing((e, ...args) => {
    console.log(e, args);
  });

  socket.on("init", async (userId) => {
    console.log("user init:", userId);
    socket.data.userId = userId;
    const userWatches = await getUserWatches(userId);
    console.log("watches:", userId, userWatches);
    for (const w of userWatches) {
      console.log(w);
      await socket.join(w.auction_item_id);
      console.log("joined", w.auction_item_id);
      console.log(IO.sockets.adapter.rooms);
    }
    // userWatches.forEach((w) => {
    //   console.log(w);
    //   socket.join(w.auction_item_id);
    // });
  });

  socket.on("joinRoom", async (auctionItemId, cb) => {
    socket.join(auctionItemId);
    if (socket.data.userId) {
      console.log("user join:", socket.data.userId, auctionItemId);
      try {
        await setWatch({
          auction_item_id: auctionItemId,
          user_id: socket.data.userId,
        });
      } catch (e) {
        console.error(e);
        cb({ success: false, message: `joinRoom failed: ${e}` });
        return;
      }
      cb({ success: true, message: "ok" });
    }
  });

  socket.on("leaveRoom", async (auctionItemId, cb) => {
    if (socket.data.userId) {
      try {
        await unwatch({
          auction_item_id: auctionItemId,
          user_id: socket.data.userId,
        });
      } catch (e) {
        console.error(e);
        cb({ success: false, message: `leaveRoom failed: ${e}` });
      }
      cb({ success: true, message: "ok" });
    }
  });
});
