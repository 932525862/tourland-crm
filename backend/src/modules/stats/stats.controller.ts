import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.module';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('director')
@Controller('stats')
export class StatsController {
  constructor(private prisma: PrismaService) {}

  @Get('overview')
  async overview(@Query('employeeId') employeeId?: string) {
    const [clients, payments, employees, categories] = await Promise.all([
      this.prisma.client.findMany({ include: { payments: true } }),
      this.prisma.payment.findMany(),
      this.prisma.employee.findMany(),
      this.prisma.category.findMany(),
    ]);

    const filteredPayments = employeeId
      ? payments.filter((p) => p.authorEmpId === employeeId)
      : payments;

    const totalRevenue = filteredPayments.reduce((s, p) => s + p.amount, 0);
    const totalClients = clients.length;
    const sold = clients.filter((c) => c.saleStatus !== 'none').length;
    const partial = clients.filter((c) => c.saleStatus === 'partial').length;

    const byCategory = categories.map((cat) => {
      const cs = clients.filter((c) => c.categoryId === cat.id);
      const revenue = cs.reduce(
        (s, c) =>
          s +
          c.payments
            .filter((p) => (employeeId ? p.authorEmpId === employeeId : true))
            .reduce((a, p) => a + p.amount, 0),
        0,
      );
      const soldCount = cs.filter((c) => c.saleStatus !== 'none').length;
      return {
        categoryId: cat.id,
        name: cat.name,
        clientsCount: cs.length,
        soldCount,
        conversion: cs.length ? (soldCount / cs.length) * 100 : 0,
        revenue,
      };
    });

    const byEmployee = employees.map((e) => {
      const ps = payments.filter((p) => p.authorEmpId === e.id);
      return {
        employeeId: e.id,
        name: `${e.firstName} ${e.lastName}`,
        salesCount: new Set(ps.map((p) => p.clientId)).size,
        revenue: ps.reduce((s, p) => s + p.amount, 0),
      };
    });

    return {
      kpi: { totalClients, sold, partial, totalRevenue },
      byCategory,
      byEmployee,
    };
  }

  @Get('sales')
  async sales(@Query('employeeId') employeeId?: string) {
    const payments = await this.prisma.payment.findMany({
      where: employeeId ? { authorEmpId: employeeId } : undefined,
      orderBy: { createdAt: 'desc' },
      include: { client: { include: { category: true } } },
    });
    return payments.map((p) => ({
      paymentId: p.id,
      clientId: p.clientId,
      clientName: (p.client.data as any)?.['Ism familya'] || (p.client.data as any)?.['Ism'] || 'Mijoz',
      categoryName: p.client.category?.name,
      sellerName: p.authorName,
      sellerId: p.authorEmpId,
      amount: p.amount,
      createdAt: p.createdAt,
    }));
  }
}
