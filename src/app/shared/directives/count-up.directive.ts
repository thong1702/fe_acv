import { Directive, ElementRef, Input, OnInit, OnDestroy, inject, NgZone } from '@angular/core';

@Directive({
  selector: '[appCountUp]',
  standalone: true
})
export class CountUpDirective implements OnInit, OnDestroy {
  @Input('appCountUp') targetValue: number = 0;
  @Input() duration: number = 2000;
  @Input() prefix: string = '';
  @Input() suffix: string = '';

  private el = inject(ElementRef);
  private ngZone = inject(NgZone);
  private observer: IntersectionObserver | null = null;

  ngOnInit(): void {
    if ('IntersectionObserver' in window) {
      this.observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.startCount();
            if (this.observer) {
              this.observer.unobserve(this.el.nativeElement);
            }
          }
        });
      }, { threshold: 0.2 });
      this.observer.observe(this.el.nativeElement);
    } else {
      this.startCount();
    }
  }

  private startCount(): void {
    this.ngZone.runOutsideAngular(() => {
      const startTime = performance.now();
      const endValue = Number(this.targetValue) || 0;

      const step = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / this.duration, 1);
        // Easing function: easeOutQuart
        const easeProgress = 1 - Math.pow(1 - progress, 4);
        const currentCount = Math.floor(easeProgress * endValue);

        this.el.nativeElement.textContent = `${this.prefix}${currentCount}${this.suffix}`;

        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          this.el.nativeElement.textContent = `${this.prefix}${endValue}${this.suffix}`;
        }
      };

      requestAnimationFrame(step);
    });
  }

  ngOnDestroy(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}
