import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AppRoutingModule, routingComponents } from './app-routing.module';
import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { AppComponent } from './app.component';
import { LoginPageComponent } from './login-page/login-page.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { ModalModule } from './modal-functionality';
import { AuthGuard } from './auth.guard';
import { environment } from './../environments/environment';
import { DatabaseHelperComponent } from './database-helper/database-helper.component';
import { SearchRecipesComponent } from './search-recipes/search-recipes.component';
import { MatExpansionModule } from '@angular/material/expansion'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';




const config = {
  apiKey: environment.apiKey,
  authDomain: "mealit-cfde0.firebaseapp.com",
  databaseURL: "https://mealit-cfde0.firebaseio.com",
  projectId: "mealit-cfde0",
  storageBucket: "mealit-cfde0.appspot.com",
  messagingSenderId: "368211399714",
  appId: "1:368211399714:web:4473496d87cf2b9af3a67b",
  measurementId: "G-BXB0H1W567"
}

@NgModule({
  declarations: [
    AppComponent,
    routingComponents,
    UserProfileComponent,
    DatabaseHelperComponent,
    SearchRecipesComponent,
  ],
  imports: [
    BrowserModule,
    CommonModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    AngularFireModule.initializeApp(config),
    AngularFirestoreModule,
    AngularFireAuthModule,
    ModalModule,
    MatExpansionModule,
    BrowserAnimationsModule,
    MatInputModule,
    MatIconModule,
    MatSelectModule,
    MatButtonModule,
    MatCardModule,
  ],
  providers: [ AuthGuard ],
  bootstrap: [AppComponent]
})
export class AppModule { }

