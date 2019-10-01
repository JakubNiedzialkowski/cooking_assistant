import { Injectable } from '@angular/core';
import { Recipe, ImageReference } from '../../services/storageService/storage.service';

export interface CookedRecipe {
  recipe: Recipe,
  currentStep: string,
  currentStepIndex: number,
  timeUntilNextStep: number
}

@Injectable({
  providedIn: 'root'
})

export class CookedRecipesService {

  cookedRecipes = [];
  timer;

  constructor() { }

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
          }
        }
        else
          cookedRecipe.timeUntilNextStep--;
      });
      console.log("cooked recipes service timer");
    }, 1000);
  }

  addCookedRecipe(Recipe) {
    var newCookedRecipe = {
      recipe: Recipe,
      currentStep: Recipe.steps[0],
      currentStepIndex: 0,
      timeUntilNextStep: Recipe.stepTimes[0]
    }
    this.cookedRecipes.forEach(cookedRecipe => {

    });
    this.cookedRecipes.push(newCookedRecipe);
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
}
