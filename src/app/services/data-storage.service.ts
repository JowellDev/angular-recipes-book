import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, take, tap } from 'rxjs/operators';
import { Recipe } from '../shared/recipe.model';
import { AuthService } from './auth.service';
import { RecipeService } from './recipe.service';

@Injectable({
  providedIn: 'root',
})
export class DataStorageService {
  url: string =
    'https://recipe-book-5d69f-default-rtdb.firebaseio.com/recipes.json';

  constructor(private http: HttpClient, private recipeService: RecipeService) {}

  storeRecipes() {
    const recipes: Recipe[] = this.recipeService.getRecipes();
    if (recipes.length > 0) {
      this.http
        .put(this.url, recipes)
        .subscribe((response) => console.log(response));
    }
  }

  fetchRecipes() {
    return this.http.get<Recipe[]>(this.url).pipe(
      map((recipes) => {
        if (!recipes) {
          return [];
        }
        return (
          recipes &&
          recipes.map((recipe) => {
            return { ...recipe, ingredients: recipe.ingredients ?? [] };
          })
        );
      }),
      tap((recipes) => this.recipeService.setRecipes(recipes))
    );
  }
}
