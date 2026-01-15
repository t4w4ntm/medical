import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class Score {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true }) // อนุญาตให้เป็นค่าว่างได้ (กันเหนียว)
  time: string;

  @Column({ type: 'int', default: 0 })
  timeScore: number;

  @Column({ type: 'int', default: 0 })
  questionScore: number;

  @Column({ type: 'int', default: 0 })
  totalScore: number; // 👈 ตัวนี้สำคัญ! ต้องมีให้ตรงกับ DB

  @CreateDateColumn()
  createdAt: Date;
}