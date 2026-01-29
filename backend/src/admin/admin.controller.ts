import { Controller, Get, Post, Body, Param, Delete, UseGuards } from '@nestjs/common';
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

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.adminService.remove(+id);
    }

    @Post(':id/password')
    changePassword(@Param('id') id: string, @Body() body: any) {
        const { password } = body;
        return this.adminService.changePassword(+id, password);
    }
}
