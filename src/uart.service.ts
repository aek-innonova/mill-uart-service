import { Injectable } from '@nestjs/common';
import { Serial } from 'raspi-serial';
import { LogService } from './log.service';

export interface AxisStatus {
  name: string;
  encoderPos: number;
  stepperPos: number;
  stepperEncoderPos: number;
  stepperLinearPos: number;
}

export interface MillStatus {
  axes: AxisStatus[];
}

@Injectable()
export class UartService {
  private serial: Serial;
  private listeners: ((msg: MillStatus) => void)[] = [];
  private lastChanged = Date.now();
  private lastEmitted = Date.now();
  private status: MillStatus = {
    axes: [
      {
        name: 'x',
        encoderPos: 0,
        stepperPos: 0,
        stepperEncoderPos: 0,
        stepperLinearPos: 0,
      },
      {
        name: 'y',
        encoderPos: 0,
        stepperPos: 0,
        stepperEncoderPos: 0,
        stepperLinearPos: 0,
      },
      {
        name: 'z',
        encoderPos: 0,
        stepperPos: 0,
        stepperEncoderPos: 0,
        stepperLinearPos: 0,
      },
    ],
  };

  constructor(private log: LogService) {
    const decoder = new TextDecoder();
    this.serial = new Serial({ portId: '/dev/ttyAMA0', baudRate: 115200 });
    this.serial.open(() => {
      let text = '';
      this.serial.on('data', (data: ArrayBuffer) => {
        // process.stdout.write(data as Uint8Array);
        text += decoder.decode(data);
        if (text.trimStart().includes('\n')) {
          if (text.trim().startsWith('Position')) {
            const items = text.trim().split(' ');
            const axis = this.status.axes.find((axis) => axis.name === 'x')!;
            axis.encoderPos = parseInt(items[1]);
            axis.stepperPos = parseInt(items[3]);
            axis.stepperEncoderPos = parseInt(items[4]);
            axis.stepperLinearPos = parseInt(items[5]);
            this.lastChanged = Date.now();
          }
          text = '';
        }
      });
    });
    setInterval(() => this.updateClients(), 25);
  }

  private updateClients() {
    if (this.lastEmitted < this.lastChanged) {
      this.lastEmitted = Date.now();
      this.listeners.forEach((cb) => cb(this.status));
    }
  }

  public listen(cb: (msg: MillStatus) => void) {
    this.listeners.push(cb);
  }
}
