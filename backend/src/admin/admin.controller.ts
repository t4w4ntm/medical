import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';

@Controller('admin')
export class AdminController {
    constructor(private readonly adminService: AdminService) { }

    @Post()
    create(@Body() createAdminDto: any) {
        return this.adminService.create(createAdminDto);
    }

    @Get()
    findAll() {
        return this.adminService.findAll();
    }
}
