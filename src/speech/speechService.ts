import { AIStatus } from '../types';

// Speech interface abstraction allowing Browser Speech API, Local Simulator, or pluggable Whisper API
export interface SpeechRecognitionResultPayload {
  transcript: string;
  confidence: number;
  isFinal: boolean;
  speaker?: string;
}

export type SpeechCallback = (payload: SpeechRecognitionResultPayload) => void;
export type StatusCallback = (status: AIStatus) => void;

// Web Speech API interfaces
interface SpeechRecognitionEventLike extends Event {
  results: {
    length: number;
    [index: number]: {
      [index: number]: {
        transcript: string;
        confidence: number;
      };
      isFinal: boolean;
    };
  };
}

interface WindowWithSpeech extends Window {
  SpeechRecognition?: any;
  webkitSpeechRecognition?: any;
}

export class OrionSpeechService {
  private recognition: any = null;
  private isListening: boolean = false;
  private ttsEnabled: boolean = true;
  private currentStatus: AIStatus = 'IDLE';
  private onTranscriptCallback: SpeechCallback | null = null;
  private onStatusCallback: StatusCallback | null = null;
  private noiseLevel: 'Quiet' | 'Normal OR' | 'High Ambient Noise' = 'Normal OR';
  private synthesisVoice: SpeechSynthesisVoice | null = null;

  constructor() {
    this.initBrowserSpeechRecognition();
    this.initTtsVoices();
  }

  private initBrowserSpeechRecognition() {
    if (typeof window === 'undefined') return;
    const win = window as unknown as WindowWithSpeech;
    const SpeechRecognitionConstructor = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (SpeechRecognitionConstructor) {
      try {
        this.recognition = new SpeechRecognitionConstructor();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';

        this.recognition.onstart = () => {
          this.setStatus('LISTENING');
        };

        this.recognition.onresult = (event: SpeechRecognitionEventLike) => {
          const results = event.results;
          const latestResult = results[results.length - 1];
          const transcript = latestResult[0].transcript;
          let confidence = latestResult[0].confidence || 0.94;

          // Adjust confidence based on noise level simulation
          if (this.noiseLevel === 'High Ambient Noise') {
            confidence = Math.max(0.48, confidence - 0.28);
          } else if (this.noiseLevel === 'Normal OR') {
            confidence = Math.min(0.96, Math.max(0.78, confidence - 0.08));
          }

          if (this.onTranscriptCallback && latestResult.isFinal) {
            this.setStatus('PROCESSING');
            this.onTranscriptCallback({
              transcript,
              confidence,
              isFinal: true,
              speaker: 'Surgeon'
            });
            setTimeout(() => {
              if (this.isListening && this.currentStatus !== 'SPEAKING') {
                this.setStatus('LISTENING');
              }
            }, 600);
          }
        };

        this.recognition.onerror = (e: any) => {
          console.warn('[ORION Speech] Browser speech recognition event:', e.error);
          if (e.error === 'not-allowed') {
            this.setStatus('MUTED');
          }
        };

        this.recognition.onend = () => {
          if (this.isListening) {
            try {
              this.recognition.start();
            } catch {
              // Ignore restart collision
            }
          } else {
            this.setStatus('IDLE');
          }
        };
      } catch (err) {
        console.warn('[ORION Speech] SpeechRecognition initialization failed:', err);
      }
    }
  }

  private initTtsVoices() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        // Prefer clear neutral medical assistant voices (Google US English, Samantha, Microsoft Zira, Daniel)
        const preferred = voices.find(v => 
          v.name.includes('Natural') || 
          v.name.includes('Samantha') || 
          v.name.includes('Google US English') ||
          v.name.includes('Zira') ||
          v.name.includes('Jenny')
        );
        this.synthesisVoice = preferred || voices[0] || null;
      };

      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }

  public setNoiseLevel(level: 'Quiet' | 'Normal OR' | 'High Ambient Noise') {
    this.noiseLevel = level;
  }

  public getNoiseLevel() {
    return this.noiseLevel;
  }

  public setTtsEnabled(enabled: boolean) {
    this.ttsEnabled = enabled;
  }

  public isTtsEnabled(): boolean {
    return this.ttsEnabled;
  }

  public subscribeTranscript(callback: SpeechCallback) {
    this.onTranscriptCallback = callback;
  }

  public subscribeStatus(callback: StatusCallback) {
    this.onStatusCallback = callback;
  }

  public setStatus(status: AIStatus) {
    this.currentStatus = status;
    if (this.onStatusCallback) {
      this.onStatusCallback(status);
    }
  }

  public getStatus(): AIStatus {
    return this.currentStatus;
  }

  public startListening(): boolean {
    this.isListening = true;
    if (this.recognition) {
      try {
        this.recognition.start();
        this.setStatus('LISTENING');
        return true;
      } catch (e) {
        // May already be active
        this.setStatus('LISTENING');
        return true;
      }
    } else {
      // Mock / fallback active
      this.setStatus('LISTENING');
      return true;
    }
  }

  public stopListening() {
    this.isListening = false;
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch {}
    }
    this.setStatus('IDLE');
  }

  public toggleListening(): boolean {
    if (this.isListening) {
      this.stopListening();
      return false;
    } else {
      return this.startListening();
    }
  }

  /**
   * Text-to-speech with full-duplex pause/resume handling
   */
  public speak(promptText: string, onEnd?: () => void) {
    if (!this.ttsEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) {
      if (onEnd) onEnd();
      return;
    }

    try {
      window.speechSynthesis.cancel(); // Stop any pending speech
      const utterance = new SpeechSynthesisUtterance(promptText);
      if (this.synthesisVoice) {
        utterance.voice = this.synthesisVoice;
      }
      utterance.rate = 1.05; // Crisp, professional pace
      utterance.pitch = 1.0;

      this.setStatus('SPEAKING');

      utterance.onend = () => {
        if (this.isListening) {
          this.setStatus('LISTENING');
        } else {
          this.setStatus('IDLE');
        }
        if (onEnd) onEnd();
      };

      utterance.onerror = () => {
        if (this.isListening) {
          this.setStatus('LISTENING');
        } else {
          this.setStatus('IDLE');
        }
        if (onEnd) onEnd();
      };

      window.speechSynthesis.speak(utterance);
    } catch {
      if (onEnd) onEnd();
    }
  }

  public interruptTts() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      this.setStatus('INTERRUPTED');
      setTimeout(() => {
        if (this.isListening) this.setStatus('LISTENING');
        else this.setStatus('IDLE');
      }, 400);
    }
  }
}

export const speechService = new OrionSpeechService();
