import { Injectable } from '@nestjs/common';
import {
  BinanceResponse,
  BitmartResponse,
  FormattedResponse,
} from '../interfaces/exchange.types';
import { ExchangeEnum } from '../../common/enums/exchange.enum';
import {
  isBinanceResponse,
  isBitmartResponse,
} from '../utils/exchange.type-guards';

@Injectable()
export class ResponseService {
  public formatResponse(
    exchange: ExchangeEnum,
    data: BinanceResponse | BitmartResponse,
  ): FormattedResponse {
    const formattedResponse: FormattedResponse = {
      timestamp: new Date().toISOString(),
      bids: [],
      asks: [],
    };

    switch (exchange) {
      case ExchangeEnum.BINANCE:
        if (isBinanceResponse(data)) {
          formattedResponse.bids = data.bids;
          formattedResponse.asks = data.asks;
        }
        break;

      case ExchangeEnum.BITMART:
        if (isBitmartResponse(data)) {
          formattedResponse.timestamp = new Date(
            parseInt(data.data.ts),
          ).toISOString();
          formattedResponse.bids = data.data.bids;
          formattedResponse.asks = data.data.asks;
        }
        break;

      default:
        throw new Error('Invalid exchange type in formatResponse');
    }

    return formattedResponse;
  }
}
