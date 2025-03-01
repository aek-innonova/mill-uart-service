import { Injectable } from '@nestjs/common';
import { appendFile } from 'fs/promises';

@Injectable()
export class LogService {
  log(...args: any[]) {
    void (async () => {
      console.log(...args);
      for (const item of args) {
        await appendFile('./log.txt', JSON.stringify(item, undefined, '  '));
      }
      await appendFile('./log.txt', '\n');
    })();
  }
}
