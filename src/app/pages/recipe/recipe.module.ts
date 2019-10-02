import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { RecipePage } from './recipe.page';

import { NgCircleProgressModule } from 'ng-circle-progress';

const routes: Routes = [
  {
    path: '',
    component: RecipePage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NgCircleProgressModule.forRoot({
      "radius": "100",
      "space": "-10",
      "toFixed": "0",
      "maxPercent": "100",
      "outerStrokeGradient": true,
      "outerStrokeWidth": "12",
      "outerStrokeColor": "#4882c2",
      "outerStrokeGradientStopColor": "#53a9ff",
      "innerStrokeColor": "#e7e8ea",
      "innerStrokeWidth": "12",
      "titleFontWeight": "500",
      "subtitleFontWeight": "500",
      "animation": false,
      "animateTitle": false,
      "animationDuration": 300,
      "showUnits": false,
      "showSubtitle": false,
      "showBackground": false,
      "clockwise": false
    }),
    RouterModule.forChild(routes),
  ],
  declarations: [RecipePage]
})
export class RecipePageModule { }
