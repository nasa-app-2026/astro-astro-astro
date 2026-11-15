import { afterEach, describe, expect, it, vi } from 'vitest';
import { SplashGate } from './splashGate';

describe('SplashGate', () => {
  afterEach(() => vi.useRealTimers());

  it('waits exactly three seconds after the splash becomes ready', () => {
    vi.useFakeTimers();
    const complete = vi.fn();
    const gate = new SplashGate(complete);
    vi.advanceTimersByTime(5000); // image loading does not consume splash time
    gate.ready();
    gate.ready();
    vi.advanceTimersByTime(2999);
    expect(complete).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(complete).toHaveBeenCalledTimes(1);
  });

  it('allows immediate skip and prevents a later timer or ready callback from completing twice', () => {
    vi.useFakeTimers();
    const complete = vi.fn();
    const gate = new SplashGate(complete);
    gate.ready();
    gate.skip();
    gate.skip();
    vi.advanceTimersByTime(3000);
    gate.ready();
    expect(complete).toHaveBeenCalledTimes(1);
  });
});
