import { HttpService } from '@nestjs/axios';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import {
  BinanceResponse,
  BitmartResponse,
  FormattedResponse,
} from './interfaces/exchange.types';
import { OrderBookQueryDto } from './dto/order-book-query.dto';
import { ExchangeEnum } from '../common/enums/exchange.enum';
import {
  isBinanceResponse,
  isBitmartResponse,
} from './utils/exchange.type-guards';

@Injectable()
export class ExchangeService {
  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
  ) {}

  private readonly logger = new Logger(ExchangeService.name);

  async getOrderBook(params: OrderBookQueryDto): Promise<FormattedResponse> {
    const { exchange, base, quote, limit } = params;

    await this.validateCurrencyPair(exchange, base, quote);

    const url = this.constructUrl(exchange, base, quote, limit);
    this.logger.log(`Fetching order book for ${exchange}: ${base}/${quote}`);

    try {
      const response = await firstValueFrom(this.httpService.get(url));
      return this.formatResponse(exchange, response.data);
    } catch (error) {
      this.logger.error(
        `Error fetching order book for ${exchange}: ${error.message}`,
      );
      throw new InternalServerErrorException(
        `Failed to fetch order book: ${error.message}`,
      );
    }
  }

  private constructUrl(
    exchange: ExchangeEnum,
    base: string,
    quote: string,
    limit: number = 20,
  ): string {
    const apiUrl = this.configService.get<string>(exchange);

    if (!apiUrl) {
      throw new Error(`API URL for ${exchange} not found in configuration`);
    }

    if (exchange === ExchangeEnum.BINANCE) {
      return `${apiUrl}/api/v3/depth?symbol=${base}${quote}&limit=${limit}`;
    } else if (exchange === ExchangeEnum.BITMART) {
      return `${apiUrl}/spot/quotation/v3/books?symbol=${base}_${quote}&limit=${limit}`;
    } else {
      throw new Error('Unsupported exchange');
    }
  }

  private formatResponse(
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

  async getAvailableCurrencies(
    exchange: ExchangeEnum,
    limit?: number,
  ): Promise<string[]> {
    const currencies =
      exchange === ExchangeEnum.BINANCE
        ? await this.getAvailableCurrenciesFromBinance()
        : await this.getAvailableCurrenciesFromBitmart();

    const sortedCurrencies = currencies.sort();
    return limit ? sortedCurrencies.slice(0, limit) : sortedCurrencies;
  }

  async getAvailableCurrenciesFromBinance(): Promise<string[]> {
    const binanceApiUrl = this.configService.get<string>(ExchangeEnum.BINANCE);
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${binanceApiUrl}/api/v3/exchangeInfo`),
      );

      const currencyPairs = response.data.symbols.map(
        (symbol) => symbol.symbol,
      );
      return currencyPairs;
    } catch (error) {
      this.logger.error('Failed to fetch currencies from Binance', error);
      throw new InternalServerErrorException(
        'Unable to fetch currencies from Binance',
      );
    }
  }

  async getAvailableCurrenciesFromBitmart(): Promise<string[]> {
    const bitmartApiUrl = this.configService.get<string>(ExchangeEnum.BITMART);
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${bitmartApiUrl}/spot/v1/symbols/details`),
      );

      const currencyPairs = response.data.data.symbols.map(
        (symbol) => symbol.symbol,
      );

      return currencyPairs;
    } catch (error) {
      this.logger.error('Failed to fetch currencies from Bitmart', error);
      throw new InternalServerErrorException(
        'Unable to fetch currencies from Bitmart',
      );
    }
  }

  async validateCurrencyPair(
    exchange: ExchangeEnum,
    base: string,
    quote: string,
  ): Promise<void> {
    const availableCurrencies = await this.getAvailableCurrencies(exchange);
    const currencySet = new Set(availableCurrencies);

    const pair =
      exchange === ExchangeEnum.BINANCE
        ? `${base}${quote}`
        : `${base}_${quote}`;

    if (!currencySet.has(pair)) {
      throw new BadRequestException('Invalid currency pair');
    }
  }
}
