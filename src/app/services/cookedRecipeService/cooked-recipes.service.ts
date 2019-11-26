import { Injectable } from '@angular/core';

import { NavController } from '@ionic/angular';

import { StorageService, Recipe } from '../../services/storageService/storage.service';
import { TtsManagerService } from '../../services/ttsManager/tts-manager.service';
import { LocalNotifications, ELocalNotificationTriggerUnit } from '@ionic-native/local-notifications/ngx';

export interface CookedRecipe {
  recipe: Recipe,
  currentStep: string,
  currentStepIndex: number,
  timeUntilNextStep: number,
  formattedTimeUntilNextStep: string,
  stepProgressPercentage: number,
  isRecipePaused:boolean,
  timeUntilReminder:number
}

const reminderTime = 60;
const longReminderTime = 120;

@Injectable({
  providedIn: 'root'
})

export class CookedRecipesService {

  cookedRecipes = [];

  constructor(private storageService: StorageService,
    private tts: TtsManagerService,
    private navController: NavController,
    private notifications: LocalNotifications,
  ) {
    this.notifications.on('click').subscribe(result => {
    });
  }

  handleCookedRecipes() {
      this.cookedRecipes.forEach(cookedRecipe => {
        if(!cookedRecipe.isRecipePaused){
          if (cookedRecipe.timeUntilNextStep <= 0) {
            cookedRecipe.currentStepIndex++;
            if (cookedRecipe.currentStepIndex < cookedRecipe.recipe.steps.length) {
              this.tts.addMessage("Zakończono krok " + cookedRecipe.currentStep +" w przepisie " + cookedRecipe.recipe.title + ". Aby kontynuować przygotowywanie przepisu użyj komendy 'Wznów przygotowywanie'.");
              this.displayNotification(cookedRecipe.recipe.title, "Zakończono krok " + cookedRecipe.currentStep);
              cookedRecipe.currentStep = cookedRecipe.recipe.steps[cookedRecipe.currentStepIndex];
              cookedRecipe.timeUntilNextStep = cookedRecipe.recipe.stepTimes[cookedRecipe.currentStepIndex];
              cookedRecipe.formattedTimeUntilNextStep = "❚❚";
              cookedRecipe.stepProgressPercentage = 0;
              cookedRecipe.isRecipePaused = true;
              this.tts.addMessage("Następny krok w przepisie "+ cookedRecipe.recipe.title + " to: " +cookedRecipe.currentStep);
            }
            else
                {
                  this.displayNotification(cookedRecipe.recipe.title, "Zakończono przygotowywanie przepisu");
                  this.tts.addMessage("Zakończono przygotowywanie przepisu: " + cookedRecipe.recipe.title);
                  this.storageService.increasePopularity(cookedRecipe.recipe);
                  this.stopCookingRecipe(cookedRecipe.recipe.id);
                  this.goToCookedRecipesPage();
                }
          }
          else {
            cookedRecipe.timeUntilNextStep--;
            cookedRecipe.stepProgressPercentage = this.calculateProgressPercentage(cookedRecipe.timeUntilNextStep, cookedRecipe.recipe.stepTimes[cookedRecipe.currentStepIndex]);
            cookedRecipe.formattedTimeUntilNextStep = this.convertSecondsToDateString(cookedRecipe.timeUntilNextStep);
          }
        }
        else {
          if(cookedRecipe.timeUntilReminder>0)
            cookedRecipe.timeUntilReminder--;
          else{
            //to do add message generator
            this.playReminderMessage(cookedRecipe);
            cookedRecipe.timeUntilReminder = longReminderTime;
          }
        }
      });
  }

  startCookingRecipe(Recipe:Recipe) {
    var newCookedRecipe = {
      recipe: Recipe,
      currentStep: Recipe.steps[0],
      currentStepIndex: 0,
      timeUntilNextStep: Recipe.stepTimes[0],
      formattedTimeUntilNextStep: this.convertSecondsToDateString(Recipe.stepTimes[0]),
      stepProgressPercentage: 0,
      isRecipePaused:false,
      timeUntilReminder:reminderTime,
    }
    this.cookedRecipes.push(newCookedRecipe);
    this.tts.addMessage("Rozpoczęto przygotowywanie przepisu: " + Recipe.title);
    this.storageService.increasePopularity(Recipe);
  }

  stopCookingRecipe(id:number) {
    for (let i = this.cookedRecipes.length - 1; i >= 0; i--) {
      if (this.cookedRecipes[i].recipe.id === id)
        {
          this.cookedRecipes.splice(i, 1);
        }
    }
  }

  pauseCookingRecipe(id:number){
    this.cookedRecipes.forEach(cookedRecipe =>{
      if(cookedRecipe.recipe.id === id && !cookedRecipe.isRecipePaused){
        cookedRecipe.isRecipePaused = true;
        cookedRecipe.formattedTimeUntilNextStep = "❚❚";
        cookedRecipe.timeUntilReminder=longReminderTime;
        this.tts.addMessage("Wstrzymano przygotowywanie przepisu: " + cookedRecipe.recipe.title);
        return;
      }
    });
  }

  resumeCookingRecipe(id:number){
    this.cookedRecipes.forEach(cookedRecipe =>{
      if(cookedRecipe.recipe.id === id && cookedRecipe.isRecipePaused){
        cookedRecipe.isRecipePaused = false;
        cookedRecipe.formattedTimeUntilNextStep = this.convertSecondsToDateString(cookedRecipe.timeUntilNextStep);
        cookedRecipe.timeUntilReminder=reminderTime;
        this.tts.addMessage("Wznowiono przygotowywanie przepisu: " + cookedRecipe.recipe.title);
        return;
      }
    });
  }

  getCookedRecipes() {
    return this.cookedRecipes;
  }

  getCookedRecipeById(id:number) {
    var result;
    this.cookedRecipes.forEach(cookedRecipe => {
      if (cookedRecipe.recipe.id === id) {
        result = cookedRecipe;
        return;
      }
    });
    return result;
  }
  
  getCookedRecipeByTitle(title:string): CookedRecipe {
    var result;
    this.cookedRecipes.forEach(cookedRecipe => {
      if (cookedRecipe.recipe.title.toLowerCase() === title.toLowerCase()) {
        result = cookedRecipe;
        return;
      }
    });
    return result;
  }

  isRecipeBeingCooked(id:number) {
    var result = false;
    this.cookedRecipes.forEach(cookedRecipe => {
      if (cookedRecipe.recipe.id === id) {
        result = true;
        return;
      }
    });
    return result;
  }

  pad(num, size) {
    let s = num + "";
    while (s.length < size) s = "0" + s;
    return s;
  }

  convertSecondsToDateString(time) {
    let h = Math.floor((time % (60 * 60 * 24)) / (60 * 60));
    let m = Math.floor((time % (60 * 60)) / (60));
    let s = Math.floor(time % 60);
    return this.pad(h, 2) + ":" + this.pad(m, 2) + ":" + this.pad(s, 2);
  }

  calculateProgressPercentage(currentTime, totalTime) {
    return 100 - currentTime / totalTime * 100;
  }

  goToNextStep(cookedRecipeData) {
    if (cookedRecipeData.currentStepIndex < cookedRecipeData.recipe.steps.length-1) {
      cookedRecipeData.currentStepIndex++;
      cookedRecipeData.currentStep = cookedRecipeData.recipe.steps[cookedRecipeData.currentStepIndex];
      cookedRecipeData.timeUntilNextStep = cookedRecipeData.recipe.stepTimes[cookedRecipeData.currentStepIndex];
      if(cookedRecipeData.isRecipePaused)
        cookedRecipeData.formattedTimeUntilNextStep = "❚❚";
      else
        cookedRecipeData.formattedTimeUntilNextStep = this.convertSecondsToDateString(cookedRecipeData.timeUntilNextStep);
      cookedRecipeData.stepProgressPercentage = 0;
      this.cookedRecipes.forEach(recipe =>{
        if(recipe.recipe.id === cookedRecipeData.recipe.id)
          recipe = cookedRecipeData;
      });
      return true;
    }
    return false;
  }

  goToPreviousStep(cookedRecipeData) {
    if (cookedRecipeData.currentStepIndex > 0) {
      cookedRecipeData.currentStepIndex--;
      cookedRecipeData.currentStep = cookedRecipeData.recipe.steps[cookedRecipeData.currentStepIndex];
      cookedRecipeData.timeUntilNextStep = cookedRecipeData.recipe.stepTimes[cookedRecipeData.currentStepIndex];
      if(cookedRecipeData.isRecipePaused)
        cookedRecipeData.formattedTimeUntilNextStep = "❚❚";
      else
        cookedRecipeData.formattedTimeUntilNextStep = this.convertSecondsToDateString(cookedRecipeData.timeUntilNextStep);
      cookedRecipeData.stepProgressPercentage = 0;
      this.cookedRecipes.forEach(recipe =>{
        if(recipe.recipe.id === cookedRecipeData.recipe.id)
          recipe = cookedRecipeData;
      });
      return true;
    }
    return false;
  }

  displayNotification(title:string, message:string) {
    this.notifications.schedule({
      title: title,
      text: message,
      trigger: { in: 5, unit: ELocalNotificationTriggerUnit.SECOND },
      foreground: true
    });
  }

  goToCookedRecipesPage() {
    this.navController.navigateRoot('/menu/active-recipes/');
  }

  playReminderMessage(cookedRecipe:CookedRecipe){
    const messages = ["Czy nie zapomniałeś o przepisie " + cookedRecipe.recipe.title + "? Jego przygotowywanie jest wstrzymane.", 
    "Czy pamiętasz wciąż o przepisie " + cookedRecipe.recipe.title + "? Jego przygotowywanie jest wstrzymane.",
    "Przepis " + cookedRecipe.recipe.title + " jest wstrzymany od dłuższego czasu."];
    
    let random = this.randomIntFromInterval(0, messages.length-1);
    this.tts.addMessage(messages[random]);
  }

  randomIntFromInterval(min, max) { // min and max included 
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

}
