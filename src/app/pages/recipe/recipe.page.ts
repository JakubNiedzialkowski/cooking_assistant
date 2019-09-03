import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { StorageService, Recipe } from '../../services/storage.service';


@Component({
  selector: 'app-recipe',
  templateUrl: './recipe.page.html',
  styleUrls: ['./recipe.page.scss'],
})
export class RecipePage implements OnInit {

  loadedRecipe: Recipe;

  constructor(private storageService: StorageService,
    private activatedRoute: ActivatedRoute,) { }

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe(paramMap => {
      if(!paramMap.has('recipeId')){
        //redirect
        return;
      }
      const recipeId = paramMap.get('recipeId');
      this.storageService.getRecipeById(Number(recipeId)).then(recipe => {
        this.loadedRecipe = recipe;
        console.log(this.loadedRecipe);
      });
    });
  }

}
