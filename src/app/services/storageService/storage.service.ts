import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';

import { File } from '@ionic-native/File/ngx';
import { WebView } from '@ionic-native/ionic-webview/ngx';
import { FilePath } from '@ionic-native/file-path/ngx';
import { Camera } from '@ionic-native/Camera/ngx';

export interface ImageReference {
  name: string,
  resourcePath: string,
  filePath: string
}

export interface Recipe {
  id: number,
  title: string,
  steps: string[],
  stepTimes: number[],
  ingredients: string[],
  ingredientAmounts: string[],
  image: ImageReference,
  popularity: number
}

const RECIPES_KEY = 'userRecipes';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor(private storage: Storage,
    private camera: Camera,
    private file: File,
    private webview: WebView,
    private filePath: FilePath,
    ) { }

  addRecipe(Recipe: Recipe): Promise<any> {
    return this.storage.get(RECIPES_KEY).then((recipes: Recipe[]) => {
      if (recipes) {
        recipes.push(Recipe);
        return this.storage.set(RECIPES_KEY, recipes);
      } else {
        return this.storage.set(RECIPES_KEY, [Recipe]);
      }
    });
  }

  getRecipes(): Promise<Recipe[]> {
    return this.storage.get(RECIPES_KEY);
  }

  getRecipeById(recipeId: number) {
    return this.storage.get(RECIPES_KEY).then((recipes: Recipe[]) => {
      for (let r of recipes) {
        if (r.id === recipeId) {
          return r;
        }
      }
    });
  }

  getRecipeByTitle(recipeTitle:string){
    this.storage.get(RECIPES_KEY).then((recipes: Recipe[]) => {
      for (let r of recipes) {
        if (r.title === recipeTitle) {
          return r;
        }
      }});
  }

  updateRecipe(Recipe: Recipe): Promise<any> {
    return this.storage.get(RECIPES_KEY).then((recipes: Recipe[]) => {
      if (!recipes || recipes.length === 0) {
        return null;
      }

      let newRecipes: Recipe[] = [];

      for (let r of recipes) {
        if (r.id === Recipe.id) {
          newRecipes.push(Recipe);
        } else {
          newRecipes.push(r);
        }
      }

      return this.storage.set(RECIPES_KEY, newRecipes);
    });
  }

  deleteRecipe(id: number): Promise<Recipe> {
    return this.storage.get(RECIPES_KEY).then((recipes: Recipe[]) => {
      if (!recipes || recipes.length === 0) {
        return null;
      }

      var toKeep: Recipe[] = [];

      for (let i of recipes) {
        if (i.id !== id) {
          toKeep.push(i);
        }
      }
      return this.storage.set(RECIPES_KEY, toKeep);
    });
  }

  increasePopularity(Recipe:Recipe){
    Recipe.popularity++;
    this.updateRecipe(Recipe);
  }

  getImageResourcePath(img) {
    if (img === null) {
      return '';
    } else {
      let converted = this.webview.convertFileSrc(img);
      return converted;
    }
  }

  generateImageName() {
    var d = new Date(),
      n = d.getTime(),
      newFileName = n + ".jpg";
    return newFileName;
  }
}