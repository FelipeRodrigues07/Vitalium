import { Test, TestingModule } from '@nestjs/testing';
import { SystemHealthService } from '../../shared/monitoring/system-health.service';
import { HealthController } from './health.controller';

describe('HealthController', () => {
  let controller: HealthController;
  let systemHealthService: jest.Mocked<SystemHealthService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: SystemHealthService,
          useValue: {
            getHealthStatus: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
    systemHealthService = module.get(SystemHealthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getHealth', () => {
    it('should return healthy status', async () => {
      const healthResult = {
        status: 'healthy',
        timestamp: new Date('2025-01-01'),
        version: '1.0.0',
        environment: 'test',
        uptime: 1000,
        nodeVersion: 'v20.0.0',
        message: 'Application is running normally',
      };

      systemHealthService.getHealthStatus.mockResolvedValue(healthResult);

      const result = await controller.getHealth();

      expect(systemHealthService.getHealthStatus).toHaveBeenCalled();
      expect(result.status).toBe('healthy');
      expect(result.timestamp).toBeDefined();
      expect(result.version).toBeDefined();
      expect(result.environment).toBeDefined();
      expect(result.uptime).toBeDefined();
      expect(result.nodeVersion).toBeDefined();
      expect(result.message).toBeDefined();
    });

    it('should return error status when service fails', async () => {
      const errorResult = {
        status: 'error',
        timestamp: new Date('2025-01-01'),
        error: 'Health check failed',
      };

      systemHealthService.getHealthStatus.mockResolvedValue(errorResult);

      const result = await controller.getHealth();

      expect(result.status).toBe('error');
    });
  });
});
