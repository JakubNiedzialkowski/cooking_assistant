import { Component } from '@angular/core';

import { StorageService, Recipe, ImageReference } from '../../services/storageService/storage.service';
import { CookedRecipesService } from '../../services/cookedRecipeService/cooked-recipes.service';
import { SpeechrecognitionService } from '../../services/speechRecognition/speechrecognition.service';
import { TtsManagerService } from '../../services/ttsManager/tts-manager.service';
import { TimerService } from '../../services/timerService/timer.service';
import { SettingsService } from 'src/app/services/settings/settings.service';

import { ActionSheetController, Platform, ToastController, NavController } from '@ionic/angular';

import { Camera, CameraOptions, PictureSourceType } from '@ionic-native/Camera/ngx';
import { FilePath } from '@ionic-native/file-path/ngx';
import { File } from '@ionic-native/File/ngx';

import { LocalNotifications, ELocalNotificationTriggerUnit } from '@ionic-native/local-notifications/ngx';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  //ADD INGREDIENTS LIST
  mockRecipe: Recipe = {
    id: Date.now(),
    title: 'Nazwa przepisu',
    steps: ['Pierwszy krok'],
    stepTimes: [100],
    ingredients: ['Składnik'],
    ingredientAmounts: ['500g'],
    image: null,
    popularity: 0,
  };
  formattedTimes = [];

  //STORAGE
  recipes: Recipe[] = [];
  recipesToDisplay: Recipe[] = [];
  newRecipe: Recipe = <Recipe>{};

  isRecipeFormActive = false;
  isAnnyangStarted = true;


  constructor(private storageService: StorageService,
    private cookedRecipes: CookedRecipesService,
    private tts: TtsManagerService,
    private speechRecognition: SpeechrecognitionService,
    private plt: Platform,
    private toastController: ToastController,
    private actionSheetController: ActionSheetController,
    private camera: Camera,
    private filePath: FilePath,
    private file: File,
    private navController: NavController,
    private timer: TimerService,
    private settings: SettingsService,
  ) {
    this.plt.ready().then(() => {
      this.loadRecipes();
      this.timer.startService();
      this.settings.startService();
    });

    this.plt.backButton.subscribeWithPriority(0, ()=>{
      if(this.isRecipeFormActive){
        this.hideRecipeForm();
      }
    });
  }

  // CREATE
  addRecipe(Recipe) {
    Recipe.stepTimes = this.convertFormattedTimesToSeconds(this.formattedTimes);
    Recipe.id = Date.now();
    this.storageService.addRecipe(Recipe).then(Recipe => {
      this.showToast('Przepis został dodany!');
      this.loadRecipes();
    });
    this.hideRecipeForm();
  }

  // READ
  loadRecipes() {
    this.storageService.getRecipes().then(recipes => {
      this.recipes = recipes;
      this.recipesToDisplay = recipes;
    });
  }

  // TOASTS
  async showToast(msg) {
    const toast = await this.toastController.create({
      message: msg,
      duration: 2000
    });
    toast.present();
  }

  reccomendRecipe(){
    let elligibleRecipes = this.recipes.sort((a,b) => a.popularity-b.popularity);
    for(var i = elligibleRecipes.length-1; i>=0; i--){
      if(this.cookedRecipes.isRecipeBeingCooked(elligibleRecipes[i].id))
        elligibleRecipes.splice(i,1);
    }
    let randomFactor = this.randomIntFromInterval(1,3);
    let reccomendedRecipe = elligibleRecipes[elligibleRecipes.length-randomFactor];
    this.goToRecipe(reccomendedRecipe);
  }

  randomIntFromInterval(min, max) { // min and max included 
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  addNewStep() {
    this.mockRecipe.steps.push('Nowy krok');
    this.mockRecipe.stepTimes.push(0);
    this.formattedTimes.push(this.convertSecondsToDateString(0));
  }

  deleteStep(index) {
    this.mockRecipe.steps.splice(index, 1);
    this.mockRecipe.stepTimes.splice(index, 1);
    this.formattedTimes.splice(index, 1);
  }

  addNewIngredient() {
    this.mockRecipe.ingredients.push('Nowy składnik');
    this.mockRecipe.ingredientAmounts.push('0');
  }

  deleteIngredient(index) {
    this.mockRecipe.ingredients.splice(index, 1);
    this.mockRecipe.ingredientAmounts.splice(index, 1);
  }


  goToRecipe(recipe) {
    this.navController.navigateRoot('/menu/recipe/' + recipe.id);
  }

  handleSearchbarChange(event) {
    let query = event.target.value.toLowerCase();
    let temp = [];
    this.recipes.filter(recipe => {
      if (recipe.title.toLowerCase().includes(query))
        temp.push(recipe);
    });
    this.recipesToDisplay = temp;
  }

  displayRecipeForm() {
    this.initializeFormattedTimes();
    this.isRecipeFormActive = true;
  }

  hideRecipeForm() {
    this.isRecipeFormActive = false;
    this.resetMockRecipe();
  }

  resetMockRecipe() {
    this.mockRecipe = {
      id: Date.now(),
      title: 'Nazwa przepisu',
      steps: ['Pierwszy krok'],
      stepTimes: [100],
      ingredients: ['Składnik'],
      ingredientAmounts: ['500g'],
      image: null,
      popularity: 0,
    };
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

  initializeFormattedTimes() {
    this.mockRecipe.stepTimes.forEach(stepTime => {
      this.formattedTimes.push(this.convertSecondsToDateString(stepTime));
    });
  }

  trackById(index, item) {
    return index;
  }


  //IMAGE LOADING
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
      if (this.plt.is('android') && sourceType === this.camera.PictureSourceType.PHOTOLIBRARY) {
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
      this.mockRecipe.image = <ImageReference>{ name: newFileName, resourcePath, filePath };
    }, error => {
      return null;
    });
  }

}
