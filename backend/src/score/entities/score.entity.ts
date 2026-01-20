import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { ScoreDetail } from './score-detail.entity';

@Entity({ name: 'game_sessions' })
export class Score {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'player_name' })
  name: string;

  @Column({ name: 'play_time' })
  time: number; // เวลาที่ใช้ (วินาที)

  @Column({ name: 'time_score' })
  timeScore: number; // คะแนนจากเวลา

  @Column({ name: 'question_score' })
  questionScore: number; // คะแนนจากการตอบคำถาม

  @Column({ name: 'total_score' })
  totalScore: number; // คะแนนรวม (timeScore + questionScore)

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @OneToMany(() => ScoreDetail, (detail) => detail.score, { cascade: true })
  details: ScoreDetail[];
}