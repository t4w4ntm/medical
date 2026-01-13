import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm'; // เพิ่มบรรทัดนี้
import { ScoreService } from './score.service';
import { ScoreController } from './score.controller';
import { Score } from './entities/score.entity'; // เพิ่มบรรทัดนี้

@Module({
  imports: [TypeOrmModule.forFeature([Score])], // เพิ่มบรรทัดนี้ (สำคัญมาก!)
  controllers: [ScoreController],
  providers: [ScoreService],
})
export class ScoreModule {}