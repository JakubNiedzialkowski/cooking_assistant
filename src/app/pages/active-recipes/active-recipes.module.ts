import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { ActiveRecipesPage } from './active-recipes.page';

const routes: Routes = [
  {
    path: '',
    component: ActiveRecipesPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [ActiveRecipesPage]
})
export class ActiveRecipesPageModule {}
