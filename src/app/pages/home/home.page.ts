import { Component, ViewChild } from '@angular/core';

import { TextToSpeech } from '@ionic-native/text-to-speech/ngx';
import { SpeechRecognition } from '@ionic-native/speech-recognition/ngx';

import { StorageService, Recipe, ImageReference } from '../../services/storage.service';

import { ActionSheetController, Platform, ToastController, IonList, NavController } from '@ionic/angular';
import { ChangeDetectorRef } from '@angular/core';

import { Camera, CameraOptions, PictureSourceType } from '@ionic-native/Camera/ngx';
import { FilePath } from '@ionic-native/file-path/ngx';
import { File } from '@ionic-native/File/ngx';

import { LocalNotifications, ELocalNotificationTriggerUnit } from '@ionic-native/local-notifications/ngx';

declare var annyang: any;

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

  //TTS
  locale: string;
  rate: number;

  //STORAGE
  recipes: Recipe[] = [];
  recipesToDisplay: Recipe[] = [];
  newRecipe: Recipe = <Recipe>{};

  //SPEECH RECOGNITION
  matches: String[];
  isRecording = false;
  commands = {};

  isRecipeFormActive = false;

  //@ViewChild('mylist', { static: false }) mylist: IonList;

  constructor(private storageService: StorageService,
    private tts: TextToSpeech,
    private speechRecognition: SpeechRecognition,
    private cd: ChangeDetectorRef,
    private plt: Platform,
    private toastController: ToastController,
    private actionSheetController: ActionSheetController,
    private camera: Camera,
    private filePath: FilePath,
    private file: File,
    private localNotifications: LocalNotifications,
    private navController: NavController,
  ) {
    this.plt.ready().then(() => {
      this.loadRecipes();
      this.locale = 'pl-PL';
      this.rate = 1;
      // this.localNotifications.on('click').subscribe(result => {
      // });
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
    this.notificationtest();
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

  //TTS

  playText(message) {
    this.tts.speak({
      text: message.toString(),
      locale: this.locale,
      rate: this.rate,
    })
      .then(() => console.log('Success'))
      .catch((reason: any) => console.log(reason));
  }

  //NOTIFICATIONS

  notificationtest() {
    this.localNotifications.schedule({
      id: 1,
      title: 'Tytuł notyfikacji',
      text: 'Pomocnik kuchenny notyfikacja',
      data: { mydata: 'My hidden message this is' },
      trigger: { in: 5, unit: ELocalNotificationTriggerUnit.SECOND },
      foreground: true
    });
  }

  // SPEECH RECOGNITION

  annyangTest() {
    if (annyang) {
      annyang.setLanguage('pl');
      annyang.debug(true);
      // Let's define a command.
      var commands = {
        'test': function () {
          alert('Hello world!');
        },
        'Gotuj *nazwaPrzepisu': function (nazwaPrzepisu) {
          alert('Rozpoczynam gotowanie ' + nazwaPrzepisu);
        }
      };
      // Add our commands to annyang
      annyang.addCommands(commands);
      // Start listening.
      annyang.start();
    }
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

  getPermission() {
    this.speechRecognition.hasPermission()
      .then((hasPermission: boolean) => {
        if (!hasPermission) {
          this.speechRecognition.requestPermission();
        }
      });
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

  resetMockRecipe(){
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

  initializeFormattedTimes(){
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
        this.mockRecipe.image = <ImageReference>{name:newFileName, resourcePath, filePath};
    }, error => {
        return null;
    });
  }

}
