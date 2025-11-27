function throttle<T extends (...args: any[]) => void>(func: T, limit: number): T {
  let inThrottle: boolean;
  return function(this: ThisParameterType<T>, ...args: Parameters<T>): void {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  } as T;
}

export function initEffects() {
  if (typeof window === 'undefined') return;

  // Don't run on devices that likely have touch as primary input to save performance.
  if (window.matchMedia('(pointer: coarse)').matches) {
    return;
  }

  const createParticle = (x: number, y: number, isClick: boolean) => {
    const particle = document.createElement('div');
    document.body.appendChild(particle);
    
    // Use absolute positioning to respect page scroll.
    particle.style.position = 'absolute';
    particle.style.left = `${x}px`;
    particle.style.top = `${y}px`;
    
    if (isClick) {
      particle.className = 'particle click-particle';
      const size = Math.floor(Math.random() * 15 + 5);
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * 50 + 50;
      const transformTo = `translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance}px) scale(0)`;
      particle.style.setProperty('--transform-to', transformTo);

    } else {
      particle.className = 'particle trail-particle';
      particle.style.width = '5px';
      particle.style.height = '5px';
    }
    
    const animationDuration = isClick ? 600 : 500;
    setTimeout(() => {
      if (particle.parentNode) {
        particle.parentNode.removeChild(particle);
      }
    }, animationDuration);
  };

  document.addEventListener('click', (e) => {
    // Use pageX/pageY to get the position relative to the whole page
    const x = e.pageX;
    const y = e.pageY;
    for (let i = 0; i < 10; i++) {
      createParticle(x, y, true);
    }
  });

  document.addEventListener('mousemove', throttle((e: MouseEvent) => {
    const x = e.pageX;
    const y = e.pageY;
    createParticle(x, y, false);
  }, 50));
}
