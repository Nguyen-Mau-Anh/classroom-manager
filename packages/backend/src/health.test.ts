import { APP_VERSION, formatUptime, getHealthStatus } from './health';

describe('health', () => {
  describe('APP_VERSION', () => {
    it('should be defined', () => {
      expect(APP_VERSION).toBeDefined();
      expect(typeof APP_VERSION).toBe('string');
    });
  });

  describe('getHealthStatus', () => {
    it('should return healthy status', () => {
      const startTime = new Date();
      const status = getHealthStatus(startTime);

      expect(status.status).toBe('healthy');
      expect(status.version).toBe(APP_VERSION);
      expect(status.uptime).toBeGreaterThanOrEqual(0);
    });

    it('should include ISO timestamp', () => {
      const startTime = new Date();
      const status = getHealthStatus(startTime);

      expect(status.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it('should calculate uptime correctly', () => {
      const startTime = new Date(Date.now() - 5000); // 5 seconds ago
      const status = getHealthStatus(startTime);

      expect(status.uptime).toBeGreaterThanOrEqual(4);
      expect(status.uptime).toBeLessThanOrEqual(6);
    });
  });

  describe('formatUptime', () => {
    it('should format seconds only', () => {
      expect(formatUptime(45)).toBe('45s');
    });

    it('should format minutes and seconds', () => {
      expect(formatUptime(125)).toBe('2m 5s');
    });

    it('should format hours, minutes and seconds', () => {
      expect(formatUptime(3665)).toBe('1h 1m 5s');
    });

    it('should handle zero', () => {
      expect(formatUptime(0)).toBe('0s');
    });

    it('should handle exact minute', () => {
      expect(formatUptime(60)).toBe('1m 0s');
    });

    it('should handle exact hour', () => {
      expect(formatUptime(3600)).toBe('1h 0m 0s');
    });
  });
});
