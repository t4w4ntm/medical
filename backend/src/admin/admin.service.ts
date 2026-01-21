
import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Admin } from './entities/admin.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminService implements OnModuleInit {
    constructor(
        @InjectRepository(Admin)
        private adminRepository: Repository<Admin>,
    ) { }

    async onModuleInit() {
        const username = 'admin2';
        const hashedPassword = await bcrypt.hash('admin1234', 10);

        const admin = await this.adminRepository.findOne({ where: { username } });

        if (!admin) {
            await this.adminRepository.save({
                username,
                password: hashedPassword,
            });
            console.log('Default admin created: admin / admin1234');
        } else {
            // Force update password to hashed version (in case it was plain text)
            admin.password = hashedPassword;
            await this.adminRepository.save(admin);
            console.log('Default admin password updated to hashed version');
        }
    }

    async findOne(username: string): Promise<Admin | null> {
        return this.adminRepository.findOne({ where: { username } });
    }

    async create(createAdminDto: any): Promise<Admin> {
        const hashedPassword = await bcrypt.hash(createAdminDto.password, 10);
        const admin = this.adminRepository.create({
            username: createAdminDto.username,
            password: hashedPassword,
        });
        return this.adminRepository.save(admin);
    }

    async findAll(): Promise<Admin[]> {
        return this.adminRepository.find({
            select: ['id', 'username'] // Don't return password
        });
    }
}
