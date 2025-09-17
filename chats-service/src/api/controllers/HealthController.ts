import { StatusCodes } from 'http-status-codes';
import { Get, HttpCode, JsonController } from 'routing-controllers';
import { env } from '../../env';
import { constructLogMessage } from '../../lib/env/helpers';
import { Logger } from '../../lib/logger';

@JsonController('/v1')
export class HealthController {
  private log = new Logger(__filename);

  @Get('/health')
  @HttpCode(StatusCodes.OK)
  public async healthCheck() {
    const headers = { urc: 'health-check' };
    const logMessage = constructLogMessage(__filename, 'healthCheck', headers as any);
    this.log.debug(logMessage);

    const healthData = {
      status: 'ok',
      uptime: process.uptime(),
      version: env.app.version,
      timestamp: new Date().toISOString()
    };

    this.log.debug(`Health check response: ${JSON.stringify(healthData)}`);
    return healthData;
  }
}
