-- ============================================================
--  SEED DATA — run this AFTER supabase_schema.sql
--  Uses gen_random_uuid() for sample users (no real auth needed)
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- USERS (4 sample profiles with fake auth UUIDs)
-- ────────────────────────────────────────────────────────────
INSERT INTO users (auth_user_id, name, age, gender, weight_kg, height_cm, daily_calorie_goal, daily_protein_goal, daily_carbs_goal, daily_fat_goal) VALUES
(gen_random_uuid(), 'Arjun Sharma',  22, 'Male',   72.5, 175.0, 2200.00, 120.0, 250.0, 65.0),
(gen_random_uuid(), 'Priya Nair',    19, 'Female', 55.0, 162.0, 1800.00,  80.0, 200.0, 50.0),
(gen_random_uuid(), 'Rohan Mehta',   25, 'Male',   85.0, 180.0, 2800.00, 160.0, 330.0, 75.0),
(gen_random_uuid(), 'Ananya Iyer',   21, 'Female', 60.0, 165.0, 1950.00,  90.0, 240.0, 60.0);


-- ────────────────────────────────────────────────────────────
-- INGREDIENTS (macros per 100g; sparse JSONB micronutrients)
-- ────────────────────────────────────────────────────────────
INSERT INTO ingredients
    (name, category, calories_per_100g, protein_g, carbs_g, fat_g, fiber_g, micronutrients)
VALUES
-- Grains
('Basmati Rice (raw)',        'Grain',     356, 7.5, 78.0, 0.5, 0.4,
    '{"iron_mg":0.8,"magnesium_mg":25,"thiamine_mg":0.2}'),
('Whole Wheat Flour (atta)',  'Grain',     341, 12.1, 69.4, 1.7, 12.0,
    '{"iron_mg":3.6,"calcium_mg":34,"zinc_mg":2.6}'),
('Oats (rolled)',             'Grain',     389, 16.9, 66.3, 6.9, 10.6,
    '{"iron_mg":4.7,"magnesium_mg":177,"zinc_mg":3.97}'),
('Poha (flattened rice)',     'Grain',     350, 6.8, 77.0, 1.0, 0.6,
    '{"iron_mg":1.4,"sodium_mg":20}'),

-- Legumes
('Toor Dal (raw)',            'Legume',    335, 22.3, 56.6, 1.5, 15.0,
    '{"iron_mg":7.57,"calcium_mg":73,"folate_mcg":456}'),
('Chana Dal (raw)',           'Legume',    364, 22.5, 60.9, 5.0, 10.9,
    '{"iron_mg":4.9,"calcium_mg":49,"folate_mcg":340}'),
('Rajma (kidney beans raw)',  'Legume',    333, 23.6, 60.0, 0.8, 24.9,
    '{"iron_mg":6.7,"potassium_mg":1406,"folate_mcg":394}'),
('Moong Dal (raw)',           'Legume',    347, 23.9, 62.6, 1.2, 16.3,
    '{"iron_mg":6.7,"calcium_mg":132,"vitamin_b6_mg":0.38}'),

-- Vegetables
('Spinach (raw)',             'Vegetable',  23, 2.9,  3.6, 0.4,  2.2,
    '{"iron_mg":2.7,"calcium_mg":99,"vitamin_c_mg":28.1,"folate_mcg":194}'),
('Tomato',                   'Vegetable',  18, 0.9,  3.9, 0.2,  1.2,
    '{"vitamin_c_mg":13.7,"potassium_mg":237,"lycopene_mcg":2573}'),
('Onion',                    'Vegetable',  40, 1.1,  9.3, 0.1,  1.7,
    '{"vitamin_c_mg":7.4,"potassium_mg":146}'),
('Potato',                   'Vegetable',  77, 2.0, 17.5, 0.1,  2.2,
    '{"vitamin_c_mg":19.7,"potassium_mg":421,"vitamin_b6_mg":0.3}'),
('Cauliflower',              'Vegetable',  25, 1.9,  5.0, 0.3,  2.0,
    '{"vitamin_c_mg":48.2,"folate_mcg":57,"choline_mg":44.3}'),
('Methi (fenugreek leaves)', 'Vegetable',  49, 4.4,  6.0, 0.9,  2.7,
    '{"iron_mg":1.93,"calcium_mg":176,"vitamin_c_mg":3}'),

-- Dairy
('Full Cream Milk',          'Dairy',      61, 3.2,  4.8, 3.3,  0.0,
    '{"calcium_mg":113,"vitamin_d_iu":2.5,"vitamin_b12_mcg":0.46}'),
('Paneer (Indian cottage)',  'Dairy',     265, 18.3,  1.2,20.8,  0.0,
    '{"calcium_mg":208,"phosphorus_mg":139,"vitamin_b12_mcg":0.5}'),
('Curd / Yogurt (plain)',    'Dairy',      61, 3.5,  4.7, 3.3,  0.0,
    '{"calcium_mg":121,"phosphorus_mg":95,"riboflavin_mg":0.14}'),

-- Meat
('Chicken Breast (raw)',     'Meat',      165, 31.0,  0.0, 3.6,  0.0,
    '{"vitamin_b12_mcg":0.3,"selenium_mcg":27.6,"niacin_mg":13.7}'),
('Egg (whole, raw)',         'Meat',      143, 12.6,  0.7, 9.9,  0.0,
    '{"vitamin_d_iu":82,"choline_mg":294,"selenium_mcg":15.4}'),

-- Oils
('Ghee',                     'Oil',       899,  0.0,  0.0,99.8,  0.0,
    '{"vitamin_a_iu":438,"vitamin_e_mg":2.8}'),
('Mustard Oil',              'Oil',       884,  0.0,  0.0,100.0, 0.0,
    '{"vitamin_e_mg":5.4,"vitamin_k_mcg":5.4}'),
('Sunflower Oil',            'Oil',       884,  0.0,  0.0,100.0, 0.0,
    '{"vitamin_e_mg":41.1}'),

-- Spices
('Turmeric Powder',          'Spice',     354, 7.8, 64.9, 9.9, 21.1,
    '{"iron_mg":41.4,"curcumin_mg":3000}'),
('Cumin (jeera)',             'Spice',     375,17.8, 44.2,22.3, 10.5,
    '{"iron_mg":66.4,"calcium_mg":931}'),
('Garam Masala',             'Spice',     379,12.7, 50.4,15.4, 14.9,
    '{"iron_mg":29.6,"calcium_mg":567}');


-- ────────────────────────────────────────────────────────────
-- RECIPES
-- ────────────────────────────────────────────────────────────
INSERT INTO recipes (name, cuisine_type, meal_type, serving_size_g, prep_time_min, cook_time_min, instructions)
VALUES
('Dal Rice',          'North Indian', 'Lunch',     300, 10, 30,
    'Cook toor dal with turmeric until soft. Temper with ghee, cumin, onion, tomato. Serve with steamed basmati rice.'),
('Rajma Chawal',      'North Indian', 'Lunch',     350, 20, 45,
    'Soak rajma overnight. Pressure cook. Saute onion-tomato masala, add rajma, simmer. Serve with basmati rice.'),
('Methi Aloo',        'North Indian', 'Dinner',    250, 10, 20,
    'Saute fenugreek leaves with diced potatoes in mustard oil. Season with cumin, turmeric, garam masala.'),
('Palak Paneer',      'North Indian', 'Dinner',    280, 15, 25,
    'Blanch and puree spinach. Saute onion-tomato-spice base. Add paneer cubes. Finish with cream.'),
('Oats Upma',         'South Indian', 'Breakfast', 200, 5,  15,
    'Dry roast oats. Saute onion, tomato, spices in sunflower oil. Mix roasted oats, add water, cook until thick.'),
('Poha',              'North Indian', 'Breakfast', 200, 5,  10,
    'Rinse and soften flattened rice. Saute onion, potato in oil with cumin and turmeric. Combine and heat through.'),
('Chana Dal Khichdi', 'Gujarati',     'Dinner',    300, 10, 35,
    'Soak chana dal 1h. Pressure cook with basmati rice, turmeric, ghee, salt. Serve with curd.'),
('Egg Bhurji',        'North Indian', 'Breakfast', 200, 5,  10,
    'Beat eggs. Saute onion, tomato, green chilli in oil. Add eggs, scramble, season with turmeric, garam masala.'),
('Chicken Curry',     'North Indian', 'Dinner',    320, 20, 40,
    'Marinate chicken. Saute onion-tomato masala with spices. Add chicken, simmer until cooked. Finish with garam masala.'),
('Aloo Paratha',      'North Indian', 'Breakfast', 250, 20, 20,
    'Boil and mash potatoes with spices. Stuff into whole wheat dough. Cook on tawa with ghee until golden brown.');


-- ────────────────────────────────────────────────────────────
-- RECIPE_INGREDIENTS
-- ────────────────────────────────────────────────────────────

-- Dal Rice
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity_g, preparation_note)
SELECT r.recipe_id, i.ingredient_id, qty, note
FROM (VALUES
    ('Dal Rice', 'Toor Dal (raw)',          80, 'washed'),
    ('Dal Rice', 'Basmati Rice (raw)',      100, 'rinsed'),
    ('Dal Rice', 'Ghee',                    10, NULL),
    ('Dal Rice', 'Onion',                   50, 'finely chopped'),
    ('Dal Rice', 'Tomato',                  60, 'chopped'),
    ('Dal Rice', 'Turmeric Powder',          2, NULL),
    ('Dal Rice', 'Cumin (jeera)',             3, NULL)
) AS t(rname, iname, qty, note)
JOIN recipes     r ON r.name = t.rname
JOIN ingredients i ON i.name = t.iname;

-- Rajma Chawal
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity_g, preparation_note)
SELECT r.recipe_id, i.ingredient_id, qty, note
FROM (VALUES
    ('Rajma Chawal', 'Rajma (kidney beans raw)',  90, 'soaked overnight'),
    ('Rajma Chawal', 'Basmati Rice (raw)',        100, 'rinsed'),
    ('Rajma Chawal', 'Onion',                     70, 'finely chopped'),
    ('Rajma Chawal', 'Tomato',                    80, 'pureed'),
    ('Rajma Chawal', 'Sunflower Oil',             15, NULL),
    ('Rajma Chawal', 'Turmeric Powder',            2, NULL),
    ('Rajma Chawal', 'Garam Masala',               5, NULL),
    ('Rajma Chawal', 'Cumin (jeera)',               3, NULL)
) AS t(rname, iname, qty, note)
JOIN recipes     r ON r.name = t.rname
JOIN ingredients i ON i.name = t.iname;

-- Methi Aloo
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity_g, preparation_note)
SELECT r.recipe_id, i.ingredient_id, qty, note
FROM (VALUES
    ('Methi Aloo', 'Methi (fenugreek leaves)', 100, 'washed, chopped'),
    ('Methi Aloo', 'Potato',                   150, 'diced small'),
    ('Methi Aloo', 'Mustard Oil',               15, NULL),
    ('Methi Aloo', 'Cumin (jeera)',               3, NULL),
    ('Methi Aloo', 'Turmeric Powder',             2, NULL),
    ('Methi Aloo', 'Garam Masala',                3, NULL)
) AS t(rname, iname, qty, note)
JOIN recipes     r ON r.name = t.rname
JOIN ingredients i ON i.name = t.iname;

-- Palak Paneer
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity_g, preparation_note)
SELECT r.recipe_id, i.ingredient_id, qty, note
FROM (VALUES
    ('Palak Paneer', 'Spinach (raw)',            200, 'blanched and pureed'),
    ('Palak Paneer', 'Paneer (Indian cottage)',  100, 'cubed'),
    ('Palak Paneer', 'Onion',                    60, 'finely chopped'),
    ('Palak Paneer', 'Tomato',                   60, 'pureed'),
    ('Palak Paneer', 'Ghee',                     10, NULL),
    ('Palak Paneer', 'Turmeric Powder',            2, NULL),
    ('Palak Paneer', 'Garam Masala',               4, NULL),
    ('Palak Paneer', 'Cumin (jeera)',               3, NULL)
) AS t(rname, iname, qty, note)
JOIN recipes     r ON r.name = t.rname
JOIN ingredients i ON i.name = t.iname;

-- Oats Upma
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity_g, preparation_note)
SELECT r.recipe_id, i.ingredient_id, qty, note
FROM (VALUES
    ('Oats Upma', 'Oats (rolled)',   80, 'dry roasted'),
    ('Oats Upma', 'Onion',          50, 'chopped'),
    ('Oats Upma', 'Tomato',         50, 'chopped'),
    ('Oats Upma', 'Sunflower Oil',  10, NULL),
    ('Oats Upma', 'Turmeric Powder', 1, NULL),
    ('Oats Upma', 'Cumin (jeera)',    3, NULL)
) AS t(rname, iname, qty, note)
JOIN recipes     r ON r.name = t.rname
JOIN ingredients i ON i.name = t.iname;

-- Poha
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity_g, preparation_note)
SELECT r.recipe_id, i.ingredient_id, qty, note
FROM (VALUES
    ('Poha', 'Poha (flattened rice)',  80, 'rinsed and softened'),
    ('Poha', 'Potato',                60, 'small cubes'),
    ('Poha', 'Onion',                 50, 'chopped'),
    ('Poha', 'Sunflower Oil',         10, NULL),
    ('Poha', 'Turmeric Powder',        2, NULL),
    ('Poha', 'Cumin (jeera)',           3, NULL)
) AS t(rname, iname, qty, note)
JOIN recipes     r ON r.name = t.rname
JOIN ingredients i ON i.name = t.iname;

-- Chana Dal Khichdi
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity_g, preparation_note)
SELECT r.recipe_id, i.ingredient_id, qty, note
FROM (VALUES
    ('Chana Dal Khichdi', 'Chana Dal (raw)',        70, 'soaked 1 hour'),
    ('Chana Dal Khichdi', 'Basmati Rice (raw)',     80, 'rinsed'),
    ('Chana Dal Khichdi', 'Curd / Yogurt (plain)', 80, 'to serve alongside'),
    ('Chana Dal Khichdi', 'Ghee',                  10, NULL),
    ('Chana Dal Khichdi', 'Turmeric Powder',         2, NULL),
    ('Chana Dal Khichdi', 'Cumin (jeera)',            3, NULL)
) AS t(rname, iname, qty, note)
JOIN recipes     r ON r.name = t.rname
JOIN ingredients i ON i.name = t.iname;

-- Egg Bhurji
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity_g, preparation_note)
SELECT r.recipe_id, i.ingredient_id, qty, note
FROM (VALUES
    ('Egg Bhurji', 'Egg (whole, raw)',   120, 'beaten'),
    ('Egg Bhurji', 'Onion',              60, 'finely chopped'),
    ('Egg Bhurji', 'Tomato',             60, 'chopped'),
    ('Egg Bhurji', 'Sunflower Oil',      10, NULL),
    ('Egg Bhurji', 'Turmeric Powder',     2, NULL),
    ('Egg Bhurji', 'Garam Masala',        3, NULL)
) AS t(rname, iname, qty, note)
JOIN recipes     r ON r.name = t.rname
JOIN ingredients i ON i.name = t.iname;

-- Chicken Curry
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity_g, preparation_note)
SELECT r.recipe_id, i.ingredient_id, qty, note
FROM (VALUES
    ('Chicken Curry', 'Chicken Breast (raw)', 200, 'cut into pieces'),
    ('Chicken Curry', 'Onion',                80, 'finely chopped'),
    ('Chicken Curry', 'Tomato',               80, 'pureed'),
    ('Chicken Curry', 'Full Cream Milk',      50, 'for gravy richness'),
    ('Chicken Curry', 'Sunflower Oil',        15, NULL),
    ('Chicken Curry', 'Turmeric Powder',       2, NULL),
    ('Chicken Curry', 'Garam Masala',          6, NULL),
    ('Chicken Curry', 'Cumin (jeera)',          3, NULL)
) AS t(rname, iname, qty, note)
JOIN recipes     r ON r.name = t.rname
JOIN ingredients i ON i.name = t.iname;

-- Aloo Paratha
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity_g, preparation_note)
SELECT r.recipe_id, i.ingredient_id, qty, note
FROM (VALUES
    ('Aloo Paratha', 'Whole Wheat Flour (atta)', 100, 'kneaded into dough'),
    ('Aloo Paratha', 'Potato',                   120, 'boiled and mashed'),
    ('Aloo Paratha', 'Onion',                     30, 'finely chopped for stuffing'),
    ('Aloo Paratha', 'Ghee',                      15, 'for cooking on tawa'),
    ('Aloo Paratha', 'Turmeric Powder',             1, NULL),
    ('Aloo Paratha', 'Garam Masala',                3, NULL),
    ('Aloo Paratha', 'Curd / Yogurt (plain)',       60, 'to serve alongside')
) AS t(rname, iname, qty, note)
JOIN recipes     r ON r.name = t.rname
JOIN ingredients i ON i.name = t.iname;


-- ────────────────────────────────────────────────────────────
-- NUTRITIONAL GOALS (for sample users)
-- ────────────────────────────────────────────────────────────
INSERT INTO nutritional_goals (user_id, goal_type, start_date, end_date, target_calories, target_protein_g, target_carbs_g, target_fat_g)
SELECT u.user_id, g.goal_type, g.start_date, g.end_date, g.target_calories, g.target_protein_g, g.target_carbs_g, g.target_fat_g
FROM (VALUES
    ('Arjun Sharma',  'Muscle Gain',  CURRENT_DATE - 30, CURRENT_DATE + 60,  2400, 150, 300, 70),
    ('Priya Nair',    'Weight Loss',  CURRENT_DATE - 15, CURRENT_DATE + 75,  1600,  80, 200, 45),
    ('Rohan Mehta',   'Muscle Gain',  CURRENT_DATE - 7,  CURRENT_DATE + 83,  3000, 180, 350, 80),
    ('Ananya Iyer',   'Maintenance',  CURRENT_DATE,      NULL,               1950,  90, 240, 60)
) AS g(uname, goal_type, start_date, end_date, target_calories, target_protein_g, target_carbs_g, target_fat_g)
JOIN users u ON u.name = g.uname;

-- NOTE: diet_logs and diet_log_items are intentionally omitted from seed
-- because they reference user_id. Real users created via signup will have
-- their own logs. The sample users above have fake auth_user_ids so you
-- cannot log in as them — they are only here for recipe/ingredient data.
