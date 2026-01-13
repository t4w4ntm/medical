import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class Score {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;  // 👈 แก้จุดที่ 1: เปลี่ยนจาก playerName เป็น name (เพื่อให้ตรงกับ Frontend)

  @Column()
  score: number;

  @Column({ nullable: true })
  bedId: number; // 👈 แก้จุดที่ 2: เติม { nullable: true } (แปลว่าถ้าไม่มีค่านี้ส่งมา ก็ไม่ error)

  @CreateDateColumn()
  createdAt: Date;
}