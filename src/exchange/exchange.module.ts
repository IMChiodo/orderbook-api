import { Module } from '@nestjs/common';
import { ExchangeService } from './exchange.service';
import { HttpModule } from '@nestjs/axios';
import { ExchangeController } from './exchange.controller';
import { UrlService } from './services/url.service';
import { ResponseService } from './services/response.service';

@Module({
  imports: [HttpModule],
  providers: [ExchangeService, UrlService, ResponseService],
  controllers: [ExchangeController],
})
export class ExchangeModule {}
