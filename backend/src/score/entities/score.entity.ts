import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity() // บอกว่าเป็นตารางใน Database
export class Score {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  playerName: string; // ชื่อคนเล่น

  @Column()
  score: number;      // คะแนนที่ได้

  @Column()
  bedId: number;      // เตียงไหน (0=ซ้าย, 1=ขวา)

  @CreateDateColumn()
  createdAt: Date;    // วันเวลาที่บันทึก (ระบบลงให้เอง)
}