import { HttpService } from '@nestjs/axios';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { FormattedResponse } from './interfaces/exchange.types';
import { OrderBookQueryDto } from './dto/order-book-query.dto';
import { ExchangeEnum } from '../common/enums/exchange.enum';
import { UrlService } from './services/url.service';
import { ResponseService } from './services/response.service';

@Injectable()
export class ExchangeService {
  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
    private urlService: UrlService,
    private responseService: ResponseService,
  ) {}

  private readonly logger = new Logger(ExchangeService.name);

  async getOrderBook(params: OrderBookQueryDto): Promise<FormattedResponse> {
    const { exchange, base, quote, limit } = params;

    await this.validateCurrencyPair(exchange, base, quote);

    const url = this.urlService.constructUrl(exchange, base, quote, limit);
    this.logger.log(`Fetching order book for ${exchange}: ${base}/${quote}`);

    try {
      const response = await firstValueFrom(this.httpService.get(url));
      return this.responseService.formatResponse(exchange, response.data);
    } catch (error) {
      this.logger.error(
        `Error fetching order book for ${exchange}: ${error.message}`,
      );
      throw new InternalServerErrorException(
        `Failed to fetch order book: ${error.message}`,
      );
    }
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
