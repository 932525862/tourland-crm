import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { TaskStatus } from '@prisma/client';
import { PrismaService } from '@/prisma/prisma.module';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { CurrentUser, AuthUser } from '@/common/decorators/current-user.decorator';
import { RealtimeGateway } from '../realtime/realtime.gateway';

class CreateTaskDto {
  @IsString() @IsNotEmpty() @MaxLength(200) title!: string;
  @IsString() @MaxLength(4000) description!: string;
  @IsString() @IsNotEmpty() employeeId!: string;
}

class UpdateTaskDto {
  @IsOptional() @IsEnum(TaskStatus) status?: TaskStatus;
  @IsOptional() @IsString() @MaxLength(200) title?: string;
  @IsOptional() @IsString() @MaxLength(4000) description?: string;
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('tasks')
export class TasksController {
  constructor(private prisma: PrismaService, private rt: RealtimeGateway) {}

  @Get()
  list(@CurrentUser() user: AuthUser) {
    if (user.role === 'employee') {
      return this.prisma.task.findMany({ where: { employeeId: user.sub }, orderBy: { createdAt: 'desc' } });
    }
    return this.prisma.task.findMany({ orderBy: { createdAt: 'desc' } });
  }

  @Roles('director')
  @Post()
  async create(@Body() dto: CreateTaskDto) {
    const t = await this.prisma.task.create({ data: dto });
    this.rt.toEmployee(t.employeeId, 'task:new', { id: t.id });
    return t;
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateTaskDto, @CurrentUser() user: AuthUser) {
    const data: any = { ...dto };
    if (dto.status === 'in_progress') data.startedAt = new Date();
    if (dto.status === 'done') data.completedAt = new Date();
    if (dto.status === 'approved' && user.role === 'director') data.approvedAt = new Date();
    const t = await this.prisma.task.update({ where: { id }, data });
    this.rt.broadcast('task:update', { id: t.id });
    return t;
  }

  @Patch(':id/seen')
  async seen(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    const data = user.role === 'employee' ? { seenByEmployee: true } : { seenByDirector: true };
    return this.prisma.task.update({ where: { id }, data });
  }

  @Roles('director')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.prisma.task.delete({ where: { id } });
  }
}
