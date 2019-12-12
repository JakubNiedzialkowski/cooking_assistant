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
  ) { }

  getPermission() {
    this.speechRecognition.hasPermission()
      .then((hasPermission: boolean) => {
        if (!hasPermission) {
          this.speechRecognition.requestPermission();
        }
      });
  }

  startSpeechRecognition() {
    if (!this.isSpeechRecognitionActive && this.speechRecognition.isRecognitionAvailable()) {
      this.isSpeechRecognitionActive = true;
      this.speechRecognition.startListening({ language: 'pl-Pl', showPopup: false, matches: 1 }).subscribe((matches: string[]) => { this.recognizeCommand(matches[0]); this.isSpeechRecognitionActive = false; },
        error => { this.isSpeechRecognitionActive = false; });
    }
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
    var regex = new RegExp('^Przygotuj ', 'i');
    var regex1 = new RegExp('^Gotuj ', 'i');
    var regex2 = new RegExp('^Usmaż ', 'i');
    if (regex.test(message) || regex1.test(message) || regex2.test(message)) {
      message = message.replace((regex), "");
      message = message.replace((regex1), "");
      message = message.replace((regex2), "");
      this.startCooking(message);
      return;
    }
    regex = new RegExp('^Zakończ przygotowywanie ', 'i');
    regex1 = new RegExp('^Zakończ gotowanie ', 'i');
    regex2 = new RegExp('^Zakończ smażenie ', 'i');
    if (regex.test(message) || regex1.test(message) || regex2.test(message)) {
      message = message.replace((regex), "");
      message = message.replace((regex1), "");
      message = message.replace((regex2), "");
      this.stopCooking(message);
      return;
    }
    regex = new RegExp('^Otwórz przepis ', 'i');
    regex1 = new RegExp('^Pokaż przepis ', 'i');
    regex2 = new RegExp('^Wyświetl przepis ', 'i');
    if (regex.test(message) || regex1.test(message) || regex2.test(message)) {
      message = message.replace((regex), "");
      message = message.replace((regex1), "");
      message = message.replace((regex2), "");
      this.goToRecipe(message);
      return;
    }
    regex = new RegExp('^Wstrzymaj przygotowywanie ', 'i');
    regex1 = new RegExp('^Wstrzymaj gotowanie ', 'i');
    regex2 = new RegExp('^Wstrzymaj smażenie ', 'i');
    if (regex.test(message) || regex1.test(message) || regex2.test(message)) {
      message = message.replace((regex), "");
      message = message.replace((regex1), "");
      message = message.replace((regex2), "");
      this.pauseRecipe(message);
      return;
    }
    regex = new RegExp('^Wznów przygotowywanie ', 'i');
    regex1 = new RegExp('^Wznów gotowanie ', 'i');
    regex2 = new RegExp('^Wznów smażenie ', 'i');
    if (regex.test(message) || regex1.test(message) || regex2.test(message)) {
      message = message.replace((regex), "");
      message = message.replace((regex1), "");
      message = message.replace((regex2), "");
      this.unpauseRecipe(message);
      return;
    }
    regex = new RegExp('^Następny krok ', 'i');
    if (regex.test(message)) {
      message = message.replace(regex, "");
      this.goToNextStep(message);
      return;
    }
    regex = new RegExp('^Cofnij krok ', 'i');
    regex1 = new RegExp('^Poprzedni krok ', 'i');
    if (regex.test(message) || regex1.test(message)) {
      message = message.replace((regex), "");
      message = message.replace((regex1), "");
      this.goToPreviousStep(message);
      return;
    }
  }

  startCooking(recipeTitle) {
    var recipe;
    this.storageService.getRecipeByTitle(recipeTitle).then(result => {
      if (result != null)
        recipe = result;
      else {
        this.showToast("Nie znaleziono podanego przepisu! Proszę spróbować ponownie.");
        this.playRecipeNotFoundMessage(recipeTitle);
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
      this.playRecipeIsCookedMessage(recipeTitle);
    }
    else {
      this.cookedRecipes.stopCookingRecipe(recipe.recipe.id);
      this.tts.addMessage("Zakończono przygotowywanie przepisu: " + recipe.recipe.title);
    }
  }

  pauseRecipe(recipeTitle) {
    let cookedRecipe = this.cookedRecipes.getCookedRecipeByTitle(recipeTitle);

    if (cookedRecipe == null) {
      this.showToast("Podany przepis nie jest obecnie gotowany.");
      this.playRecipeIsCookedMessage(recipeTitle);
    }
    else
      this.cookedRecipes.pauseCookingRecipe(cookedRecipe.recipe.id);

  }

  unpauseRecipe(recipeTitle) {
    let cookedRecipe = this.cookedRecipes.getCookedRecipeByTitle(recipeTitle);

    if (cookedRecipe == null) {
      this.showToast("Podany przepis nie jest obecnie gotowany.");
      this.playRecipeIsCookedMessage(recipeTitle);
    }
    else
      this.cookedRecipes.resumeCookingRecipe(cookedRecipe.recipe.id);
      
  }

  goToNextStep(recipeTitle) {
    let recipe = this.cookedRecipes.getCookedRecipeByTitle(recipeTitle);

    if (recipe == null) {
      this.showToast("Podany przepis nie jest obecnie gotowany.");
      this.playRecipeIsCookedMessage(recipeTitle);
    }
    else 
      this.cookedRecipes.goToNextStep(recipe);
    

  }

  goToPreviousStep(recipeTitle) {
    let recipe = this.cookedRecipes.getCookedRecipeByTitle(recipeTitle);

    if (recipe == null) {
      this.showToast("Podany przepis nie jest obecnie gotowany.");
      this.playRecipeIsCookedMessage(recipeTitle);
    }
    else
      this.cookedRecipes.goToPreviousStep(recipe);
  }

  goToRecipe(recipeTitle) {
    let recipe;
    this.storageService.getRecipeByTitle(recipeTitle).then(result => {
      if (result != null) {
        recipe = result;
        this.navController.navigateRoot('/menu/recipe/' + recipe.id);
      }
      else {
        this.showToast("Nie znaleziono podanego przepisu! Proszę spróbować ponownie.");
        this.playRecipeNotFoundMessage(recipeTitle);
      }
    });
  }

  playRecipeIsCookedMessage(recipeTitle){
    const messages = ["Podany przepis nie jest obecnie gotowany.", 
    "Przepis " + recipeTitle + " nie jest obecnie gotowany.",
    "Przepis " + recipeTitle + " nie znajduje się na liście gotowanych przepisów."];
    
    const random = this.randomIntFromInterval(0, messages.length-1);
    this.tts.addMessage(messages[random]);
  }

  playRecipeNotFoundMessage(recipeTitle){
    const messages = ["Nie znaleziono podanego przepisu! Proszę spróbować ponownie.", 
    "Nie znaleziono przepisu: " + recipeTitle + ". Proszę spróbować ponownie.",
    "Nie znaleziono przepisu: " + recipeTitle + ". Proszę powtorzyć komendę lub upewnić się, że podany przepis znajduje się na liście przepisów."];
    
    const random = this.randomIntFromInterval(0, messages.length-1);
    this.tts.addMessage(messages[random]);
  }

  async showToast(msg) {
    const toast = await this.toastController.create({
      message: msg,
      duration: 2000
    });
    toast.present();
  }

  randomIntFromInterval(min, max) { // min and max included 
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

}

