import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { MenuPage } from './menu.page';

const routes: Routes = [
  {
    path: 'menu',
    component: MenuPage,
    children: [
      { path: 'home', loadChildren: () => import('../home/home.module').then(m => m.HomePageModule) },
      { path: 'about', loadChildren: '../about/about.module#AboutPageModule' },
      {
          path: 'recipe',
          children: [
            {
              path: ':recipeId',
              loadChildren: '../recipe/recipe.module#RecipePageModule',
            }
          ]
      },
      { path: 'active-recipes', loadChildren: './pages/active-recipes/active-recipes.module#ActiveRecipesPageModule' },
    ]
  },
  {
    path: '',
    redirectTo: '/menu/home'
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [MenuPage]
})
export class MenuPageModule {}
