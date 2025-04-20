import { Test, TestingModule } from '@nestjs/testing';
import { NotesService } from './notes.service';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { Note } from './note.entity';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';

describe('NotesService', () => {
  console.log('Suite started');
  let container: StartedPostgreSqlContainer;

  let service: NotesService;
  let repo: Repository<Note>;

  beforeAll(async () => {
    console.log('Initializing PostgreSQL container');
    try {
      container = await new PostgreSqlContainer()
        .withUsername('postgres')
        .withPassword('postgres')
        .withDatabase('test')
        .start();
      console.log('Container started successfully');
    } catch (error) {
      console.error('Error starting container:', error);
      throw error;
    }

    console.log('Connection details:', {
      host: container.getHost(),
      port: container.getPort(),
      username: container.getUsername(),
      password: container.getPassword(),
      database: container.getDatabase(),
    });
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: container.getHost(),
          port: container.getPort(),
          username: container.getUsername(),
          password: container.getPassword(),
          database: container.getDatabase(),
          entities: [Note],
          synchronize: true,
        }),
        TypeOrmModule.forFeature([Note]),
      ],
      providers: [NotesService],
    }).compile();

    service = module.get<NotesService>(NotesService);
    repo = module.get<Repository<Note>>(getRepositoryToken(Note));
  });

  afterEach(async () => await repo.clear());

  afterAll(async () => {
    await container.stop();
  });

  describe('findAll', () => {
    it('should return an array of notes', async () => {
      const note = await repo.save({
        title: 'Test Note',
        content: 'Some content',
      });

      const result = await service.findAll();
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].title).toBe(note.title);
      expect(result[0].content).toBe(note.content);
    });
  });

  describe('findOne', () => {
    it('should return a note by ID', async () => {
      const note = await repo.save({
        title: 'Test Note',
        content: 'Some content',
      });

      const result = await service.findOne(note.id);
      expect(result.id).toBe(note.id);
      expect(result.title).toBe(note.title);
      expect(result.content).toBe(note.content);
    });

    it('should throw NotFoundException if note is not found', async () => {
      await expect(service.findOne('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('should create and return a new note', async () => {
      const createDto = { title: 'Test Note', content: 'Some content' };

      const result = await service.create(createDto);
      expect(result.title).toBe(createDto.title);
      expect(result.content).toBe(createDto.content);

      const savedNote = await repo.findOne({ where: { id: result.id } });
      expect(savedNote).not.toBeNull();
      expect(savedNote!.title).toBe(createDto.title);
    });
  });

  describe('update', () => {
    it('should update and return the updated note', async () => {
      const note = await repo.save({
        title: 'Test Note',
        content: 'Some content',
      });

      const updateDto = { content: 'Updated content' };
      const updatedNote = await service.update(note.id, updateDto);

      expect(updatedNote.id).toBe(note.id);
      expect(updatedNote.content).toBe(updateDto.content);

      const savedNote = await repo.findOne({ where: { id: note.id } });
      expect(savedNote).not.toBeNull();
      expect(savedNote!.content).toBe(updateDto.content);
    });

    it('should throw NotFoundException if note does not exist', async () => {
      await expect(
        service.update('non-existent-id', { title: 'New title' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove and return success: true', async () => {
      const note = await repo.save({
        title: 'Test Note',
        content: 'Some content',
      });

      const result = await service.remove(note.id);
      expect(result.success).toBe(true);

      const deletedNote = await repo.findOne({ where: { id: note.id } });
      expect(deletedNote).toBeNull();
    });

    it('should throw NotFoundException if note is not found', async () => {
      await expect(service.remove('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
