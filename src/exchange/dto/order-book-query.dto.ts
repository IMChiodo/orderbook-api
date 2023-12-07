import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ExchangeEnum } from '../../common/enums/exchange.enum';

export class OrderBookQueryDto {
  @IsEnum(ExchangeEnum)
  @ApiProperty({ enum: ExchangeEnum })
  exchange: ExchangeEnum;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  base: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  quote: string;

  @IsNumber()
  @IsOptional()
  @ApiProperty()
  limit?: number;
}
