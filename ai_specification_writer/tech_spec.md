# Technical Specification

## System Components
- **Authentication Service**: handles user registration, login, token issuance (JWT), and profile settings.
- **Goal Calculation Service**: computes personalized daily calorie and macronutrient targets from user profile data.
- **Food Database Service**: stores foods and nutrition facts; supports text search and barcode lookup.
- **Diary Service**: records food entries, exercise, water, and weight logs, and computes daily totals.
- **Integration Service**: syncs activity data from wearables and fitness apps (Apple Health, Google Fit, Fitbit, Garmin).
- **Notification Service**: sends reminders (logging, water intake) and progress nudges.

## Data Models
- **User**: id, name, email, password_hash, birth_date, sex, height_cm, weight_kg, activity_level, goal_type, daily_calorie_goal, protein_goal_g, carbs_goal_g, fat_goal_g, created_at
- **Food**: id, name, brand, barcode, serving_size, serving_unit, calories, protein_g, carbs_g, fat_g, is_verified
- **DiaryEntry**: id, user_id, food_id, date, meal_type (breakfast | lunch | dinner | snack), servings, calories, protein_g, carbs_g, fat_g
- **ExerciseLog**: id, user_id, date, exercise_type, duration_min, calories_burned, source (manual | wearable)

## API Endpoints
- **POST /auth/register** — create an account
  - Body: `name`, `email`, `password`
- **POST /auth/login** — authenticate and receive an access token
  - Body: `email`, `password`
- **PUT /users/me/goals** — calculate or update daily calorie and macro goals
  - Body: `birth_date`, `sex`, `height_cm`, `weight_kg`, `activity_level`, `goal_type`, optional `daily_calorie_goal` override
- **GET /foods/search** — search the food database
  - Query: `q` (search text), `page`, `limit`
- **GET /foods/barcode/{barcode}** — look up a packaged food by barcode
  - Path: `barcode`
- **POST /diary/entries** — add a food to the diary
  - Body: `food_id`, `date`, `meal_type`, `servings`
- **DELETE /diary/entries/{id}** — remove a food entry
  - Path: `id`
- **GET /diary/{date}** — get the day's entries with calorie and macro totals vs. goals
  - Path: `date` (YYYY-MM-DD)
- **POST /exercise** — log a workout
  - Body: `date`, `exercise_type`, `duration_min`
- **POST /weight** — record a weight measurement
  - Body: `date`, `weight_kg`
- **GET /weight** — get weight history for progress charts
  - Query: `from`, `to`
