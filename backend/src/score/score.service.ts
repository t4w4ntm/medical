import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateScoreDto } from './dto/create-score.dto';
import { Score } from './entities/score.entity';

import { ScoreDetail } from './entities/score-detail.entity';

@Injectable()
export class ScoreService {
  constructor(
    @InjectRepository(Score)
    private scoreRepository: Repository<Score>,
    @InjectRepository(ScoreDetail)
    private scoreDetailRepository: Repository<ScoreDetail>,
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
  async getDashboardStats() {
    // 1. Overview
    // Calculate total participants by splitting comma-separated names
    // Formula: Sum(Length(name) - Length(Replace(name, ',', '')) + 1)
    const countResult = await this.scoreRepository.query(`
      SELECT SUM(LENGTH(player_name) - LENGTH(REPLACE(player_name, ',', '')) + 1) as total
      FROM game_sessions
    `);
    const totalParticipants = Number(countResult[0].total) || 0;

    const { avgTime } = await this.scoreRepository
      .createQueryBuilder('score')
      .select('AVG(score.time)', 'avgTime')
      .getRawOne();
    const { avgQuestionScore } = await this.scoreRepository
      .createQueryBuilder('score')
      .select('AVG(score.questionScore)', 'avgQuestionScore')
      .getRawOne();

    // 2. Performance Levels
    // Simple count is safer and faster unless we want one query.
    const excellent = await this.scoreRepository.count({ where: { totalScore: 801 /* MoreThan(800) equivalent or use query builder for range */ } });
    // Wait, let's use QueryBuilder for standardized ranges
    const levels = await this.scoreRepository
      .createQueryBuilder('score')
      .select(`SUM(CASE WHEN score.total_score >= 800 THEN 1 ELSE 0 END)`, 'excellent')
      .addSelect(`SUM(CASE WHEN score.total_score >= 500 AND score.total_score < 800 THEN 1 ELSE 0 END)`, 'average')
      .addSelect(`SUM(CASE WHEN score.total_score < 500 THEN 1 ELSE 0 END)`, 'needImprove')
      .getRawOne();

    // 3. Trend (Last 7 days)
    // Using MySQL syntax as per user environment likely.
    const trend = await this.scoreRepository.query(`
        SELECT DATE_FORMAT(created_at, '%Y-%m-%d') as date, AVG(total_score) as avgScore 
        FROM game_sessions 
        GROUP BY DATE_FORMAT(created_at, '%Y-%m-%d') 
        ORDER BY date ASC 
        LIMIT 7
    `);

    // 4. Question Analysis
    const questionAnalysis = await this.scoreDetailRepository.createQueryBuilder('detail')
      .select('detail.scenario', 'scenario')
      .addSelect('detail.questionText', 'question')
      .addSelect('SUM(CASE WHEN detail.isCorrect = 1 THEN 1 ELSE 0 END)', 'correct')
      .addSelect('SUM(CASE WHEN detail.isCorrect = 0 THEN 1 ELSE 0 END)', 'wrong')
      .where('detail.questionText IS NOT NULL')
      .groupBy('detail.scenario')
      .addGroupBy('detail.questionText')
      .getRawMany();

    return {
      overview: {
        totalParticipants,
        avgTime: Math.round(Number(avgTime) || 0),
        avgQuestionScore: Math.round(Number(avgQuestionScore) || 0)
      },
      performance: {
        excellent: Number(levels.excellent) || 0,
        average: Number(levels.average) || 0,
        needImprove: Number(levels.needImprove) || 0
      },
      trend,
      questionAnalysis
    };
  }
}