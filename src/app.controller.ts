/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import * as shell from 'shelljs';
import { LogService } from './log.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private log: LogService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('shutdown')
  shutdown(): string {
    try {
      shell.exec('sudo shutdown now');
      return '{ "status": "OK" }';
    } catch (ex) {
      return '{ "status": "ERROR" }';
    }
  }
}
