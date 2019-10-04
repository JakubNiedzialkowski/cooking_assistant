import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { StorageService, Recipe, ImageReference } from '../../services/storageService/storage.service';
import { CookedRecipesService } from '../../services/cookedRecipeService/cooked-recipes.service';
import { ToastController, NavController, AlertController, Platform, ActionSheetController } from '@ionic/angular';

import { Camera, CameraOptions, PictureSourceType } from '@ionic-native/Camera/ngx';
import { FilePath } from '@ionic-native/file-path/ngx';
import { File } from '@ionic-native/File/ngx';


@Component({
  selector: 'app-recipe',
  templateUrl: './recipe.page.html',
  styleUrls: ['./recipe.page.scss'],
})
export class RecipePage implements OnInit {

  loadedRecipe: Recipe;
  cookedRecipeData;

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

  isRecipeCooked = false;

  isIngredientListVisible = false;
  isStepsListVisible = false;

  isEditPanelVisible = false;

  constructor(private storageService: StorageService,
    private cookedRecipes: CookedRecipesService,
    private activatedRoute: ActivatedRoute,
    private toastController: ToastController,
    private navController: NavController,
    private alertController: AlertController,
    private platform: Platform,
    private actionSheetController: ActionSheetController,
    private camera: Camera,
    private filePath: FilePath,
    private file: File,
  ) {
    platform.backButton.subscribeWithPriority(0, ()=>{
      if(this.isEditPanelVisible){
        this.cancelEdit();
      }
      else if(this.isRecipeCooked){
        this.goToCookedRecipesPage();
      }
      else{
        this.goToHomePage();
      }
    });
   }

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe(paramMap => {
      if (!paramMap.has('recipeId')) {
        this.goToHomePage();
        this.showToast("Nie znaleziono podanego przepisu");
        return;
      }
      const recipeId = Number(paramMap.get('recipeId'));
      this.isRecipeCooked = this.cookedRecipes.isRecipeBeingCooked(recipeId);
      if (this.isRecipeCooked) {
        this.cookedRecipeData = this.cookedRecipes.getCookedRecipeById(recipeId);
        this.loadedRecipe = this.cookedRecipeData.recipe;
      }
      else {
        this.storageService.getRecipeById(recipeId).then(recipe => {
          this.loadedRecipe = recipe;
        });
      }

    });
  }

  startCooking() {
    this.cookedRecipes.startCookingRecipe(this.loadedRecipe);
    this.cookedRecipeData = this.cookedRecipes.getCookedRecipeById(this.loadedRecipe.id);
    this.isRecipeCooked = true;
  }

  stopCooking() {
    this.cookedRecipes.stopCookingRecipe(this.cookedRecipeData.recipe.id);
    this.isRecipeCooked = false;
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

  async selectImage() {
    const actionSheet = await this.actionSheetController.create({
      header: "Wybierz źródło obrazu",
      buttons: [{
        text: 'Załaduj z galerii',
        handler: () => {
          this.takePicture(this.camera.PictureSourceType.PHOTOLIBRARY);
        }
      },
      {
        text: 'Zrób zdjęcie',
        handler: () => {
          this.takePicture(this.camera.PictureSourceType.CAMERA);
        }
      },
      {
        text: 'Anuluj',
        role: 'cancel'
      }
      ]
    });
    await actionSheet.present();
  }

  takePicture(sourceType: PictureSourceType) {
    var options: CameraOptions = {
      quality: 100,
      sourceType: sourceType,
      saveToPhotoAlbum: false,
      correctOrientation: true
    };

    this.camera.getPicture(options).then(imagePath => {
      if (this.platform.is('android') && sourceType === this.camera.PictureSourceType.PHOTOLIBRARY) {
        this.filePath.resolveNativePath(imagePath)
          .then(filePath => {
            let correctPath = filePath.substr(0, filePath.lastIndexOf('/') + 1);
            let currentName = imagePath.substring(imagePath.lastIndexOf('/') + 1, imagePath.lastIndexOf('?'));
            this.copyFileToLocalDirectory(correctPath, currentName, this.storageService.generateImageName());
          });
      } else {
        var currentName = imagePath.substr(imagePath.lastIndexOf('/') + 1);
        var correctPath = imagePath.substr(0, imagePath.lastIndexOf('/') + 1);
        this.copyFileToLocalDirectory(correctPath, currentName, this.storageService.generateImageName());
      }
    });
  }

  copyFileToLocalDirectory(namePath, currentName, newFileName) {
    this.file.copyFile(namePath, currentName, this.file.dataDirectory, newFileName).then(success => {
      let filePath = this.file.dataDirectory + newFileName;
      let resourcePath = this.storageService.getImageResourcePath(filePath);
      this.loadedRecipe.image = <ImageReference>{ name: newFileName, resourcePath, filePath };
    }, error => {
      return null;
    });
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

  goToNextStep() {
    let success = this.cookedRecipes.goToNextStep(this.cookedRecipeData);
    if (!success) {
      this.showToast("Brak dalszych kroków.");
    }
  }

  goToPreviousStep() {
    let success = this.cookedRecipes.goToPreviousStep(this.cookedRecipeData);
    if (!success) {
      this.showToast("Brak wcześniejszych kroków.");
    }
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

  goToCookedRecipesPage(){
    this.navController.navigateRoot('/menu/active-recipes/');
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
