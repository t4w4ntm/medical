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
  async findAll(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [data, total] = await this.scoreRepository.findAndCount({
      order: {
        totalScore: 'DESC', // เรียงคะแนนรวมมากสุดขึ้นก่อน (Leaderboard)
      },
      skip: skip,
      take: limit,
    });

    return {
      data,
      total,
      page,
      limit,
    };
  }

  // (ส่วนอื่นที่ไม่ได้ใช้ ลบออกหรือปล่อยไว้ก็ได้ครับ)
  // ฟังก์ชันดึงคะแนนรายบุคคล พร้อมรายละเอียด
  findOne(id: number) {
    return this.scoreRepository.findOne({
      where: { id },
      relations: ['details'], // join ตาราง choice_results ออกมาด้วย
    });
  }
  update(id: number, updateScoreDto: any) { return `This action updates a #${id} score`; }
  async remove(id: number) {
    const score = await this.scoreRepository.findOne({
      where: { id },
      relations: ['details']
    });

    if (score) {
      return this.scoreRepository.remove(score);
    }
  }

  async removeBulk(ids: number[], deleteAll: boolean = false) {
    if (deleteAll) {
      // Delete All logic: Truncate or delete all
      // Using delete({}) to trigger cascade if configured, or just clear table
      // To ensure relations are handled, we might need to find all. 
      // But for performance, if we have many records, DELETE FROM is better.
      // Since specific requirement is "delete all", we can use .clear() or .delete({})
      // But we must respect relations.
      const scores = await this.scoreRepository.find({ relations: ['details'] });
      // This is slow if many records. But safe for cascades.
      return this.scoreRepository.remove(scores);
    } else {
      if (!ids || ids.length === 0) return;
      const scores = await this.scoreRepository
        .createQueryBuilder("score")
        .leftJoinAndSelect("score.details", "details")
        .where("score.id IN (:...ids)", { ids })
        .getMany();

      return this.scoreRepository.remove(scores);
    }
  }
}