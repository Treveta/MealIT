/**
 * Initializes the mealPlanWeek Object to be imported in calendar component
 * @property {string}                  - stores the label of the week (ie currentWeek, nextWeek)
 * @property {boolean}                 - Lets app know if doc is defined or not
 * @property {any} startDate          - A String that holds the date of the first day in days
 * @property {Array<mealPlanDay>} days - An array that holds 7 mealPlanDays to represent a week
 */
export interface mealPlanWeek {
  label: string;
  defined: boolean;
  startDate: any;
  days: Array<mealPlanDay>;
}

/**
 * Initializes the mealPlanDay Object to be imported in calendar component
 * @property {any} date the date this meal belongs to
 * @property {string} weekDayName the name of the day belonging to the date
 * @property {Array<mealPlanRecipe>} breakfast - An array that holds a list of mealPlanDays (The recipes and recipe names) for breakfast
 * @property {Array<mealPlanRecipe>} lunch     - An array that holds a list of mealPlanDays (The recipes and recipe names) for lunch
 * @property {Array<mealPlanRecipe>} dinner    - An array that holds a list of mealPlanDays (The recipes and recipe names) for dinner
 */
export interface mealPlanDay {
  date: any;
  weekDayName: string;
  breakfast: Array<mealPlanRecipe>;
  lunch: Array<mealPlanRecipe>;
  dinner: Array<mealPlanRecipe>;
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
