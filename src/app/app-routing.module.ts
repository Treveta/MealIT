/* eslint-disable require-jsdoc */
import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {ItemListComponent} from './item-list/item-list.component';
import {CreateRecipeComponent} from './create-recipe/create-recipe.component';
import {TopBarComponent} from './top-bar/top-bar.component';
import {LoginPageComponent} from './login-page/login-page.component';
import {UserProfileComponent} from './user-profile/user-profile.component';
import {AuthGuard} from './auth.guard';
import {SearchRecipesComponent} from './search-recipes/search-recipes.component';
import {CalenderComponent} from './calender/calender.component';
import {FoodStorageComponent} from './food-storage/food-storage.component';


const routes: Routes = [
  {path: 'itemList', component: ItemListComponent, canActivate: [AuthGuard]},
  {path: 'createRecipe', component: CreateRecipeComponent, canActivate: [AuthGuard]},
  {path: 'userLogin', component: UserProfileComponent},
  {path: '', component: LoginPageComponent},
  {path: 'searchRecipes', component: SearchRecipesComponent},
  {path: 'calender', component: CalenderComponent},
  {path: 'foodStorage', component: FoodStorageComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {relativeLinkResolution: 'legacy'})],
  exports: [RouterModule],
})
export class AppRoutingModule { }
export const routingComponents = [CreateRecipeComponent, ItemListComponent, TopBarComponent, LoginPageComponent, CalenderComponent, FoodStorageComponent];
