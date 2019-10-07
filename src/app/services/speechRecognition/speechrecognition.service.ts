import { Injectable } from '@angular/core';

import { SpeechRecognition } from '@ionic-native/speech-recognition/ngx';
import { StorageService } from '../../services/storageService/storage.service';
import { CookedRecipesService } from '../../services/cookedRecipeService/cooked-recipes.service';
import { NavController } from '@ionic/angular';


declare var annyang: any;

@Injectable({
  providedIn: 'root'
})

export class SpeechrecognitionService {

  isAnnyangStarted = false;

  commands = {
    'test': function () {
      annyang.pause();
      alert('Hello world!');
      setTimeout(() => { annyang.resume(); }, 200);
    },
    'Gotuj *recipeTitle': function (recipeTitle) {
      annyang.pause();
      alert("Rozpoczynam gotowanie " + recipeTitle);
      setTimeout(() => { annyang.resume(); }, 200);
    }
    // 'Gotuj *recipeTitle': this.startCooking,
  };

  constructor(private speechRecognition: SpeechRecognition,
    private storageService: StorageService,
    private cookedRecipes: CookedRecipesService,
    private navController: NavController,
  ) {
    //this.startSpeechRecognition();
  }

  startIonicSpeechRecognition() {
    this.speechRecognition.startListening({ language: 'pl-Pl', matches: 1 }).subscribe((matches: string[]) => alert(matches[0]));
  }


  startSpeechRecognition() {
    if (annyang) {
      annyang.setLanguage('pl');
      annyang.debug(true);

      annyang.addCommands(this.commands);
      // Start listening.
      annyang.start();
    }
  }


  getPermission() {
    this.speechRecognition.hasPermission()
      .then((hasPermission: boolean) => {
        if (!hasPermission) {
          this.speechRecognition.requestPermission();
        }
      });
  }

  toggleSpeechRecognition() {
    if (annyang) {
      if (this.isAnnyangStarted) {
        annyang.abort();
        this.isAnnyangStarted = false;
      }
      else {
        this.startSpeechRecognition();
        this.isAnnyangStarted = true;
      }
    }
  }

  startCooking(recipeTitle) {
    annyang.pause();

    var recipe = this.storageService.getRecipeByTitle(recipeTitle);
    // if (this.cookedRecipes.isRecipeBeingCooked(recipe.id)) {
    //   //this.showToast("Przepis jest już gotowany.");
    // }
    // else {
    //   this.cookedRecipes.startCookingRecipe(recipe);
    //   this.goToRecipe(recipe);
    // }

    setTimeout(() => { annyang.resume(); }, 200);
  }

  goToRecipe(recipe) {
    this.navController.navigateRoot('/menu/recipe/' + recipe.id);
  }

}

