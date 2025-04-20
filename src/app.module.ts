import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotesModule } from './notes/notes.module';
import { Note } from './notes/note.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'notes.sqlite',
      entities: [Note],
      synchronize: true,
    }),
    NotesModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
