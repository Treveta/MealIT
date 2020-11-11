import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AuthService } from 'app/services/auth.service';
import { Observable, Subject, combineLatest } from 'rxjs'
import searchFuse from '../scripts/fuseSetup'
import FuzzySearch from 'fuzzy-search'
import mocker from 'mocker-data-generator'



@Component({
  selector: 'app-search-recipes',
  templateUrl: './search-recipes.component.html',
  styleUrls: ['./search-recipes.component.css']
})
export class SearchRecipesComponent implements OnInit {
  
  searchTerm: string;
  userInfo;
  collectionPath;
  arrayOfTerms;

  startAt = new Subject();
  endAt = new Subject();

  startobs = this.startAt.asObservable();
  endobs = this.endAt.asObservable();

  recipes;

  userRecipes;
  recipeFuse;
  fuseResults;

  ingredients;

  ingredientList;

  panelOpenState = false;
  previousUID = 0;
  ingredientListLoading = [{Loading: true}]

  constructor(private afs: AngularFirestore, private authService: AuthService) { 

    
    
  }

  ngOnInit(): void {
    this.authService.getUid().then((uid) => {
      this.userInfo = uid;
      this.collectionPath = 'users/' + uid + '/recipeList'
      this.listRecipes(this.collectionPath).then((list) => {
        this.userRecipes = list;
      })
    });
  }

  searchFuzzy() {
    this.recipeFuse = new FuzzySearch(this.userRecipes, ['recipeName'], {keys: ['recipeName']})
    this.fuseResults = this.recipeFuse.search(this.searchTerm);
  }

  selectRecipe(recipe){
    console.log(recipe.uid)
  }

  fetchRecipe(uid){
    if(uid == this.previousUID && this.panelOpenState == false){
      this.ingredientList = this.ingredientListLoading
      this.previousUID = 0;
    }else if (uid != this.previousUID && this.panelOpenState == true){
      this.ingredientList = this.ingredientListLoading
      this.previousUID = uid;
      let ingredientPath = 'users/' + this.userInfo + '/recipeList/' + uid + '/ingredients'
      this.listIngredients(ingredientPath).then((list) => {
        this.ingredientList = list
      })
    }else{
      this.previousUID = uid;
      let ingredientPath = 'users/' + this.userInfo + '/recipeList/' + uid + '/ingredients'
      this.listIngredients(ingredientPath).then((list) => {
        this.ingredientList = list
      })
    }
  }

  getNumberOfRecipes(){
    console.log(this.userRecipes.length);
  }

  async addData() {
    var recipeScheme = {
      recipeName: {faker: 'random.words'},
      calories: {faker: 'random.number'},
      servings: {faker: 'random.number'}
    }
    var ingredientScheme = {
      ingredientName: {faker: 'random.word'},
      calories: {faker: 'random.number'},
      unit: {faker: 'random.word'}
    }
    let numAdded = 100;
    for(let i = 0; i < numAdded; i++){
      let data = mocker()
        .schema('recipe', recipeScheme, 1)
        .schema('ingredients', ingredientScheme, 5)
        .buildSync();
          console.log(data.recipe);
          console.log(data.ingredients)
          let documentAdded = await this.afs.collection(this.collectionPath).add(data.recipe[0]);
          this.afs.collection(this.collectionPath).doc(documentAdded.id).update({uid: documentAdded.id});
          this.ingredients = this.afs.collection('users/'+this.userInfo+'/recipeList/'+ documentAdded.id + '/ingredients');
          for(let i = 0; i < data.ingredients.length; i++){
            this.ingredients.add(data.ingredients[i]);
          }
    }  
  }

  listRecipes(path) {
    return this.afs
      .collection(path)
      .get().toPromise()
      .then(snapshot => {
        const list = [];
  
        snapshot.forEach(doc => {
          const data = doc.data()
          if(data.recipeName != null){
            data.id = doc.id;
            list.push(data);
          }
        });
        return list;
      })
      .catch(err => {
        console.log('Error getting documents', err);
      });
  }

  listIngredients(path) {
    return this.afs
      .collection(path)
      .get().toPromise()
      .then(snapshot => {
        const list = [];
  
        snapshot.forEach(doc => {
          const data = doc.data()
          data.id = doc.id;
          list.push(data);
        });
        console.log(list)
        return list;
      })
      .catch(err => {
        console.log('Error getting documents', err);
      });
  }

}
