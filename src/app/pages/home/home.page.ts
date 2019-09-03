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
  sampleRecipe: Recipe = {
    id: Date.now(),
    title: 'Przepis',
    steps: ['Pierwszy krok', 'Drugi krok', 'Trzeci krok'],
    stepTimes: [100, 200, 300],
    ingredients: ['Masło'],
    ingredientAmounts: ['500g'],
    image: null,
    popularity: 0,
  };

  //TTS
  locale: string;
  rate: number;

  //STORAGE
  recipes: Recipe[] = [];
  newRecipe: Recipe = <Recipe>{};

  //SPEECH RECOGNITION
  matches: String[];
  isRecording = false;
  commands = {};

  @ViewChild('mylist', {static: false})mylist: IonList;

  constructor(private storageService: StorageService,
    private tts: TextToSpeech,
    private speechRecognition: SpeechRecognition,
    private cd: ChangeDetectorRef,
    private plt: Platform,
    private toastController: ToastController,
    private actionSheetController: ActionSheetController,
    private camera: Camera,
    //private filePath: FilePath,
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

  //CRUD FUNCTIONS
  // CREATE
  addRecipe(Recipe) {
    Recipe.id = Date.now();
    this.storageService.addRecipe(Recipe).then(Recipe => {
      this.showToast('Recipe added!');
      this.loadRecipes(); // Or add it to the array directly
    });
    this.notificationtest();
  }

  // READ
  loadRecipes() {
    this.storageService.getRecipes().then(recipes => {
      this.recipes = recipes;
      console.log(recipes);
    });
  }

  // UPDATE
  updateRecipe(Recipe: Recipe) {
    this.storageService.updateRecipe(Recipe).then(Recipe => {
      this.showToast('Recipe updated!');
      this.mylist.closeSlidingItems(); // Fix or sliding is stuck afterwards
      this.loadRecipes(); // Or update it inside the array directly
    });
    this.annyangTest();
  }

  // DELETE
  deleteRecipe(Recipe: Recipe) {
    this.storageService.deleteRecipe(Recipe.id).then(Recipe => {
      this.showToast('Recipe removed!');
      this.mylist.closeSlidingItems(); // Fix or sliding is stuck afterwards
      this.loadRecipes(); // Or splice it from the array directly
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

  notificationtest(){
    this.localNotifications.schedule({
      id: 1,
      title: 'Tytuł notyfikacji',
      text: 'Pomocnik kuchenny notyfikacja',
      data: { mydata: 'My hidden message this is' },
      trigger: { in: 5, unit: ELocalNotificationTriggerUnit.SECOND},
      foreground: true
    });
  }

  // SPEECH RECOGNITION

  annyangTest() {
    if (annyang) {
      // Let's define a command.
      var commands = {
        'test': function () {
          alert('Hello world!');
        }
      };
      // Add our commands to annyang
      annyang.addCommands(commands);
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

  goToRecipe(recipe){
    this.navController.navigateRoot('/menu/recipe/' + recipe.id);
  }


  //IMAGE LOADING
  // async selectImage() {
  //   const actionSheet = await this.actionSheetController.create({
  //     header: "Select Image source",
  //     buttons: [{
  //       text: 'Load from Library',
  //       handler: () => {
  //         this.takePicture(this.camera.PictureSourceType.PHOTOLIBRARY);
  //       }
  //     },
  //     {
  //       text: 'Use Camera',
  //       handler: () => {
  //         this.takePicture(this.camera.PictureSourceType.CAMERA);
  //       }
  //     },
  //     {
  //       text: 'Cancel',
  //       role: 'cancel'
  //     }
  //     ]
  //   });
  //   await actionSheet.present();
  // }

  // takePicture(sourceType: PictureSourceType) {
  //   var options: CameraOptions = {
  //     quality: 100,
  //     sourceType: sourceType,
  //     saveToPhotoAlbum: false,
  //     correctOrientation: true
  //   };

  //   this.camera.getPicture(options).then(imagePath => {
  //     if (this.plt.is('android') && sourceType === this.camera.PictureSourceType.PHOTOLIBRARY) {
  //       this.filePath.resolveNativePath(imagePath)
  //         .then(filePath => {
  //           let correctPath = filePath.substr(0, filePath.lastIndexOf('/') + 1);
  //           let currentName = imagePath.substring(imagePath.lastIndexOf('/') + 1, imagePath.lastIndexOf('?'));
  //           this.copyFileToLocalDirectory(correctPath, currentName, this.storageService.generateImageName());
  //           //return this.copyFileToLocalDirectory(correctPath, currentName, this.storageService.generateImageName());
  //         });
  //     } else {
  //       var currentName = imagePath.substr(imagePath.lastIndexOf('/') + 1);
  //       var correctPath = imagePath.substr(0, imagePath.lastIndexOf('/') + 1);
  //       this.copyFileToLocalDirectory(correctPath, currentName, this.storageService.generateImageName());
  //       //return this.copyFileToLocalDirectory(correctPath, currentName, this.storageService.generateImageName());
  //     }
  //   });
  // }

  // copyFileToLocalDirectory(namePath, currentName, newFileName) {
  //   this.file.copyFile(namePath, currentName, this.file.dataDirectory, newFileName).then(success => {
  //       let filePath = this.file.dataDirectory + newFileName;
  //       let resourcePath = this.storageService.getImageResourcePath(filePath);
  //       this.sampleRecipe.image = <ImageReference>{name:newFileName, resourcePath, filePath};
  //   }, error => {
  //       return null;
  //   });
  //   return null;
  // }
}
