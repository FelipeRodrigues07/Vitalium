import * as process from 'node:process';
import { Injectable } from '@nestjs/common';
import { MetricsCollectorService } from './metrics-collector.service';

@Injectable()
export class SystemHealthService {
  constructor(private readonly metricsCollector: MetricsCollectorService) {}

  // Log critical application error
  async logCriticalError(error: {
    type: string;
    message: string;
    stackTrace?: string;
    context?: string;
    userId?: string;
  }) {
    try {
      await this.metricsCollector.logError({
        errorType: error.type || 'CRITICAL_ERROR',
        errorMessage: error.message,
        stackTrace: error.stackTrace,
        context: error.context,
        userId: error.userId,
      });

      console.error(`🚨 CRITICAL ERROR: ${error.type} - ${error.message}`);
    } catch (logError) {
      console.error('Failed to log critical error:', logError);
    }
  }

  // Log application failure
  async logApplicationFailure(failure: {
    operation: string;
    error: string;
    userId?: string;
    metadata?: any;
  }) {
    try {
      await this.metricsCollector.logError({
        errorType: 'APPLICATION_FAILURE',
        errorMessage: `Application failure in ${failure.operation}: ${failure.error}`,
        userId: failure.userId,
        metadata: failure.metadata,
      });

      console.error(
        `❌ APPLICATION FAILURE: ${failure.operation} - ${failure.error}`,
      );
    } catch (error) {
      console.error('Failed to log application failure:', error);
    }
  }

  // Log database connection failure
  async logDatabaseFailure(error: {
    operation: string;
    error: string;
    metadata?: any;
  }) {
    try {
      await this.metricsCollector.logError({
        errorType: 'DATABASE_FAILURE',
        errorMessage: `Database operation failed: ${error.operation} - ${error.error}`,
        context: 'DATABASE',
        metadata: error.metadata,
      });

      console.error(`🗄️ DATABASE FAILURE: ${error.operation} - ${error.error}`);
    } catch (logError) {
      console.error('Failed to log database failure:', logError);
    }
  }

  // Log authentication failure
  async logAuthFailure(failure: {
    type: string;
    userId?: string;
    ip?: string;
    userAgent?: string;
    metadata?: any;
  }) {
    try {
      await this.metricsCollector.logError({
        errorType: 'AUTHENTICATION_FAILURE',
        errorMessage: `Authentication failure: ${failure.type}`,
        userId: failure.userId,
        metadata: {
          ip: failure.ip,
          userAgent: failure.userAgent,
          ...failure.metadata,
        },
      });

      console.error(
        `🔐 AUTH FAILURE: ${failure.type} - User: ${failure.userId || 'Unknown'}`,
      );
    } catch (error) {
      console.error('Failed to log auth failure:', error);
    }
  }

  // Log API critical failure
  async logApiFailure(failure: {
    method: string;
    url: string;
    statusCode: number;
    error: string;
    userId?: string;
    ip?: string;
  }) {
    try {
      // Only log if it's a server error (5xx) or critical client error
      if (
        failure.statusCode >= 500 ||
        failure.statusCode === 401 ||
        failure.statusCode === 403
      ) {
        await this.metricsCollector.logError({
          errorType: 'API_FAILURE',
          errorMessage: `API failure: ${failure.method} ${failure.url} - ${failure.error}`,
          context: 'API',
          userId: failure.userId,
          metadata: {
            method: failure.method,
            url: failure.url,
            statusCode: failure.statusCode,
            ip: failure.ip,
          },
        });

        console.error(
          `🌐 API FAILURE: ${failure.method} ${failure.url} - ${failure.statusCode}`,
        );
      }
    } catch (error) {
      console.error('Failed to log API failure:', error);
    }
  }

  // Get basic health status (without resource monitoring)
  async getHealthStatus() {
    try {
      return {
        status: 'healthy',
        timestamp: new Date(),
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        uptime: process.uptime(),
        nodeVersion: process.version,
        message: 'Application is running normally',
      };
    } catch (error) {
      console.error('Failed to get health status:', error);

      // Log the health check failure as critical
      await this.logCriticalError({
        type: 'HEALTH_CHECK_FAILURE',
        message: 'Health check endpoint failed',
        stackTrace: error instanceof Error ? error.stack : undefined,
        context: 'HEALTH_CHECK',
      });

      return {
        status: 'error',
        timestamp: new Date(),
        error: error instanceof Error ? error.stack : undefined,
      };
    }
  }

  // Log startup failure
  async logStartupFailure(error: {
    service: string;
    error: string;
    stackTrace?: string;
  }) {
    try {
      await this.metricsCollector.logError({
        errorType: 'STARTUP_FAILURE',
        errorMessage: `Failed to start service: ${error.service} - ${error.error}`,
        stackTrace: error.stackTrace,
        context: 'STARTUP',
      });

      console.error(`🚀 STARTUP FAILURE: ${error.service} - ${error.error}`);
    } catch (logError) {
      console.error('Failed to log startup failure:', logError);
    }
  }
}
