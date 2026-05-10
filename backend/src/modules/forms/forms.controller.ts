import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ArrayMinSize, IsArray, IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { FieldType } from '@prisma/client';
import { PrismaService } from '@/prisma/prisma.module';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';

class FieldDto {
  @IsEnum(FieldType) type!: FieldType;
  @IsString() @IsNotEmpty() @MaxLength(128) label!: string;
  @IsOptional() @IsBoolean() required?: boolean;
  @IsOptional() @IsArray() @IsString({ each: true }) options?: string[];
}

class CreateFormDto {
  @IsString() @IsNotEmpty() @MaxLength(128) title!: string;
  @IsString() @IsNotEmpty() targetCategoryId!: string;
  @IsArray() @ArrayMinSize(1) @ValidateNested({ each: true }) @Type(() => FieldDto) fields!: FieldDto[];
}

@Controller('forms')
export class FormsController {
  constructor(private prisma: PrismaService) {}

  // Public endpoint for filling the form - no auth
  @Get('public/:id')
  async getPublic(@Param('id') id: string) {
    const form = await this.prisma.formTemplate.findUnique({
      where: { id },
      include: { fields: { orderBy: { order: 'asc' } } },
    });
    return form;
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  list() {
    return this.prisma.formTemplate.findMany({
      include: { fields: { orderBy: { order: 'asc' } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('director')
  @Post()
  async create(@Body() dto: CreateFormDto) {
    return this.prisma.formTemplate.create({
      data: {
        title: dto.title,
        targetCategoryId: dto.targetCategoryId,
        fields: {
          create: dto.fields.map((f, i) => ({
            type: f.type,
            label: f.label,
            required: f.required ?? false,
            options: f.options ?? [],
            order: i,
          })),
        },
      },
      include: { fields: true },
    });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('director')
  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: CreateFormDto) {
    await this.prisma.formField.deleteMany({ where: { formId: id } });
    return this.prisma.formTemplate.update({
      where: { id },
      data: {
        title: dto.title,
        targetCategoryId: dto.targetCategoryId,
        fields: {
          create: dto.fields.map((f, i) => ({
            type: f.type,
            label: f.label,
            required: f.required ?? false,
            options: f.options ?? [],
            order: i,
          })),
        },
      },
      include: { fields: true },
    });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('director')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.prisma.formTemplate.delete({ where: { id } });
  }
}
