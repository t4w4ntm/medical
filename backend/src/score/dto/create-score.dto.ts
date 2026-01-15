export class CreateScoreDto {
    name: string;           // ชื่อที่ผู้ใช้ตั้ง
    time: number;           // เวลาที่ใช้ (วินาที)
    timeScore: number;      // คะแนนจากเวลา
    questionScore: number;  // คะแนนจากการตอบคำถาม
    totalScore: number;     // คะแนนรวม (timeScore + questionScore)
}