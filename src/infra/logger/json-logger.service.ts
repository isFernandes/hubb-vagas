import { ConsoleLogger, Injectable } from '@nestjs/common';

@Injectable()
export class JsonLoggerService extends ConsoleLogger {
  protected printMessages(
    messages: unknown[],
    context?: string,
    logLevel?: string,
    writeStreamType?: 'stdout' | 'stderr',
  ) {
    messages.forEach((message) => {
      const logObj = {
        timestamp: new Date().toISOString(),
        level: logLevel,
        context: context || this.context,
        message: typeof message === 'object' ? message : { text: message },
      };
      
      const output = JSON.stringify(logObj) + '\n';
      
      if (writeStreamType === 'stderr') {
        process.stderr.write(output);
      } else {
        process.stdout.write(output);
      }
    });
  }
}
