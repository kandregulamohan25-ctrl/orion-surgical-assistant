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
  private cachedEnglishVoices: SpeechSynthesisVoice[] = [];
  
  // Audio playback queue & synchronization
  private isSpeakingActive: boolean = false;
  private speechQueue: Array<{ text: string; onEnd?: () => void }> = [];
  private speechEndListeners: Array<() => void> = [];

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
        this.recognition.lang = 'en-US'; // Strictly English language

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
              if (this.isListening && !this.isSpeakingActive) {
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
        const allVoices = window.speechSynthesis.getVoices();
        if (!allVoices || allVoices.length === 0) return;

        // FILTER STRICTLY FOR ENGLISH VOICES
        const englishVoices = allVoices.filter(v => 
          v.lang && (
            v.lang.toLowerCase().startsWith('en') ||
            v.lang.toLowerCase().includes('en-us') ||
            v.lang.toLowerCase().includes('en-gb') ||
            v.lang.toLowerCase().includes('en_us') ||
            v.lang.toLowerCase().includes('en-in')
          )
        );

        this.cachedEnglishVoices = englishVoices.length > 0 ? englishVoices : allVoices;

        // Prioritize clear neutral English medical assistant voices:
        const preferred = englishVoices.find(v => 
          v.name.includes('Google US English') ||
          v.name.includes('Microsoft Zira') ||
          v.name.includes('Microsoft David') ||
          v.name.includes('Samantha') ||
          v.name.includes('Natural') ||
          v.name.includes('Jenny') ||
          v.name.includes('Daniel')
        );

        this.synthesisVoice = preferred || englishVoices[0] || allVoices[0] || null;
      };

      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }

  public getAvailableEnglishVoices(): SpeechSynthesisVoice[] {
    if (this.cachedEnglishVoices.length > 0) return this.cachedEnglishVoices;
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const voices = window.speechSynthesis.getVoices();
      return voices.filter(v => v.lang && v.lang.toLowerCase().startsWith('en'));
    }
    return [];
  }

  public getSelectedVoice(): SpeechSynthesisVoice | null {
    return this.synthesisVoice;
  }

  public setVoiceByName(voiceName: string): boolean {
    const voices = this.getAvailableEnglishVoices();
    const match = voices.find(v => v.name === voiceName);
    if (match) {
      this.synthesisVoice = match;
      return true;
    }
    return false;
  }

  public setNoiseLevel(level: 'Quiet' | 'Normal OR' | 'High Ambient Noise') {
    this.noiseLevel = level;
  }

  public getNoiseLevel() {
    return this.noiseLevel;
  }

  public setTtsEnabled(enabled: boolean) {
    this.ttsEnabled = enabled;
    if (!enabled && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      this.isSpeakingActive = false;
      this.notifySpeechEnd();
    }
  }

  public isTtsEnabled(): boolean {
    return this.ttsEnabled;
  }

  public isSpeaking(): boolean {
    return this.isSpeakingActive;
  }

  public onSpeechEnd(listener: () => void) {
    this.speechEndListeners.push(listener);
    return () => {
      this.speechEndListeners = this.speechEndListeners.filter(l => l !== listener);
    };
  }

  private notifySpeechEnd() {
    const listeners = [...this.speechEndListeners];
    listeners.forEach(fn => {
      try { fn(); } catch {}
    });
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
        this.recognition.lang = 'en-US';
        this.recognition.start();
        this.setStatus('LISTENING');
        return true;
      } catch (e) {
        this.setStatus('LISTENING');
        return true;
      }
    } else {
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
   * High-reliability English speech synthesis with audio pipeline warmup
   * and clean queue handling (prevents clipping the first words and prevents cutoffs).
   */
  public speak(promptText: string, onEnd?: () => void) {
    if (!this.ttsEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) {
      if (onEnd) onEnd();
      this.notifySpeechEnd();
      return;
    }

    const cleanText = promptText.trim();
    if (!cleanText) {
      if (onEnd) onEnd();
      this.notifySpeechEnd();
      return;
    }

    // Queue if already speaking to prevent cutoffs
    if (this.isSpeakingActive) {
      this.speechQueue.push({ text: cleanText, onEnd });
      return;
    }

    this.executeSpeak(cleanText, onEnd);
  }

  private executeSpeak(textToSpeak: string, onEnd?: () => void) {
    this.isSpeakingActive = true;
    this.setStatus('SPEAKING');

    try {
      // Unfreeze browser speech engine if paused
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }

      // CRITICAL AUDIO FIX FOR CHROME / WINDOWS:
      // Prefix with a slight acoustic pause (comma/space) so audio driver buffers spool up
      // before speaking real words. This guarantees the first 2-3 words are NOT clipped!
      const acousticWarmedText = ` , ${textToSpeak}`;
      const utterance = new SpeechSynthesisUtterance(acousticWarmedText);

      utterance.lang = 'en-US';

      // Assign verified English voice
      if (this.synthesisVoice && this.synthesisVoice.lang.toLowerCase().startsWith('en')) {
        utterance.voice = this.synthesisVoice;
      } else {
        const engVoices = this.getAvailableEnglishVoices();
        if (engVoices.length > 0) {
          this.synthesisVoice = engVoices[0];
          utterance.voice = engVoices[0];
        }
      }

      // Clear, measured medical delivery pace (not too fast, not robotic)
      utterance.rate = 0.92;
      utterance.pitch = 1.0;

      let hasCompleted = false;
      const finishExecution = () => {
        if (hasCompleted) return;
        hasCompleted = true;
        this.isSpeakingActive = false;

        if (this.isListening) {
          this.setStatus('LISTENING');
        } else {
          this.setStatus('IDLE');
        }

        if (onEnd) onEnd();
        this.notifySpeechEnd();

        // Check for queued speech
        if (this.speechQueue.length > 0) {
          const next = this.speechQueue.shift();
          if (next) {
            setTimeout(() => {
              this.executeSpeak(next.text, next.onEnd);
            }, 300);
          }
        }
      };

      utterance.onend = finishExecution;
      utterance.onerror = (e) => {
        console.warn('[ORION Speech] Utterance error or interrupt:', e);
        finishExecution();
      };

      // Workaround for Chrome 15-second speech synthesis pause bug
      const resumeInterval = setInterval(() => {
        if (!this.isSpeakingActive) {
          clearInterval(resumeInterval);
        } else if (window.speechSynthesis.speaking) {
          window.speechSynthesis.pause();
          window.speechSynthesis.resume();
        }
      }, 5000);

      // Clean spool-up start
      window.speechSynthesis.speak(utterance);

    } catch (err) {
      console.error('[ORION Speech] speak error:', err);
      this.isSpeakingActive = false;
      if (onEnd) onEnd();
      this.notifySpeechEnd();
    }
  }

  public testVoice(sampleText: string = "ORION operating room assistant ready. Identity and pre-incision safety checks confirmed in English.") {
    this.speechQueue = [];
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      this.isSpeakingActive = false;
      setTimeout(() => {
        this.speak(sampleText);
      }, 150);
    }
  }

  public interruptTts() {
    this.speechQueue = [];
    this.isSpeakingActive = false;
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      this.setStatus('INTERRUPTED');
      setTimeout(() => {
        if (this.isListening) this.setStatus('LISTENING');
        else this.setStatus('IDLE');
        this.notifySpeechEnd();
      }, 300);
    }
  }
}

export const speechService = new OrionSpeechService();
