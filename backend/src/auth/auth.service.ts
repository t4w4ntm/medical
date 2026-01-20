
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AdminService } from '../admin/admin.service';

@Injectable()
export class AuthService {
    constructor(private adminService: AdminService) { }

    async validateUser(username: string, pass: string): Promise<any> {
        const user = await this.adminService.findOne(username);
        if (user && user.password === pass) {
            const { password, ...result } = user;
            return result;
        }
        return null;
    }

    async login(user: any) {
        // In a real app, we would return a JWT token here.
        // For this simple request, we just return success and basic info.
        return {
            message: 'Login successful',
            user: {
                id: user.id,
                username: user.username,
            },
        };
    }
}
