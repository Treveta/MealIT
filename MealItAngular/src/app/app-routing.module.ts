import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ItemListComponent } from './item-list/item-list.component';
import { CreateRecipeComponent } from './create-recipe/create-recipe.component';
import { TopBarComponent } from './top-bar/top-bar.component';
import { LoginPageComponent } from './login-page/login-page.component';


const routes: Routes = [
  { path: 'itemList', component: ItemListComponent },
  { path: 'createRecipe', component: CreateRecipeComponent},
  { path: 'login', component: LoginPageComponent},
  { path: '',   redirectTo: '/login', pathMatch: 'full' },
]

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
export const routingComponents = [CreateRecipeComponent, ItemListComponent, TopBarComponent, LoginPageComponent]
