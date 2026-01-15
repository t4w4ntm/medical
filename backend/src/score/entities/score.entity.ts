import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class Score {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  time: number; // เวลาที่ใช้ (วินาที)

  @Column()
  timeScore: number; // คะแนนจากเวลา

  @Column()
  questionScore: number; // คะแนนจากการตอบคำถาม

  @Column()
  totalScore: number; // คะแนนรวม (timeScore + questionScore)

  @CreateDateColumn()
  createdAt: Date;
}