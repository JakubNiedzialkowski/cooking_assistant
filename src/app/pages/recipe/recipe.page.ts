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
  
  isIngredientListVisible = false;
  isStepsListVisible = false;

  constructor(private storageService: StorageService,
    private activatedRoute: ActivatedRoute,
    private toastController: ToastController,
    private navController: NavController,
    public alertController: AlertController) { }

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe(paramMap => {
      if(!paramMap.has('recipeId')){
        this.goToHomePage();
        this.showToast("Nie znaleziono podanego przepisu");
        return;
      }
      const recipeId = paramMap.get('recipeId');
      this.storageService.getRecipeById(Number(recipeId)).then(recipe => {
        this.loadedRecipe = recipe;
        console.log(this.loadedRecipe);
      });
    });
  }

  toggleIngredients(){
    this.isIngredientListVisible = !this.isIngredientListVisible;
  }

  toggleSteps(){
    this.isStepsListVisible = !this.isStepsListVisible;
  }

  startCooking(){

  }

  editRecipe(){

  }

  async deleteRecipe(){
    let alertConfirm = await this.alertController.create({
      header: 'Usuń przepis',
      message: 'Czy na pewno chcesz usunąć ten przepis?',
      buttons: [
        {
          text: 'Nie',
          role: 'cancel',
          handler: () => {}
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

  goToHomePage(){
    this.navController.navigateRoot('/menu/home/');
  }


  async showToast(msg) {
    const toast = await this.toastController.create({
      message: msg,
      duration: 2000
    });
    toast.present();
  }

}
