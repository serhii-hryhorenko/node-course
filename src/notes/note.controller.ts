import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { NotesService } from './note.service';
import { ICreateNoteDto, IUpdateNoteDto } from './note.dto';

@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Get()
  async findAll() {
    const items = await this.notesService.findAll();
    return { items };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.notesService.findOne(id);
  }

  @Post()
  create(@Body() dto: ICreateNoteDto) {
    return this.notesService.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: IUpdateNoteDto) {
    return this.notesService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.notesService.remove(id);
  }
}
