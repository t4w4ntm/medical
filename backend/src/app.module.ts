import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config'; // เพิ่มบรรทัดนี้
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScoreModule } from './score/score.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    // 1. เพิ่ม ConfigModule ให้มันอ่านไฟล์ .env ได้
    ConfigModule.forRoot(), 
    
    // 2. แก้ TypeOrmModule ให้ดึงค่าจาก env
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DATABASE_HOST || 'localhost',
      port: parseInt(process.env.DATABASE_PORT || '3306'),
      username: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASS,
      database: process.env.DATABASE_NAME,
      entities: [],
      synchronize: true,
      autoLoadEntities: true,
    }),
    ScoreModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}