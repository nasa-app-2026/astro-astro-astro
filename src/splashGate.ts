/** One completion path for both the loaded splash's timer and Skip. */
export class SplashGate {
  private timer: ReturnType<typeof setTimeout> | undefined;
  private finished = false;

  constructor(private readonly onComplete: () => void) {}

  ready(): void {
    if (this.finished || this.timer !== undefined) return;
    this.timer = setTimeout(() => this.complete(), 3000);
  }

  skip(): void {
    this.complete();
  }

  private complete(): void {
    if (this.finished) return;
    this.finished = true;
    if (this.timer !== undefined) clearTimeout(this.timer);
    this.timer = undefined;
    this.onComplete();
  }
}
