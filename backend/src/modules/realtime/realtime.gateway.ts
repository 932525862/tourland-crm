import { Logger } from '@nestjs/common';
import {
  OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway, WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({
  cors: { origin: true, credentials: true },
  path: '/ws',
})
export class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger('Realtime');
  @WebSocketServer() server!: Server;

  constructor(private jwt: JwtService) {}

  handleConnection(client: Socket) {
    try {
      const token =
        (client.handshake.auth?.token as string) ||
        (client.handshake.headers?.authorization?.toString().replace('Bearer ', '') ?? '');
      if (!token) { client.disconnect(); return; }
      const payload: any = this.jwt.verify(token, { secret: process.env.JWT_SECRET || 'change-me' });
      client.data.user = payload;
      client.join(`role:${payload.role}`);
      if (payload.role === 'employee') client.join(`emp:${payload.sub}`);
      this.logger.log(`Connected ${payload.login} (${payload.role})`);
    } catch {
      client.disconnect();
    }
  }
  handleDisconnect(_client: Socket) {}

  broadcast(event: string, payload: unknown) {
    this.server.emit(event, payload);
  }
  toRole(role: 'director' | 'employee', event: string, payload: unknown) {
    this.server.to(`role:${role}`).emit(event, payload);
  }
  toEmployee(empId: string, event: string, payload: unknown) {
    this.server.to(`emp:${empId}`).emit(event, payload);
  }
}
