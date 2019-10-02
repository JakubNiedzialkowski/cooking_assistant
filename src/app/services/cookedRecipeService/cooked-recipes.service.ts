import { Injectable } from '@angular/core';
import { Recipe, ImageReference } from '../../services/storageService/storage.service';
import { ThrowStmt } from '@angular/compiler';

export interface CookedRecipe {
  recipe: Recipe,
  currentStep: string,
  currentStepIndex: number,
  timeUntilNextStep: number,
  formattedTimeUntilNextStep: string,
  stepProgressPercentage: number,

}

@Injectable({
  providedIn: 'root'
})

export class CookedRecipesService {

  cookedRecipes = [];
  timer;

  constructor() {
    this.startTimer();
  }

  startTimer() {
    if (this.timer)
      clearInterval(this.timer);
    this.timer = setInterval(() => {
      this.cookedRecipes.forEach(cookedRecipe => {
        if (cookedRecipe.timeUntilNextStep <= 0) {
          cookedRecipe.currentStepIndex++;
          if (cookedRecipe.currentStepIndex < cookedRecipe.recipe.steps.length) {
            cookedRecipe.currentStep = cookedRecipe.recipe.steps[cookedRecipe.currentStepIndex];
            cookedRecipe.timeUntilNextStep = cookedRecipe.recipe.stepTimes[cookedRecipe.currentStepIndex];
            cookedRecipe.formattedTimeUntilNextStep = this.convertSecondsToDateString(cookedRecipe.timeUntilNextStep);
            cookedRecipe.stepProgressPercentage = 0;
          }
          else
           this.stopCookingRecipe(cookedRecipe.id);
        }
        else {
          cookedRecipe.timeUntilNextStep--;
          cookedRecipe.stepProgressPercentage = this.calculateProgressPercentage(cookedRecipe.timeUntilNextStep, cookedRecipe.recipe.stepTimes[cookedRecipe.currentStepIndex]);
          cookedRecipe.formattedTimeUntilNextStep = this.convertSecondsToDateString(cookedRecipe.timeUntilNextStep);
        }
      });
    }, 1000);
  }

  startCookingRecipe(Recipe) {
    var newCookedRecipe = {
      recipe: Recipe,
      currentStep: Recipe.steps[0],
      currentStepIndex: 0,
      timeUntilNextStep: Recipe.stepTimes[0],
      formattedTimeUntilNextStep: this.convertSecondsToDateString(Recipe.stepTimes[0]),
      stepProgressPercentage: 0,
    }
    this.cookedRecipes.push(newCookedRecipe);
  }

  stopCookingRecipe(id){
    for(let i=this.cookedRecipes.length-1; i>=0; i--){
      if(this.cookedRecipes[i].recipe.id === id)
        this.cookedRecipes.splice(i,1);
    }
  }


  getCookedRecipes() {
    return this.cookedRecipes;
  }

  getCookedRecipeById(id) {
    var result;
    this.cookedRecipes.forEach(cookedRecipe => {
      if (cookedRecipe.recipe.id === id) {
        result = cookedRecipe;
        return;
      }
    });
    return result;
  }

  isRecipeBeingCooked(id) {
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
}
