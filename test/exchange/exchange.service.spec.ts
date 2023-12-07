import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { ExchangeService } from '../../src/exchange/exchange.service';
import { ExchangeEnum } from '../../src/common/enums/exchange.enum';
import { of, throwError } from 'rxjs';
import { HttpException, HttpStatus } from '@nestjs/common';
import { AxiosResponse, AxiosHeaders } from 'axios';

describe('ExchangeService', () => {
  let service: ExchangeService;
  let httpService: HttpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExchangeService,
        {
          provide: HttpService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockImplementation((key) => `http://test/${key}`),
          },
        },
      ],
    }).compile();

    service = module.get<ExchangeService>(ExchangeService);
    httpService = module.get<HttpService>(HttpService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should fetch order book for Binance successfully', async () => {
    const mockBinanceResponse: AxiosResponse<any> = {
      data: {
        lastUpdateId: 1,
        bids: [['5000.00', '1.5']],
        asks: [['6000.00', '2.0']],
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {
        url: 'http://mock-url',
        method: 'get',
        headers: {} as AxiosHeaders,
        // Include other required fields with dummy data or empty placeholders
      },
    };

    jest.spyOn(httpService, 'get').mockReturnValueOnce(of(mockBinanceResponse));

    const result = await service.getOrderBook({
      exchange: ExchangeEnum.BITMART,
      base: 'BTC',
      quote: 'USDT',
    });

    expect(result.bids).toEqual(mockBinanceResponse.data.data.bids);
    expect(result.asks).toEqual(mockBinanceResponse.data.data.asks);
  });

  it('should fetch order book for Bitmart successfully', async () => {
    const mockBitmartResponse: AxiosResponse = {
      data: {
        code: 1000,
        data: {
          ts: '123456789',
          bids: [['4000.00', '1.0']],
          asks: [['7000.00', '1.2']],
        },
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {
        url: 'http://mock-url',
        method: 'get',
        headers: {} as AxiosHeaders,
        // Include other required fields with dummy data or empty placeholders
      },
    };

    jest.spyOn(httpService, 'get').mockReturnValueOnce(of(mockBitmartResponse));

    const result = await service.getOrderBook({
      exchange: ExchangeEnum.BITMART,
      base: 'BTC',
      quote: 'USDT',
    });

    expect(result.bids).toEqual(mockBitmartResponse.data.data.bids);
    expect(result.asks).toEqual(mockBitmartResponse.data.data.asks);
  });

  it('should handle HTTP errors', async (done) => {
    const error = new HttpException('API Error', HttpStatus.BAD_REQUEST);
    jest.spyOn(httpService, 'get').mockReturnValueOnce(throwError(() => error));

    try {
      await service.getOrderBook({
        exchange: ExchangeEnum.BINANCE,
        base: 'BTC',
        quote: 'USDT',
      });
      done.fail('Expected method to throw');
    } catch (e) {
      expect(e.response.message).toEqual('API Request Failed: API Error');
      done();
    }
  });

  it('should throw an error for unsupported exchanges', () => {
    expect(() => {
      service.getOrderBook({
        exchange: undefined,
        base: 'BTC',
        quote: 'USDT',
      });
    }).toThrow('Unsupported exchange');
  });

  it('should format the response correctly for Binance', async () => {
    const mockBinanceResponse: AxiosResponse<any> = {
      data: {
        lastUpdateId: 1,
        bids: [['5000.00', '1.5']],
        asks: [['6000.00', '2.0']],
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {
        url: 'http://mock-url',
        method: 'get',
        headers: {} as AxiosHeaders,
        // Include other required fields with dummy data or empty placeholders
      },
    };

    jest.spyOn(httpService, 'get').mockReturnValueOnce(of(mockBinanceResponse));

    const result = await service.getOrderBook({
      exchange: ExchangeEnum.BINANCE,
      base: 'BTC',
      quote: 'USDT',
    });

    expect(result.bids).toEqual(mockBinanceResponse.data.bids);
    expect(result.asks).toEqual(mockBinanceResponse.data.asks);
  });

  it('should handle HTTP errors from external API', async (done) => {
    const errorResponse = new HttpException(
      'API Error',
      HttpStatus.BAD_REQUEST,
    );
    jest
      .spyOn(httpService, 'get')
      .mockReturnValueOnce(throwError(() => errorResponse));

    try {
      await service.getOrderBook({
        exchange: ExchangeEnum.BINANCE,
        base: 'BTC',
        quote: 'USDT',
      });
      done.fail('Expected method to throw');
    } catch (e) {
      expect(e.response.message).toContain('API Request Failed');
      done();
    }
  });
});
