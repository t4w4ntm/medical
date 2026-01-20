
import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Admin } from './entities/admin.entity';

@Injectable()
export class AdminService implements OnModuleInit {
    constructor(
        @InjectRepository(Admin)
        private adminRepository: Repository<Admin>,
    ) { }

    async onModuleInit() {
        // Seed default admin if not exists
        const admin = await this.adminRepository.findOne({ where: { username: 'admin' } });
        if (!admin) {
            await this.adminRepository.save({
                username: 'admin',
                password: 'admin1234', // Default password
            });
            console.log('Default admin created: admin / admin1234');
        }
    }

    async findOne(username: string): Promise<Admin | null> {
        return this.adminRepository.findOne({ where: { username } });
    }
}
