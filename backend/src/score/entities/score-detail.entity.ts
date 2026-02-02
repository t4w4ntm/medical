import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Score } from './score.entity';

@Entity({ name: 'choice_results' })
export class ScoreDetail {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'choice_id' })
    choiceId: string;

    @Column({ name: 'choice_text' })
    choiceText: string;

    @Column({ name: 'question_text', nullable: true })
    questionText: string;

    @Column({ name: 'scenario', nullable: true })
    scenario: string;

    @Column({ name: 'patient_index', nullable: true, default: 0 })
    patientIndex: number;

    @Column({ name: 'is_correct' })
    isCorrect: boolean;

    @Column({ name: 'was_clicked' })
    wasClicked: boolean;

    @Column({ name: 'attempt_no' })
    attemptNo: number;

    @ManyToOne(() => Score, (score) => score.details, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'session_id' })
    score: Score;
}