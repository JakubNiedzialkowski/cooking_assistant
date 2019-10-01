import { Component, OnInit } from '@angular/core';

import { CookedRecipesService } from '../../services/cookedRecipeService/cooked-recipes.service';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-active-recipes',
  templateUrl: './active-recipes.page.html',
  styleUrls: ['./active-recipes.page.scss'],
})
export class ActiveRecipesPage implements OnInit {

  activeRecipes;
  recipesToDisplay;

  constructor(private cookedRecipes: CookedRecipesService,
  private navController: NavController
  ) { }

  ngOnInit() {
    this.activeRecipes = this.cookedRecipes.getCookedRecipes();
    this.recipesToDisplay = this.activeRecipes;
  }

  goToRecipe(recipe) {
    this.navController.navigateRoot('/menu/recipe/' + recipe.id);
  }

  handleSearchbarChange(event) {
    let query = event.target.value.toLowerCase();
    let temp = [];
    this.activeRecipes.filter(activeRecipe => {
      if (activeRecipe.recipe.title.toLowerCase().includes(query))
        temp.push(activeRecipe);
    });
    this.recipesToDisplay = temp;
  }

}
