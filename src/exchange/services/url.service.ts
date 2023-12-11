import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ExchangeEnum } from '../../common/enums/exchange.enum';

@Injectable()
export class UrlService {
  constructor(private configService: ConfigService) {}

  public constructUrl(
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
}
