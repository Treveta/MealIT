/**
 * Initializes the mealPlanWeek Object to be imported in calendar component
 * @property {string} startDate        - A String that holds the date of the first day in days
 * @property {Array<mealPlanDay>} days - An array that holds 7 mealPlanDays to represent a week
 */
export interface mealPlanWeek {
  startDate: string;
  days: Array<mealPlanDay>;
}

/**
 * Initializes the mealPlanDay Object to be imported in calendar component
 * @property {Array<mealPlanRecipe>} breakfast - An array that holds a list of mealPlanDays (The recipes and recipe names) for breakfast
 * @property {Array<mealPlanRecipe>} lunch     - An array that holds a list of mealPlanDays (The recipes and recipe names) for lunch
 * @property {Array<mealPlanRecipe>} dinner    - An array that holds a list of mealPlanDays (The recipes and recipe names) for dinner
 */
export interface mealPlanDay {
  breakfast: Array<mealPlanRecipe>;
  lunch: Array<mealPlanRecipe>;
  dinneer: Array<mealPlanRecipe>;
}

/**
 * Initializes the mealPlanRecipe Object to be imported in calendar component
 * @property {string} recipeName - A string representing the plain text name for the recipe
 * @property {string} uid        - The unique id that represents the recipe in Firestore
 */
export interface mealPlanRecipe {
  recipeName: string;
  uid: string;
}
