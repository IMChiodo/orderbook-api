import { BinanceResponse, BitmartResponse } from '../interfaces/exchange.types';

export function isBinanceResponse(data: any): data is BinanceResponse {
  return (data as BinanceResponse).lastUpdateId !== undefined;
}

export function isBitmartResponse(data: any): data is BitmartResponse {
  return (data as BitmartResponse).code !== undefined;
}
