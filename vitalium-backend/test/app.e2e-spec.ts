import type { INestApplication } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/modules/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/health (GET)', () => {
    return request(app.getHttpServer())
      .get('/health')
      .expect(200)
      .expect((res) => {
        expect(['healthy', 'error']).toContain(res.body.status);
        expect(res.body.timestamp).toBeDefined();
        expect(res.body.version).toBeDefined();
        expect(res.body.environment).toBeDefined();
        expect(res.body.uptime).toBeDefined();
        expect(res.body.nodeVersion).toBeDefined();
        expect(res.body.message).toBeDefined();
      });
  });
});
