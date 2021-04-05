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
      this.userInfo = uid;
      this.recipeListCollection = this.afs.collection('users/'+uid+'/recipeList');
      if (this.data.uid) {
        this.uid = this.data.uid;
      }
      this.fetchedRecipe = this.afs.doc('users/'+uid+'/recipeList/'+this.data.uid);
      this.displayRecipe = this.fetchedRecipe.valueChanges();
      console.log(this.displayRecipe);
      this.pageLoaded = Promise.resolve(true);
    });
  }
}

