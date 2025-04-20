import { Test, TestingModule } from '@nestjs/testing';
import { NotesService } from './notes.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Note } from './note.entity';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

const mockNote = {
  id: 'uuid-id',
  title: 'Test Note',
  content: 'Some content',
};

describe('NotesService', () => {
  let service: NotesService;
  let repo: Repository<Note>;

  const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotesService,
        {
          provide: getRepositoryToken(Note),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<NotesService>(NotesService);
    repo = module.get<Repository<Note>>(getRepositoryToken(Note));
  });

  afterEach(() => jest.clearAllMocks());

  describe('findAll', () => {
    it('should return an array of notes', async () => {
      mockRepository.find.mockResolvedValue([mockNote]);
      const result = await service.findAll();
      expect(result).toEqual([mockNote]);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(repo.find).toHaveBeenCalledTimes(1);
    });
  });

  describe('findOne', () => {
    it('should return a note by ID', async () => {
      mockRepository.findOne.mockResolvedValue(mockNote);
      const result = await service.findOne('uuid-123');
      expect(result).toEqual(mockNote);
    });

    it('should throw NotFoundException if not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      await expect(service.findOne('missing-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('should create and return a new note', async () => {
      mockRepository.create.mockReturnValue(mockNote);
      mockRepository.save.mockResolvedValue(mockNote);
      const result = await service.create({
        title: 'Test Note',
        content: 'Some content',
      });
      expect(result).toEqual(mockNote);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(repo.create).toHaveBeenCalledWith({
        title: 'Test Note',
        content: 'Some content',
      });
    });
  });

  describe('update', () => {
    it('should update and return the updated note', async () => {
      const updated = { ...mockNote, content: 'Updated content' };
      mockRepository.findOne.mockResolvedValue(mockNote);
      mockRepository.save.mockResolvedValue(updated);

      const result = await service.update('uuid-123', {
        content: 'Updated content',
      });
      expect(result).toEqual(updated);
    });

    it('should throw NotFoundException if note does not exist', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      await expect(
        service.update('missing-id', { title: 'Nope' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove and return success: true', async () => {
      mockRepository.findOne.mockResolvedValue(mockNote);
      mockRepository.remove.mockResolvedValue(mockNote);
      const result = await service.remove('uuid-123');
      expect(result).toEqual({ success: true });
    });

    it('should throw NotFoundException if note not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      await expect(service.remove('bad-id')).rejects.toThrow(NotFoundException);
    });
  });
});
