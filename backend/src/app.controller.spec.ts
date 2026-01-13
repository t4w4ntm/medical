import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',        // เชื่อมไปที่ localhost เพราะ Docker map port ออกมาให้แล้ว
      port: 3306,
      username: 'tawan_user',   // ตามที่เราตั้งใน docker-compose
      password: 'tawan_password',
      database: 'tawan_db',
      entities: [],
      synchronize: true,        // True = แก้โค้ดแล้วแก้ DB ตามอัตโนมัติ (ใช้เฉพาะตอน Dev)
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }