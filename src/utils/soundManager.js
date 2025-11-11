class SoundManager {
  constructor() {
    this.sounds = {};
    this.muted = false;
    this.volume = 0.7;
    this.initSounds();
  }

  initSounds() {
    // Movement sounds
    this.sounds.move = this.createSound('move');
    this.sounds.charge = this.createSound('charge');
    this.sounds.boost = this.createSound('boost');
    this.sounds.win = this.createSound('win');
    this.sounds.lose = this.createSound('lose');
    this.sounds.click = this.createSound('click');
    this.sounds.error = this.createSound('error');
    this.sounds.robotSwitch = this.createSound('robotSwitch');
    this.sounds.powerDrain = this.createSound('powerDrain');
    this.sounds.placement = this.createSound('placement');
  }

  createSound(type) {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    switch(type) {
      case 'move':
        return this.createBeep(audioContext, 300, 0.1);
      case 'charge':
        return this.createBeep(audioContext, 800, 0.3);
      case 'boost':
        return this.createSweep(audioContext, 400, 800, 0.4);
      case 'win':
        return this.createVictory(audioContext);
      case 'lose':
        return this.createDefeat(audioContext);
      case 'click':
        return this.createBeep(audioContext, 200, 0.05);
      case 'error':
        return this.createBeep(audioContext, 150, 0.2);
      case 'robotSwitch':
        return this.createBeep(audioContext, 500, 0.1);
      case 'powerDrain':
        return this.createBeep(audioContext, 100, 0.3);
      case 'placement':
        return this.createBeep(audioContext, 600, 0.15);
      default:
        return this.createBeep(audioContext, 440, 0.1);
    }
  }

  createBeep(audioContext, frequency, duration) {
    return () => {
      if (this.muted) return;
      
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(this.volume, audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration);
    };
  }

  createSweep(audioContext, startFreq, endFreq, duration) {
    return () => {
      if (this.muted) return;
      
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(startFreq, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(endFreq, audioContext.currentTime + duration);
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(this.volume, audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration);
    };
  }

  createVictory(audioContext) {
    return () => {
      if (this.muted) return;
      
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      const duration = 0.2;
      
      notes.forEach((freq, index) => {
        setTimeout(() => {
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          oscillator.frequency.value = freq;
          oscillator.type = 'sine';
          
          gainNode.gain.setValueAtTime(0, audioContext.currentTime);
          gainNode.gain.linearRampToValueAtTime(this.volume, audioContext.currentTime + 0.01);
          gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
          
          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + duration);
        }, index * 200);
      });
    };
  }

  createDefeat(audioContext) {
    return () => {
      if (this.muted) return;
      
      const notes = [220, 196, 174.61]; // A3, G3, F3
      const duration = 0.3;
      
      notes.forEach((freq, index) => {
        setTimeout(() => {
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          oscillator.frequency.value = freq;
          oscillator.type = 'sine';
          
          gainNode.gain.setValueAtTime(0, audioContext.currentTime);
          gainNode.gain.linearRampToValueAtTime(this.volume, audioContext.currentTime + 0.01);
          gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
          
          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + duration);
        }, index * 300);
      });
    };
  }

  play(soundName) {
    if (this.sounds[soundName]) {
      this.sounds[soundName]();
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }

  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
  }
}

export const soundManager = new SoundManager();