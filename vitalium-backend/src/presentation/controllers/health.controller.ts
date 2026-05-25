import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SystemHealthService } from '../../shared/monitoring/system-health.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly systemHealthService: SystemHealthService) {}

  @Get()
  @ApiOperation({ summary: 'Get application health status' })
  @ApiResponse({
    status: 200,
    description: 'Application health status retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: ['healthy', 'error'],
          description: 'Application health status',
        },
        timestamp: {
          type: 'string',
          format: 'date-time',
          description: 'Timestamp of the health check',
        },
        version: {
          type: 'string',
          description: 'Application version',
        },
        environment: {
          type: 'string',
          description: 'Current environment',
        },
        uptime: {
          type: 'number',
          description: 'Application uptime in seconds',
        },
        nodeVersion: {
          type: 'string',
          description: 'Node.js version',
        },
        message: {
          type: 'string',
          description: 'Health status message',
        },
      },
    },
  })
  async getHealth() {
    return this.systemHealthService.getHealthStatus();
  }
}
