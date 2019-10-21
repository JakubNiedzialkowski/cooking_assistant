import { Injectable } from '@angular/core';

import { CookedRecipesService } from '../../services/cookedRecipeService/cooked-recipes.service';
import { TtsManagerService } from '../../services/ttsManager/tts-manager.service';
import { SpeechrecognitionService } from '../../services/speechRecognition/speechrecognition.service';

@Injectable({
  providedIn: 'root'
})
export class TimerService {

  timer;

  constructor(private cookedRecipes: CookedRecipesService,
    private tts: TtsManagerService,
    private speechRecognition: SpeechrecognitionService) {  }

  startService(){
    var speechRecognitionCounter = 0;
    var ttsCounter = 0;
    const speechRecognitionInterval = 3;
    const ttsInterval = 5;

    if (this.timer)
      clearInterval(this.timer);
    this.timer = setInterval(() => {
      this.cookedRecipes.handleCookedRecipes();

      if(speechRecognitionCounter >= speechRecognitionInterval){
        this.speechRecognition.startSpeechRecognition();
        speechRecognitionCounter = 0; 
      }
      else
        speechRecognitionCounter++;

      if(ttsCounter >= ttsInterval){
        this.tts.playMessage();
        ttsCounter = 0;
      }
      else
        ttsCounter++;

    }, 1000);
  }

}
