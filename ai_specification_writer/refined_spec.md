# Refined Specification

## User Stories

- **Original**: As a weight-loss seeker, I want to log the foods I eat by searching a food database so that I can track my daily calorie intake.
- **Refined**: As a weight-loss seeker, I want to search the food database and add foods to a specific meal so that I can track my daily calorie intake against my goal.

- **Original**: As a new user, I want to receive a personalized daily calorie and macronutrient goal so that I know how much to eat to reach my objective.
- **Refined**: As a weight-loss seeker, I want the app to calculate my daily calorie and macronutrient goals from my profile so that I know exactly how much to eat to reach my target weight.

- **Original**: As a busy professional, I want to scan a product barcode so that I can log packaged foods in seconds.
- **Refined**: As a busy professional, I want to scan a product barcode with my phone camera so that I can log packaged foods in under 5 seconds.

- **Original**: As a fitness enthusiast, I want to see my macronutrient breakdown for the day so that I can make sure I hit my protein, carb, and fat targets.
- **Refined**: As a fitness enthusiast, I want to see my daily protein, carbs, and fat consumed and remaining so that I can hit my macronutrient targets.

- **Original**: As a fitness enthusiast, I want to log my workouts so that calories burned are added to my daily budget.
- **Refined**: As a fitness enthusiast, I want to log my workouts by type and duration so that the calories I burn are added to my daily calorie budget.

- **Original**: As a weight-loss seeker, I want to record my weight over time so that I can see my progress toward my goal.
- **Refined**: As a weight-loss seeker, I want to record my weight and view it on a chart over time so that I can measure my progress toward my goal weight.

- **Original**: As a health-conscious individual, I want to connect my wearable device so that my steps and activity are imported automatically.
- **Refined**: As a health-conscious individual, I want to connect my wearable or fitness app so that my activity syncs automatically without manual entry.

- **Original**: As a home cook, I want to import a recipe from a URL or enter its ingredients so that I can log the nutrition of homemade meals.
- **Refined**: As a health-conscious individual, I want to import a recipe from a URL or enter its ingredients so that I can log accurate per-serving nutrition for homemade meals.

- **Original**: As a health-conscious individual, I want to track my water intake so that I stay properly hydrated.
- **Refined**: As a health-conscious individual, I want to log my water intake and receive optional reminders so that I meet my daily hydration target.

- **Original**: As a dietitian, I want to view my clients' food diaries so that I can give them informed nutrition guidance.
- **Refined**: As a dietitian or coach, I want read-only access to the diaries of clients who grant permission so that I can give informed nutrition guidance.

- **Original**: As a user looking for motivation, I want to add friends and join challenges so that I stay accountable to my goals.
- **Refined**: As a fitness enthusiast, I want to add friends and join challenges with leaderboards so that I stay motivated and accountable to my goals.

## APIs

- **Original**: POST /auth/register
- **Refined**: POST /auth/register { name, email, password }

- **Original**: POST /auth/login
- **Refined**: POST /auth/login { email, password }

- **Original**: PUT /users/me/goals
- **Refined**: PUT /users/me/goals { birth_date, sex, height_cm, weight_kg, activity_level, goal_type, daily_calorie_goal? }

- **Original**: GET /foods/search
- **Refined**: GET /foods?q={text}&page={n}&limit={n}

- **Original**: GET /foods/barcode/{barcode}
- **Refined**: GET /foods/barcodes/{barcode}

- **Original**: POST /diary/entries
- **Refined**: POST /diary/entries { food_id, date, meal_type, servings }

- **Original**: DELETE /diary/entries/{id}
- **Refined**: DELETE /diary/entries/{entry_id}

- **Original**: GET /diary/{date}
- **Refined**: GET /diary?date={YYYY-MM-DD}

- **Original**: POST /exercise
- **Refined**: POST /exercises { date, exercise_type, duration_min }

- **Original**: POST /weight
- **Refined**: POST /weight-logs { date, weight_kg }

- **Original**: GET /weight
- **Refined**: GET /weight-logs?from={YYYY-MM-DD}&to={YYYY-MM-DD}
