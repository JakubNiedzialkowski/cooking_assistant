import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  // { path: '', redirectTo: 'home', pathMatch: 'full' },
  // { path: 'home', loadChildren: () => import('./pages/home/home.module').then(m => m.HomePageModule) },
  // {
  //   path: 'recipe',
  //   children: [
  //     {
  //       path: ':recipeId',
  //       loadChildren: './pages/recipe/recipe.module#RecipePageModule',
  //     }
  //   ]
  // },
  // { path: 'about', loadChildren: './pages/about/about.module#AboutPageModule' },
  // { path: 'menu', loadChildren: './pages/menu/menu.module#MenuPageModule' },
  { path: '', loadChildren: './pages/menu/menu.module#MenuPageModule' },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
