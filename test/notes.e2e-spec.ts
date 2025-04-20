/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Notes API (e2e)', () => {
  let app: INestApplication;
  let createdId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
  });

  it('POST /notes', async () => {
    const res = await request(app.getHttpServer())
      .post('/notes')
      .send({ title: 'Test Note', content: 'Hello!' })
      .expect(201);
    expect(res.body.title).toBe('Test Note');
    createdId = res.body.id as string;
  });

  it('GET /notes', async () => {
    const res = await request(app.getHttpServer()).get('/notes').expect(200);
    expect(res.body.items).toBeInstanceOf(Array);
  });

  it('GET /notes/:id', async () => {
    const res = await request(app.getHttpServer())
      .get(`/notes/${createdId}`)
      .expect(200);
    expect(res.body.id).toBe(createdId);
  });

  it('PUT /notes/:id', async () => {
    const res = await request(app.getHttpServer())
      .put(`/notes/${createdId}`)
      .send({ content: 'Updated content' })
      .expect(200);
    expect(res.body.content).toBe('Updated content');
  });

  it('DELETE /notes/:id', async () => {
    await request(app.getHttpServer())
      .delete(`/notes/${createdId}`)
      .expect(200);
  });

  it('GET /notes/:id → 404', async () => {
    await request(app.getHttpServer()).get(`/notes/${createdId}`).expect(404);
  });

  afterAll(async () => {
    await app.close();
  });
});
