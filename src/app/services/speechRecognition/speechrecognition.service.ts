import { Injectable } from '@angular/core';
import { NavController, ToastController } from '@ionic/angular';

import { SpeechRecognition } from '@ionic-native/speech-recognition/ngx';
import { StorageService } from '../../services/storageService/storage.service';
import { CookedRecipesService } from '../../services/cookedRecipeService/cooked-recipes.service';
import { TtsManagerService } from '../../services/ttsManager/tts-manager.service';


@Injectable({
  providedIn: 'root'
})

export class SpeechrecognitionService {

  isSpeechRecognitionActive = false;
  refreshTimer;

  constructor(private speechRecognition: SpeechRecognition,
    private storageService: StorageService,
    private cookedRecipes: CookedRecipesService,
    private navController: NavController,
    private tts: TtsManagerService,
    private toastController: ToastController,
  ) { 
    this.getPermission();
    setTimeout(this.startSpeechRecognition, 1000);
    
  }

  getPermission() {
    this.speechRecognition.hasPermission()
      .then((hasPermission: boolean) => {
        if (!hasPermission) {
          this.speechRecognition.requestPermission();
        }
      });
  }

  startSpeechRecognition() {
    this.speechRecognition.startListening({ language: 'pl-Pl', showPopup: false, matches: 1 }).subscribe((matches: string[]) => {this.recognizeCommand(matches[0]); this.isSpeechRecognitionActive = false; },
          error => { this.isSpeechRecognitionActive = false; });
    if (this.refreshTimer)
      clearInterval(this.refreshTimer);
    this.refreshTimer = setInterval(() => {
      if (!this.isSpeechRecognitionActive && this.speechRecognition.isRecognitionAvailable()) {
        this.isSpeechRecognitionActive = true;
        this.speechRecognition.startListening({ language: 'pl-Pl', showPopup: false, matches: 1 }).subscribe((matches: string[]) => {this.recognizeCommand(matches[0]); this.isSpeechRecognitionActive = false; },
          error => { this.isSpeechRecognitionActive = false; });
      }
    }, 1000);
  }

  stopSpeechRecognition() {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = false;
      this.isSpeechRecognitionActive = false;
    }
  }

  toggleSpeechRecognition() {
    if (this.isSpeechRecognitionActive)
      this.stopSpeechRecognition();
    else
      this.startSpeechRecognition();
  }

  recognizeCommand(message: string) {
    var regex = new RegExp('^Gotuj ', 'i');
    if (regex.test(message)) {
      message = message.replace(regex, "");
      this.startCooking(message);
      return;
    }
    regex = new RegExp('^Zakończ gotowanie ', 'i');
    if (regex.test(message)) {
      message = message.replace(regex, "");
      this.stopCooking(message);
      return;
    }
    regex = new RegExp('^Otwórz przepis ', 'i');
    if (regex.test(message)) {
      message = message.replace(regex, "");
      this.goToRecipe(message);
      return;
    }
    regex = new RegExp('^Wstrzymaj gotowanie ', 'i');
    if (regex.test(message)) {
      message = message.replace(regex, "");
      this.pauseRecipe(message);
      return;
    }
    regex = new RegExp('^Wznów gotowanie ', 'i');
    if (regex.test(message)) {
      message = message.replace(regex, "");
      this.unpauseRecipe(message);
      return;
    }
    regex = new RegExp('^Następny krok ', 'i');
    if (regex.test(message)) {
      message = message.replace(regex, "");
      this.goToNextStep(message);
      return;
    }
    regex = new RegExp('^Poprzedni krok ', 'i');
    if (regex.test(message)) {
      message = message.replace(regex, "");
      this.goToPreviousStep(message);
      return;
    }
    this.tts.addMessage("Nie rozpoznano komendy: " + message);
  }

  startCooking(recipeTitle) {
    var recipe;
    this.storageService.getRecipeByTitle(recipeTitle).then(result => {
      if (result != null)
        recipe = result;
      else {
        this.showToast("Nie znaleziono podanego przepisu! Proszę spróbować ponownie.");
        this.tts.addMessage("Nie znaleziono podanego przepisu! Proszę spróbować ponownie.");
      }
      if (this.cookedRecipes.isRecipeBeingCooked(recipe.id)) {
        this.showToast("Przepis jest już gotowany.");
        this.tts.addMessage("Przepis jest już gotowany.");
      }
      else {
        this.cookedRecipes.startCookingRecipe(recipe);
        this.goToRecipe(recipe);
      }
    });
  }

  stopCooking(recipeTitle) {
    var recipe = this.cookedRecipes.getCookedRecipeByTitle(recipeTitle);

    if (recipe == null) {
      this.showToast("Podany przepis nie jest obecnie gotowany.");
      this.tts.addMessage("Podany przepis nie jest obecnie gotowany.");
    }
    else
      {
        this.cookedRecipes.stopCookingRecipe(recipe.recipe.id);
        this.tts.addMessage("Zakończono gotowanie przepisu: " + recipe.recipe.title);
      }
  }

  pauseRecipe(recipeTitle) {
    var recipe = this.cookedRecipes.getCookedRecipeByTitle(recipeTitle);

    if (recipe == null) {
      this.showToast("Podany przepis nie jest obecnie gotowany.");
      this.tts.addMessage("Podany przepis nie jest obecnie gotowany.");
    }
    else
      this.cookedRecipes.pauseCookingRecipe(recipe.recipe.id);
  }

  unpauseRecipe(recipeTitle) {
    var recipe = this.cookedRecipes.getCookedRecipeByTitle(recipeTitle);

    if (recipe == null) {
      this.showToast("Podany przepis nie jest obecnie gotowany.");
      this.tts.addMessage("Podany przepis nie jest obecnie gotowany.");
    }
    else
      this.cookedRecipes.resumeCookingRecipe(recipe.recipe.id);
  }

  goToNextStep(recipeTitle) {
    var recipe = this.cookedRecipes.getCookedRecipeByTitle(recipeTitle);

    if (recipe == null) {
      this.showToast("Podany przepis nie jest obecnie gotowany.");
      this.tts.addMessage("Podany przepis nie jest obecnie gotowany.");
    }
    else
      this.cookedRecipes.goToNextStep(recipe);
  }

  goToPreviousStep(recipeTitle) {
    var recipe = this.cookedRecipes.getCookedRecipeByTitle(recipeTitle);

    if (recipe == null) {
      this.showToast("Podany przepis nie jest obecnie gotowany.");
      this.tts.addMessage("Podany przepis nie jest obecnie gotowany.");
    }
    else
      this.cookedRecipes.goToPreviousStep(recipe);
  }

  goToRecipe(recipeTitle) {
    var recipe;
    this.storageService.getRecipeByTitle(recipeTitle).then(result => {
      if (result != null)
        {
          recipe = result;
          this.navController.navigateRoot('/menu/recipe/' + recipe.id);
        }
      else {
        this.showToast("Nie znaleziono podanego przepisu! Proszę spróbować ponownie.");
        this.tts.addMessage("Nie znaleziono podanego przepisu! Proszę spróbować ponownie.");
      }
    });

    
  }

  async showToast(msg) {
    const toast = await this.toastController.create({
      message: msg,
      duration: 2000
    });
    toast.present();
  }

}

