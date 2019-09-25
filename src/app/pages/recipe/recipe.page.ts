import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { StorageService, Recipe } from '../../services/storage.service';
import { ToastController, NavController, AlertController } from '@ionic/angular';


@Component({
  selector: 'app-recipe',
  templateUrl: './recipe.page.html',
  styleUrls: ['./recipe.page.scss'],
})
export class RecipePage implements OnInit {

  loadedRecipe: Recipe;
  formattedTimes = [];
  // mockRecipe: Recipe = {
  //   id: null,
  //   title: '',
  //   steps: [],
  //   stepTimes: [],
  //   ingredients: [],
  //   ingredientAmounts: [],
  //   image: null,
  //   popularity: null,
  // };

  isIngredientListVisible = false;
  isStepsListVisible = false;

  isEditPanelVisible = false;

  constructor(private storageService: StorageService,
    private activatedRoute: ActivatedRoute,
    private toastController: ToastController,
    private navController: NavController,
    public alertController: AlertController,
  ) { }

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe(paramMap => {
      if (!paramMap.has('recipeId')) {
        this.goToHomePage();
        this.showToast("Nie znaleziono podanego przepisu");
        return;
      }
      const recipeId = paramMap.get('recipeId');
      this.storageService.getRecipeById(Number(recipeId)).then(recipe => {
        this.loadedRecipe = recipe;
      });
    });
  }

  startCooking() {

  }

  editRecipe() {
    this.formattedTimes = [];
    this.loadedRecipe.stepTimes.forEach(stepTime => {
      this.formattedTimes.push(this.convertSecondsToDateString(stepTime));
    });
    this.isEditPanelVisible = true;
  }

  cancelEdit() {
    this.isEditPanelVisible = false;
    this.reloadRecipe();
  }

  applyChanges() {
    this.loadedRecipe.stepTimes = this.convertFormattedTimesToSeconds(this.formattedTimes);
    this.updateRecipe(this.loadedRecipe);
    this.isEditPanelVisible = false;
  }

  updateRecipe(Recipe: Recipe) {
    this.storageService.updateRecipe(Recipe).then(Recipe => {
      this.showToast('Przepis pomyślnie zaktualizowany.');
    });
  }

  async deleteRecipe() {
    let alertConfirm = await this.alertController.create({
      header: 'Usuń przepis',
      message: 'Czy na pewno chcesz usunąć ten przepis?',
      buttons: [
        {
          text: 'Nie',
          role: 'cancel',
          handler: () => { }
        },
        {
          text: 'Tak',
          handler: () => {
            this.storageService.deleteRecipe(this.loadedRecipe.id).then(Recipe => {
              this.goToHomePage();
              this.showToast('Przepis został usunięty.');
            });
          }
        }
      ]
    });
    alertConfirm.present();
  }

  reloadRecipe() {
    this.storageService.getRecipeById(this.loadedRecipe.id).then(recipe => {
      this.loadedRecipe = recipe;
    });
  }

  addNewStep() {
    this.loadedRecipe.steps.push('Nowy krok');
    this.loadedRecipe.stepTimes.push(0);
    this.formattedTimes.push(this.convertSecondsToDateString(0));
  }

  deleteStep(index) {
    this.loadedRecipe.steps.splice(index, 1);
    this.loadedRecipe.stepTimes.splice(index, 1);
    this.formattedTimes.splice(index, 1);
  }

  addNewIngredient() {
    this.loadedRecipe.ingredients.push('Nowy składnik');
    this.loadedRecipe.ingredientAmounts.push('0');
  }

  deleteIngredient(index) {
    this.loadedRecipe.ingredients.splice(index, 1);
    this.loadedRecipe.ingredientAmounts.splice(index, 1);
  }

  toggleIngredients() {
    this.isIngredientListVisible = !this.isIngredientListVisible;
  }

  toggleSteps() {
    this.isStepsListVisible = !this.isStepsListVisible;
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

  convertDateStringToSeconds(time) {
    var seconds = 0;
    time.split(':').forEach((item, index) => {
      seconds += Number(item) * 3600 / Math.pow(60, index);
    });
    return seconds;
  }

  convertFormattedTimesToSeconds(formattedTimes) {
    var timesInSeconds = [];
    formattedTimes.forEach((time, index) => {
      timesInSeconds[index] = this.convertDateStringToSeconds(time);
    });
    return timesInSeconds;
  }

  goToHomePage() {
    this.navController.navigateRoot('/menu/home/');
  }

  async showToast(msg) {
    const toast = await this.toastController.create({
      message: msg,
      duration: 2000
    });
    toast.present();
  }

  trackById(index, item) {
    return index;
  }


}
