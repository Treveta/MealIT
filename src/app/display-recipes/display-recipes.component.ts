import {Component, Inject, Input, OnInit} from '@angular/core';
import {AngularFirestore} from '@angular/fire/firestore';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {AuthService} from '../services/auth.service';


@Component({

  selector: 'app-display-recipes',

  templateUrl: './display-recipes.component.html',

  styleUrls: ['./display-recipes.component.css'],

})
/**
 * Component that displays the information of a recipe
 */
export class DisplayRecipesComponent implements OnInit {
  @Input()
    uid: string;
  userInfo: unknown;
  recipeListCollection: any;
  fetchedRecipe: any;
  displayRecipe: any;
  pageLoaded: Promise<boolean>;
  /**
   * Creates the display component
   */
  constructor(@Inject(MAT_DIALOG_DATA) public data: {uid: string}, private afs: AngularFirestore, public auth: AuthService) {

  }

  /**
   * Fetches the information of the recipe that was selected
   */
  ngOnInit(): void {
    this.auth.getUid().then((uid) => {
      // fetches user id
      this.userInfo = uid;
      // fetches the recipe list of the user
      this.recipeListCollection = this.afs.collection('users/'+uid+'/recipeList');
      // compares the user ids of the clicked recipe and user to match
      if (this.data.uid) {
        this.uid = this.data.uid;
      }
      this.fetchedRecipe = this.afs.doc('users/'+uid+'/recipeList/'+this.data.uid);
      // displays the data of recipe
      this.displayRecipe = this.fetchedRecipe.valueChanges();
      // loads the page
      this.pageLoaded = Promise.resolve(true);
    });
  }
}

