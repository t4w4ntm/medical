export class CreateScoreDetailDto {
    choiceId: string;
    choiceText: string;
    questionText?: string; // Optional for compatibility
    isCorrect: boolean;
    wasClicked: boolean;
    attemptNo: number;
}

export class CreateScoreDto {
    name: string;           // ชื่อที่ผู้ใช้ตั้ง
    time: number;           // เวลาที่ใช้ (วินาที)
    timeScore: number;      // คะแนนจากเวลา
    questionScore: number;  // คะแนนจากการตอบคำถาม
    totalScore: number;     // คะแนนรวม (timeScore + questionScore)
    details: CreateScoreDetailDto[]; // รายละเอียดการตอบคำถาม
}