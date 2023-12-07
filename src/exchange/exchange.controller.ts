import { Controller, Get, Query, UseFilters } from '@nestjs/common';
import { ExchangeService } from './exchange.service';
import { HttpExceptionFilter } from '../common/filters/http-exception.filter';
import { OrderBookQueryDto } from './dto/order-book-query.dto';
import { ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ExchangeEnum } from '../common/enums/exchange.enum';

@ApiTags('Exchange')
@Controller('exchange')
@UseFilters(HttpExceptionFilter)
export class ExchangeController {
  constructor(private readonly exchangeService: ExchangeService) {}

  @Get('/orderbook')
  @ApiResponse({ status: 200, description: 'Fetch order book' })
  @ApiResponse({ status: 400, description: 'Invalid base or quote currency' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiQuery({ name: 'exchange', enum: ExchangeEnum })
  @ApiQuery({ name: 'base', type: String })
  @ApiQuery({ name: 'quote', type: String })
  async getOrderBook(@Query() query: OrderBookQueryDto) {
    return this.exchangeService.getOrderBook(query);
  }

  @Get('/available-currencies')
  @ApiQuery({ name: 'exchange', enum: ExchangeEnum })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  @ApiResponse({ status: 200, description: 'Get available currency pairs' })
  @ApiResponse({ status: 400, description: 'Invalid exchange' })
  async getAvailableCurrencies(
    @Query('exchange') exchange: ExchangeEnum,
    @Query('limit') limit?: number,
  ) {
    return this.exchangeService.getAvailableCurrencies(exchange, limit);
  }
}
