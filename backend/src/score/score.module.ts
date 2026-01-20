import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm'; // เพิ่มบรรทัดนี้
import { ScoreService } from './score.service';
import { ScoreController } from './score.controller';
import { Score } from './entities/score.entity';
import { ScoreDetail } from './entities/score-detail.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Score, ScoreDetail])], // เพิ่ม ScoreDetail เข้าไป
  controllers: [ScoreController],
  providers: [ScoreService],
})
export class ScoreModule { }