import { Module } from '@nestjs/common';
import { ExchangeService } from './exchange.service';
import { HttpModule } from '@nestjs/axios';
import { ExchangeController } from './exchange.controller';

@Module({
  imports: [HttpModule],
  providers: [ExchangeService],
  controllers: [ExchangeController],
})
export class ExchangeModule {}
