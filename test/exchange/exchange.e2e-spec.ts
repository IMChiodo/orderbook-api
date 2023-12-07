import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { HttpService, HttpModule } from '@nestjs/axios';
import * as request from 'supertest';
import { ExchangeModule } from '../../src/exchange/exchange.module';
import { of } from 'rxjs';
import { AxiosResponse, AxiosHeaders } from 'axios';

describe('ExchangeController (e2e)', () => {
  let app: INestApplication;
  let httpService: HttpService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ExchangeModule, HttpModule], // Ensure that HttpModule is imported
    })
      .overrideProvider(HttpService) // Override the HttpService
      .useValue({
        get: jest.fn().mockImplementation(() =>
          of({
            data: {}, // Mock response data
            status: 200,
            statusText: 'OK',
            headers: {},
            config: { url: '', method: 'GET', headers: {} },
          }),
        ),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    httpService = app.get<HttpService>(HttpService);
  });

  afterEach(async () => {
    await app.close();
  });

  const mockAxiosResponse = (data: any): AxiosResponse => ({
    data,
    status: 200,
    statusText: 'OK',
    headers: {},
    config: {
      method: 'get',
      url: 'http://test-url',
      headers: {} as AxiosHeaders,
    },
  });

  it('/exchange/orderbook (GET) for Binance success', async () => {
    jest.spyOn(httpService, 'get').mockImplementation(() =>
      of(
        mockAxiosResponse({
          lastUpdateId: 123456,
          bids: [['5000.00', '1.5']],
          asks: [['6000.00', '2.0']],
        }),
      ),
    );

    await request(app.getHttpServer())
      .get('/exchange/orderbook?exchange=BINANCE&base=BTC&quote=USDT')
      .expect(200)
      .expect((res) => {
        expect(res.body.bids.length).toBeGreaterThan(0);
        expect(res.body.asks.length).toBeGreaterThan(0);
      });
  });

  it('/exchange/orderbook (GET) for Bitmart success', async () => {
    jest.spyOn(httpService, 'get').mockImplementation(() =>
      of(
        mockAxiosResponse({
          code: 1000,
          data: {
            ts: '123456789',
            bids: [['4000.00', '1.0']],
            asks: [['7000.00', '1.2']],
          },
        }),
      ),
    );

    await request(app.getHttpServer())
      .get('/exchange/orderbook?exchange=BITMART&base=BTC&quote=USDT')
      .expect(200)
      .expect((res) => {
        expect(res.body.bids.length).toBeGreaterThan(0);
        expect(res.body.asks.length).toBeGreaterThan(0);
      });
  });
});
