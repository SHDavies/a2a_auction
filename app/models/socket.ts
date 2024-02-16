export interface SocketResponse {
  success: boolean;
  message: string;
}

export interface S2CEvents {
  confirmation: () => void;
  newBid: (data: {
    auctionItemId: string;
    amount: number;
    itemName?: string;
    userId?: string;
  }) => void;
}

export interface C2SEvents {
  init: (userId: string) => void;
  joinRoom: (auctionItemId: string, cb: (res: SocketResponse) => void) => void;
  leaveRoom: (auctionItemId: string, cb: (res: SocketResponse) => void) => void;
}

export interface SocketData {
  userId?: string;
}
