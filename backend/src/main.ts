import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors(); 
  // แก้ตรงนี้ครับ 👇
  await app.listen(process.env.PORT || 3000, '0.0.0.0'); 
  // เพิ่ม '0.0.0.0' เพื่อให้ชัวร์ว่า Railway มองเห็นครับ
}
bootstrap();
