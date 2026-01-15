import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateScoreDto } from './dto/create-score.dto';
import { Score } from './entities/score.entity';

@Injectable()
export class ScoreService {
  constructor(
    @InjectRepository(Score)
    private scoreRepository: Repository<Score>,
  ) { }

  // ฟังก์ชันบันทึกคะแนน
  create(createScoreDto: CreateScoreDto) {
    return this.scoreRepository.save(createScoreDto);
  }

  // ฟังก์ชันดึงคะแนนทั้งหมด (เรียงจากมากไปน้อย)
  findAll() {
    return this.scoreRepository.find({
      order: {
        totalScore: 'DESC', // เรียงคะแนนรวมมากสุดขึ้นก่อน (Leaderboard)
      },
      take: 10, // (Optional) ดึงแค่ 10 อันดับแรก
    });
  }

  // (ส่วนอื่นที่ไม่ได้ใช้ ลบออกหรือปล่อยไว้ก็ได้ครับ)
  findOne(id: number) { return `This action returns a #${id} score`; }
  update(id: number, updateScoreDto: any) { return `This action updates a #${id} score`; }
  remove(id: number) { return `This action removes a #${id} score`; }
}