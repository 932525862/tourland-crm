import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { IsOptional, IsString } from 'class-validator';
import { PrismaService } from '@/prisma/prisma.module';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser, AuthUser } from '@/common/decorators/current-user.decorator';
import { RealtimeGateway } from '../realtime/realtime.gateway';

class CheckInDto {
  @IsOptional() @IsString() photo?: string; // dataURL
}
class CheckOutDto {
  @IsOptional() @IsString() photo?: string;
}

function todayStr(d = new Date()) {
  const y = d.getFullYear(), m = String(d.getMonth() + 1).padStart(2, '0'), day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

@UseGuards(JwtAuthGuard)
@Controller('attendance')
export class AttendanceController {
  constructor(private prisma: PrismaService, private rt: RealtimeGateway) {}

  @Get()
  list(@Query('employeeId') employeeId?: string, @Query('date') date?: string) {
    return this.prisma.attendance.findMany({
      where: { ...(employeeId && { employeeId }), ...(date && { date }) },
      orderBy: { checkInAt: 'desc' },
    });
  }

  @Post('check-in')
  async checkIn(@Body() dto: CheckInDto, @CurrentUser() user: AuthUser) {
    if (user.role !== 'employee') return { ok: false };
    const emp = await this.prisma.employee.findUnique({ where: { id: user.sub } });
    if (!emp) return { ok: false };
    const date = todayStr();
    // Prevent duplicate open record same day
    const existing = await this.prisma.attendance.findFirst({
      where: { employeeId: emp.id, date, checkOutAt: null },
    });
    if (existing) return existing;
    const rec = await this.prisma.attendance.create({
      data: {
        employeeId: emp.id,
        employeeName: `${emp.firstName} ${emp.lastName}`,
        date,
        checkInAt: new Date(),
        photo: dto.photo,
      },
    });
    this.rt.broadcast('attendance:update', { id: rec.id });
    return rec;
  }

  @Patch(':id/check-out')
  async checkOut(@Param('id') id: string, @Body() dto: CheckOutDto) {
    const rec = await this.prisma.attendance.update({
      where: { id },
      data: { checkOutAt: new Date(), checkOutPhoto: dto.photo },
    });
    this.rt.broadcast('attendance:update', { id: rec.id });
    return rec;
  }
}
