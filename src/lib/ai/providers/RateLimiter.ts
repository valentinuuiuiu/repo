export class RateLimiter {
  private limits: Record<string, number> = {
    requests: 0,
    input: 0,
    output: 0
  };
  private counts: Record<string, number> = {
    requests: 0,
    input: 0,
    output: 0
  };
  private lastReset: number;
  private readonly resetInterval: number;

  constructor(resetIntervalSeconds: number = 60) {
    this.resetInterval = resetIntervalSeconds * 1000;
    this.lastReset = Date.now();
  }

  public updateLimits(requests: number, input: number, output: number): void {
    this.limits.requests = requests;
    this.limits.input = input;
    this.limits.output = output;
  }

  public async checkLimit(type: 'requests' | 'input' | 'output', value: number = 1): Promise<boolean> {
    this.resetIfNeeded();
    
    if (this.limits[type] === 0) return true; // No limit
    if (this.counts[type] + value > this.limits[type]) {
      return false;
    }
    
    this.counts[type] += value;
    return true;
  }

  private resetIfNeeded(): void {
    const now = Date.now();
    if (now - this.lastReset >= this.resetInterval) {
      this.counts = {
        requests: 0,
        input: 0,
        output: 0
      };
      this.lastReset = now;
    }
  }
}