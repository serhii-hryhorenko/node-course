import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Note } from './note.entity';
import { ICreateNoteDto, IUpdateNoteDto } from './note.dto';

@Injectable()
export class NotesService {
  constructor(
    @InjectRepository(Note)
    private noteRepo: Repository<Note>,
  ) {}

  findAll() {
    return this.noteRepo.find();
  }

  async findOne(id: string) {
    const note = await this.noteRepo.findOne({ where: { id } });
    if (!note) throw new NotFoundException();
    return note;
  }

  create(dto: ICreateNoteDto) {
    const note = this.noteRepo.create(dto);
    return this.noteRepo.save(note);
  }

  async update(id: string, dto: IUpdateNoteDto) {
    const note = await this.findOne(id);
    Object.assign(note, dto);
    return this.noteRepo.save(note);
  }

  async remove(id: string) {
    const note = await this.findOne(id);
    await this.noteRepo.remove(note);
    return { success: true };
  }
}
