export interface PriceQuantityPair {
  price: string;
  quantity: string;
}

export interface BinanceResponse {
  lastUpdateId: number;
  bids: Array<PriceQuantityPair>;
  asks: Array<PriceQuantityPair>;
}

export interface BitmartResponse {
  code: number;
  trace: string;
  message: string;
  data: {
    ts: string;
    symbol: string;
    asks: Array<PriceQuantityPair>;
    bids: Array<PriceQuantityPair>;
  };
}

export interface FormattedResponse {
  timestamp: string;
  bids: Array<PriceQuantityPair>;
  asks: Array<PriceQuantityPair>;
}
