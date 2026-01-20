
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'admins' })
export class Admin {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    username: string;

    @Column()
    password: string; // Plain text or hashed (will use plain for simplicity as requested/implied speed, but structured to support hash later)
}
