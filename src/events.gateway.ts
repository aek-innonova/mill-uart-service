import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MillStatus, UartService } from './uart.service';
import { LogService } from './log.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() io: Server;
  private clients: { [id: string]: Socket } = {};
  private lastEvent: string;
  private lastData: any;

  constructor(
    private uart: UartService,
    private log: LogService,
  ) {
    this.uart.listen((msg: MillStatus) => {
      this.emit('mill-status', msg);
    });
  }

  handleConnection(client: Socket) {
    this.log.log(
      `Client id: ${client.id} connected (${this.io.sockets.sockets.size})`,
    );
    this.clients[client.id] = client;
    if (this.lastEvent && this.lastData) {
      client.emit(this.lastEvent, this.lastData);
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`Client id:${client.id} disconnected`);
    if (this.clients[client.id]) {
      delete this.clients[client.id];
    }
  }

  public emit(event: string, data: any) {
    this.lastEvent = event;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    this.lastData = data;
    Object.keys(this.clients)
      .map((k) => this.clients[k])
      .forEach((client) => {
        client.emit(event, data);
      });
  }
}
