-- ============================================================
--  NUTRITIONAL DIETARY LOGGING SYSTEM — Full Schema
--  Run this ENTIRE file in Supabase SQL Editor (once).
-- ============================================================

-- 0. DROP (clean re-run)
DROP TABLE IF EXISTS diet_log_items      CASCADE;
DROP TABLE IF EXISTS diet_logs           CASCADE;
DROP TABLE IF EXISTS nutritional_goals   CASCADE;
DROP TABLE IF EXISTS recipe_ingredients  CASCADE;
DROP TABLE IF EXISTS recipes             CASCADE;
DROP TABLE IF EXISTS ingredients         CASCADE;
DROP TABLE IF EXISTS food_log_items      CASCADE;  -- for non-recipe logged foods
DROP TABLE IF EXISTS users               CASCADE;

-- 1. USERS (linked to Supabase auth)
CREATE TABLE users (
    user_id             SERIAL          PRIMARY KEY,
    auth_user_id        UUID            UNIQUE NOT NULL,  -- links to auth.users.id
    name                VARCHAR(100)    NOT NULL,
    age                 INT             CHECK (age BETWEEN 1 AND 120),
    gender              VARCHAR(10)     CHECK (gender IN ('Male','Female','Other')),
    weight_kg           NUMERIC(5,2)    CHECK (weight_kg > 0),
    height_cm           NUMERIC(5,2)    CHECK (height_cm > 0),
    daily_calorie_goal  NUMERIC(8,2)    DEFAULT 2000 CHECK (daily_calorie_goal > 0),
    daily_protein_goal  NUMERIC(6,2)    DEFAULT 100  CHECK (daily_protein_goal > 0),
    daily_carbs_goal    NUMERIC(6,2)    DEFAULT 250  CHECK (daily_carbs_goal > 0),
    daily_fat_goal      NUMERIC(6,2)    DEFAULT 65   CHECK (daily_fat_goal > 0),
    created_at          TIMESTAMP       DEFAULT NOW()
);

-- 2. INGREDIENTS
CREATE TABLE ingredients (
    ingredient_id       SERIAL          PRIMARY KEY,
    name                VARCHAR(150)    NOT NULL UNIQUE,
    category            VARCHAR(50)     NOT NULL
                            CHECK (category IN (
                                'Grain','Legume','Vegetable','Fruit',
                                'Dairy','Meat','Seafood','Oil','Spice','Other'
                            )),
    calories_per_100g   NUMERIC(7,2)    NOT NULL CHECK (calories_per_100g >= 0),
    protein_g           NUMERIC(6,2)    NOT NULL DEFAULT 0,
    carbs_g             NUMERIC(6,2)    NOT NULL DEFAULT 0,
    fat_g               NUMERIC(6,2)    NOT NULL DEFAULT 0,
    fiber_g             NUMERIC(6,2)    NOT NULL DEFAULT 0,
    micronutrients      JSONB           NOT NULL DEFAULT '{}'::JSONB,
    created_at          TIMESTAMP       DEFAULT NOW()
);

CREATE INDEX idx_ingredients_category ON ingredients(category);
CREATE INDEX idx_ingredients_micro    ON ingredients USING GIN(micronutrients);
CREATE INDEX idx_ingredients_name     ON ingredients USING gin(to_tsvector('english', name));

-- 3. RECIPES
CREATE TABLE recipes (
    recipe_id       SERIAL          PRIMARY KEY,
    name            VARCHAR(200)    NOT NULL UNIQUE,
    cuisine_type    VARCHAR(60)     NOT NULL
                        CHECK (cuisine_type IN (
                            'North Indian','South Indian','Bengali',
                            'Gujarati','Maharashtrian','Continental',
                            'Chinese','Mediterranean','Other'
                        )),
    meal_type       VARCHAR(20)     NOT NULL
                        CHECK (meal_type IN ('Breakfast','Lunch','Dinner','Snack','Dessert')),
    serving_size_g  NUMERIC(7,2)    NOT NULL CHECK (serving_size_g > 0),
    prep_time_min   INT             CHECK (prep_time_min >= 0),
    cook_time_min   INT             CHECK (cook_time_min >= 0),
    instructions    TEXT,
    created_at      TIMESTAMP       DEFAULT NOW()
);

CREATE INDEX idx_recipes_cuisine  ON recipes(cuisine_type);
CREATE INDEX idx_recipes_meal     ON recipes(meal_type);
CREATE INDEX idx_recipes_name     ON recipes USING gin(to_tsvector('english', name));

-- 4. RECIPE_INGREDIENTS
CREATE TABLE recipe_ingredients (
    recipe_id           INT             NOT NULL REFERENCES recipes(recipe_id)     ON DELETE CASCADE,
    ingredient_id       INT             NOT NULL REFERENCES ingredients(ingredient_id) ON DELETE RESTRICT,
    quantity_g          NUMERIC(7,2)    NOT NULL CHECK (quantity_g > 0),
    preparation_note    VARCHAR(100),
    PRIMARY KEY (recipe_id, ingredient_id)
);

-- 5. DIET_LOGS
CREATE TABLE diet_logs (
    log_id          SERIAL          PRIMARY KEY,
    user_id         INT             NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    log_date        DATE            NOT NULL DEFAULT CURRENT_DATE,
    meal_type       VARCHAR(20)     NOT NULL
                        CHECK (meal_type IN ('Breakfast','Lunch','Dinner','Snack','Dessert')),
    total_calories  NUMERIC(10,2)   NOT NULL DEFAULT 0,
    total_protein_g NUMERIC(8,2)    NOT NULL DEFAULT 0,
    total_carbs_g   NUMERIC(8,2)    NOT NULL DEFAULT 0,
    total_fat_g     NUMERIC(8,2)    NOT NULL DEFAULT 0,
    logged_at       TIMESTAMP       DEFAULT NOW(),
    UNIQUE (user_id, log_date, meal_type)
);

CREATE INDEX idx_diet_logs_user_date ON diet_logs(user_id, log_date);

-- 6. DIET_LOG_ITEMS (recipe-based entries)
CREATE TABLE diet_log_items (
    log_id      INT             NOT NULL REFERENCES diet_logs(log_id)   ON DELETE CASCADE,
    recipe_id   INT             NOT NULL REFERENCES recipes(recipe_id)  ON DELETE RESTRICT,
    servings    NUMERIC(5,2)    NOT NULL DEFAULT 1 CHECK (servings > 0),
    PRIMARY KEY (log_id, recipe_id)
);

-- 6b. FOOD_LOG_ITEMS (for foods from USDA/Open Food Facts/barcode/AI)
CREATE TABLE food_log_items (
    id              SERIAL          PRIMARY KEY,
    log_id          INT             NOT NULL REFERENCES diet_logs(log_id) ON DELETE CASCADE,
    food_name       VARCHAR(200)    NOT NULL,
    source          VARCHAR(50)     NOT NULL DEFAULT 'manual',  -- 'usda','openfoodfacts','ai','barcode','manual'
    external_id     VARCHAR(100),   -- USDA fdcId or OFF barcode
    quantity_g      NUMERIC(7,2)    NOT NULL DEFAULT 100,
    calories        NUMERIC(8,2)    NOT NULL DEFAULT 0,
    protein_g       NUMERIC(6,2)    NOT NULL DEFAULT 0,
    carbs_g         NUMERIC(6,2)    NOT NULL DEFAULT 0,
    fat_g           NUMERIC(6,2)    NOT NULL DEFAULT 0,
    fiber_g         NUMERIC(6,2)    DEFAULT 0,
    micronutrients  JSONB           DEFAULT '{}'::JSONB,
    logged_at       TIMESTAMP       DEFAULT NOW()
);

-- 7. NUTRITIONAL_GOALS
CREATE TABLE nutritional_goals (
    goal_id          SERIAL          PRIMARY KEY,
    user_id          INT             NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    goal_type        VARCHAR(30)     NOT NULL
                         CHECK (goal_type IN ('Weight Loss','Muscle Gain','Maintenance','Custom')),
    start_date       DATE            NOT NULL,
    end_date         DATE,
    target_calories  NUMERIC(8,2)    NOT NULL CHECK (target_calories > 0),
    target_protein_g NUMERIC(6,2)    CHECK (target_protein_g > 0),
    target_carbs_g   NUMERIC(6,2)    CHECK (target_carbs_g > 0),
    target_fat_g     NUMERIC(6,2)    CHECK (target_fat_g > 0),
    CONSTRAINT chk_goal_dates CHECK (end_date IS NULL OR end_date > start_date)
);

CREATE INDEX idx_goals_user ON nutritional_goals(user_id);

-- ============================================================
-- TRIGGER: Auto-recalculate diet_logs totals
-- ============================================================
CREATE OR REPLACE FUNCTION fn_refresh_log_totals()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE v_log_id INT;
BEGIN
    v_log_id := COALESCE(NEW.log_id, OLD.log_id);

    UPDATE diet_logs
    SET
        total_calories  = COALESCE(t.cals,  0),
        total_protein_g = COALESCE(t.prot,  0),
        total_carbs_g   = COALESCE(t.carbs, 0),
        total_fat_g     = COALESCE(t.fat,   0)
    FROM (
        SELECT
            SUM(recipe_cal) + SUM(food_cal)   AS cals,
            SUM(recipe_pro) + SUM(food_pro)   AS prot,
            SUM(recipe_carb) + SUM(food_carb) AS carbs,
            SUM(recipe_fat) + SUM(food_fat)   AS fat
        FROM (
            -- recipe items
            SELECT
                COALESCE(SUM(dli.servings * r.serving_size_g/100.0 *
                    (SELECT SUM(ri.quantity_g/100.0 * i.calories_per_100g)
                     FROM recipe_ingredients ri JOIN ingredients i ON ri.ingredient_id=i.ingredient_id
                     WHERE ri.recipe_id=dli.recipe_id)), 0) AS recipe_cal,
                COALESCE(SUM(dli.servings * r.serving_size_g/100.0 *
                    (SELECT SUM(ri.quantity_g/100.0 * i.protein_g)
                     FROM recipe_ingredients ri JOIN ingredients i ON ri.ingredient_id=i.ingredient_id
                     WHERE ri.recipe_id=dli.recipe_id)), 0) AS recipe_pro,
                COALESCE(SUM(dli.servings * r.serving_size_g/100.0 *
                    (SELECT SUM(ri.quantity_g/100.0 * i.carbs_g)
                     FROM recipe_ingredients ri JOIN ingredients i ON ri.ingredient_id=i.ingredient_id
                     WHERE ri.recipe_id=dli.recipe_id)), 0) AS recipe_carb,
                COALESCE(SUM(dli.servings * r.serving_size_g/100.0 *
                    (SELECT SUM(ri.quantity_g/100.0 * i.fat_g)
                     FROM recipe_ingredients ri JOIN ingredients i ON ri.ingredient_id=i.ingredient_id
                     WHERE ri.recipe_id=dli.recipe_id)), 0) AS recipe_fat,
                0 AS food_cal, 0 AS food_pro, 0 AS food_carb, 0 AS food_fat
            FROM diet_log_items dli
            JOIN recipes r ON dli.recipe_id=r.recipe_id
            WHERE dli.log_id=v_log_id
            UNION ALL
            -- direct food items
            SELECT 0,0,0,0,
                COALESCE(SUM(calories),0),
                COALESCE(SUM(protein_g),0),
                COALESCE(SUM(carbs_g),0),
                COALESCE(SUM(fat_g),0)
            FROM food_log_items
            WHERE log_id=v_log_id
        ) sub
    ) t
    WHERE diet_logs.log_id = v_log_id;

    RETURN NULL;
END;
$$;

CREATE TRIGGER trg_refresh_log_totals
AFTER INSERT OR UPDATE OR DELETE ON diet_log_items
FOR EACH ROW EXECUTE FUNCTION fn_refresh_log_totals();

CREATE TRIGGER trg_refresh_log_totals_food
AFTER INSERT OR UPDATE OR DELETE ON food_log_items
FOR EACH ROW EXECUTE FUNCTION fn_refresh_log_totals();

-- ============================================================
-- RLS (Row Level Security) — users only see their own data
-- ============================================================
ALTER TABLE users             ENABLE ROW LEVEL SECURITY;
ALTER TABLE diet_logs         ENABLE ROW LEVEL SECURITY;
ALTER TABLE diet_log_items    ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_log_items    ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutritional_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users: own row" ON users
    USING (auth_user_id = auth.uid());

CREATE POLICY "diet_logs: own" ON diet_logs
    USING (user_id = (SELECT user_id FROM users WHERE auth_user_id = auth.uid()));

CREATE POLICY "diet_log_items: own" ON diet_log_items
    USING (log_id IN (
        SELECT log_id FROM diet_logs
        WHERE user_id = (SELECT user_id FROM users WHERE auth_user_id = auth.uid())
    ));

CREATE POLICY "food_log_items: own" ON food_log_items
    USING (log_id IN (
        SELECT log_id FROM diet_logs
        WHERE user_id = (SELECT user_id FROM users WHERE auth_user_id = auth.uid())
    ));

CREATE POLICY "nutritional_goals: own" ON nutritional_goals
    USING (user_id = (SELECT user_id FROM users WHERE auth_user_id = auth.uid()));

-- ingredients and recipes are public read
ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes     ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_ingredients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ingredients: public read" ON ingredients FOR SELECT USING (true);
CREATE POLICY "recipes: public read"     ON recipes     FOR SELECT USING (true);
CREATE POLICY "recipe_ingredients: public read" ON recipe_ingredients FOR SELECT USING (true);
