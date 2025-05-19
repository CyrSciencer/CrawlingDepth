export interface Controls {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
}

export class KeyboardControls {
  private controls: Controls = {
    up: false,
    down: false,
    left: false,
    right: false
  };

  private boundKeyDown: (event: KeyboardEvent) => void;
  private boundKeyUp: (event: KeyboardEvent) => void;

  constructor() {
    this.boundKeyDown = this.handleKeyDown.bind(this);
    this.boundKeyUp = this.handleKeyUp.bind(this);
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    window.addEventListener('keydown', this.boundKeyDown);
    window.addEventListener('keyup', this.boundKeyUp);
  }

  private handleKeyDown(event: KeyboardEvent): void {
    console.log('Key pressed:', event.key);
    switch (event.key) {
      case 'ArrowUp':
        this.controls.up = true;
        break;
      case 'ArrowDown':
        this.controls.down = true;
        break;
      case 'ArrowLeft':
        this.controls.left = true;
        break;
      case 'ArrowRight':
        this.controls.right = true;
        break;
    }
    console.log('Controls after keydown:', this.controls);
  }

  private handleKeyUp(event: KeyboardEvent): void {
    console.log('Key released:', event.key);
    switch (event.key) {
      case 'ArrowUp':
        this.controls.up = false;
        break;
      case 'ArrowDown':
        this.controls.down = false;
        break;
      case 'ArrowLeft':
        this.controls.left = false;
        break;
      case 'ArrowRight':
        this.controls.right = false;
        break;
    }
    console.log('Controls after keyup:', this.controls);
  }

  public getControls(): Controls {
    return { ...this.controls };
  }

  public cleanup(): void {
    window.removeEventListener('keydown', this.boundKeyDown);
    window.removeEventListener('keyup', this.boundKeyUp);
  }
}
