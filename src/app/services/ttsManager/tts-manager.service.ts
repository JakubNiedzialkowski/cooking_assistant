import { Injectable } from '@angular/core';

import { TextToSpeech } from '@ionic-native/text-to-speech/ngx';

@Injectable({
  providedIn: 'root'
})
export class TtsManagerService {

  locale;
  rate;

  messagesToPlay: string[];
  processingTimer;

  isMessageBeingPlayed = false;
  isTtsEnabled = true;

  constructor(private tts: TextToSpeech,
  ) {
    this.locale = 'pl-PL';
    this.rate = 1;
    this.messagesToPlay = [];
  }


  playText(message) {
    this.isMessageBeingPlayed = true;
    this.tts.speak({
      text: message.toString(),
      locale: this.locale,
      rate: this.rate,
    })
      .then(() => setTimeout(() => { this.isMessageBeingPlayed = false; }, 1000))
      .catch((reason: any) => setTimeout(() => { this.isMessageBeingPlayed = false; }, 1000));

  }

  playMessage() {
    if (this.messagesToPlay.length > 0 && !this.isMessageBeingPlayed) {
      this.playText(this.messagesToPlay[0]);
      this.messagesToPlay.splice(0, 1);
    }
  }

  addMessage(message: string) {
    if (this.isTtsEnabled) {
      if (this.processingTimer) {
        this.messagesToPlay.push(message);
      }
      else {
        this.messagesToPlay.push(message);
        this.startTimer();
      }
    }
  }

  startTimer() {
    if (this.isTtsEnabled) {
      if (this.processingTimer)
        clearInterval(this.processingTimer);
      this.playMessage();
      this.processingTimer = setInterval(() => {
        if (this.messagesToPlay.length <= 0) {
          this.stopTimer();
        }
        else {
          this.playMessage();
        }
      }, 5000);
    }
  }

  stopTimer() {
    if (this.processingTimer) {
      clearInterval(this.processingTimer);
      this.processingTimer = false;
    }
  }

  enableService() {
    this.isTtsEnabled = true;
  }

  disableService() {
    this.isTtsEnabled = false;
  }

}
