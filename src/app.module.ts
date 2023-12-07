import { Module } from '@nestjs/common';
import { ExchangeModule } from './exchange/exchange.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ExchangeModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
})
export class AppModule {}
