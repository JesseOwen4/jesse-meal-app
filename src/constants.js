import T from "./theme";

export const GROCERY_KEY = "jesse-grocery-v1";
export const LOG_KEY = "jesse-log-v1";
export const MEALS_KEY = "jesse-meals-v1";

export const DEFAULT_MEALS = {
  Monday: [
    { id:"m1", name:"Breakfast", time:"7–8 AM", portable:false, items:["6-egg omelet w/ cottage cheese","2 handfuls shredded mozzarella","Black coffee"], cals:720, p:68, f:46, c:6 },
    { id:"m2", name:"Lunch (On-the-Go)", time:"11 AM–1 PM", portable:true, items:["Meal prep meatballs (1 lb)","Black-eyed peas (½ cup)","Parmesan packet"], cals:1050, p:100, f:72, c:20 },
    { id:"m3", name:"Pre-Workout Meal", time:"5–6 PM", portable:false, items:["1 lb ground beef patties (85/15)","⅓ cup rice (dry, cooked)","Shredded mozzarella on top"], cals:980, p:80, f:50, c:48 },
    { id:"m4", name:"Post-Workout Shake", time:"~9 PM", portable:false, items:["2 scoops whey protein","1 banana","5g creatine"], cals:440, p:48, f:6, c:42 },
    { id:"m5", name:"Before Bed", time:"10–11 PM", portable:false, items:["2 oz beef jerky","2 oz sharp cheddar or string cheese"], cals:280, p:30, f:16, c:4 },
  ],
  Tuesday: [
    { id:"t1", name:"Breakfast", time:"7–8 AM", portable:false, items:["Bacon & egg scramble (4 strips + 4 eggs in bacon grease)","Shredded parmesan on top","Black coffee"], cals:680, p:52, f:50, c:2 },
    { id:"t2", name:"Lunch (On-the-Go)", time:"11 AM–1 PM", portable:true, items:["Chick-fil-A chicken biscuit","Small hash brown","Water"], cals:680, p:28, f:30, c:72 },
    { id:"t3", name:"Afternoon Snack", time:"3–4 PM", portable:true, items:["2 hard boiled eggs","1 oz beef jerky","Banana or apple"], cals:380, p:28, f:14, c:28 },
    { id:"t4", name:"Dinner", time:"6–8 PM", portable:false, items:["1 lb baked chicken","⅓ cup rice (dry)","Any veggie or side"], cals:880, p:90, f:22, c:48 },
    { id:"t5", name:"Before Bed", time:"10–11 PM", portable:false, items:["2 oz beef jerky","2 oz cheddar or string cheese"], cals:280, p:30, f:16, c:4 },
  ],
  Wednesday: [
    { id:"w1", name:"Breakfast", time:"7–8 AM", portable:false, items:["Steak & eggs: 6 oz skirt steak pan-seared in butter","3 fried eggs alongside","Black coffee"], cals:740, p:70, f:48, c:2 },
    { id:"w2", name:"Lunch (On-the-Go)", time:"11 AM–1 PM", portable:true, items:["Meal prep ground beef patties (1 lb)","⅓ cup cooked rice","Shredded parmesan packet"], cals:1080, p:76, f:68, c:48 },
    { id:"w3", name:"Pre-Workout Meal", time:"5–6 PM", portable:false, items:["1 lb baked chicken","⅓ cup rice (dry)","Olive oil drizzle"], cals:880, p:90, f:22, c:48 },
    { id:"w4", name:"Post-Workout Shake", time:"~9 PM", portable:false, items:["2 scoops whey protein","1 cup whole milk","1 banana","5g creatine"], cals:520, p:50, f:11, c:55 },
    { id:"w5", name:"Before Bed", time:"10–11 PM", portable:false, items:["2 oz beef jerky","2 oz sharp cheddar"], cals:280, p:30, f:16, c:4 },
  ],
  Thursday: [
    { id:"th1", name:"Breakfast", time:"7–8 AM", portable:false, items:["Ground beef breakfast bowl: 6 oz beef + 3 eggs scrambled in","Shredded mozzarella melted on top"], cals:760, p:72, f:52, c:2 },
    { id:"th2", name:"Lunch (On-the-Go)", time:"11 AM–1 PM", portable:true, items:["Meatball container from Sunday prep","Parmesan + pork rind crumbles on top"], cals:1050, p:100, f:72, c:14 },
    { id:"th3", name:"Afternoon Snack", time:"3–4 PM", portable:true, items:["2 hard boiled eggs","1 oz beef jerky"], cals:280, p:26, f:14, c:4 },
    { id:"th4", name:"Pre-Workout Meal", time:"5–6 PM", portable:false, items:["1 lb ground beef patties","⅓ cup rice (dry)","Mozzarella on top"], cals:1080, p:76, f:68, c:48 },
    { id:"th5", name:"Post-Workout Shake", time:"~9 PM", portable:false, items:["2 scoops whey protein in water","1 banana","5g creatine"], cals:440, p:48, f:6, c:42 },
    { id:"th6", name:"Before Bed", time:"10–11 PM", portable:false, items:["2 oz beef jerky","2 oz cheddar"], cals:280, p:30, f:16, c:4 },
  ],
  Friday: [
    { id:"f1", name:"Breakfast", time:"7–8 AM", portable:false, items:["Chick-fil-A chicken biscuit","Small hash brown","Water"], cals:680, p:28, f:30, c:72 },
    { id:"f2", name:"Lunch (On-the-Go)", time:"11 AM–1 PM", portable:true, items:["Baked chicken + ⅓ cup cooked rice (prepped)","Olive oil packet","Parmesan packet"], cals:880, p:90, f:22, c:48 },
    { id:"f3", name:"Afternoon Snack", time:"3–4 PM", portable:true, items:["2 oz beef jerky","String cheese x2","Banana"], cals:360, p:28, f:14, c:30 },
    { id:"f4", name:"Dinner", time:"6–8 PM", portable:false, items:["1 lb meatballs (your recipe)","½ cup black-eyed peas"], cals:1870, p:149, f:108, c:32 },
    { id:"f5", name:"Before Bed", time:"10–11 PM", portable:false, items:["2 oz beef jerky","2 oz sharp cheddar"], cals:280, p:30, f:16, c:4 },
  ],
  Saturday: [
    { id:"sa1", name:"Breakfast", time:"8–9 AM", portable:false, items:["6-egg omelet with mozzarella + parmesan","1 banana on the side","Black coffee"], cals:830, p:72, f:46, c:32 },
    { id:"sa2", name:"Lunch", time:"12–1 PM", portable:false, items:["1 lb baked chicken","⅓ cup rice (dry)","Side of fruit"], cals:930, p:90, f:22, c:68 },
    { id:"sa3", name:"Pre-Workout Meal", time:"5–6 PM", portable:false, items:["1 lb ground beef patties","⅓ cup rice (dry)","Mozzarella + parmesan"], cals:1080, p:76, f:68, c:48 },
    { id:"sa4", name:"Post-Workout Shake", time:"~9 PM", portable:false, items:["2 scoops whey protein","1 cup whole milk","1 banana","5g creatine"], cals:520, p:50, f:11, c:55 },
    { id:"sa5", name:"Before Bed", time:"10–11 PM", portable:false, items:["2 oz beef jerky","2 oz cheddar or string cheese"], cals:280, p:30, f:16, c:4 },
  ],
  Sunday: [
    { id:"su1", name:"Pre-Run Breakfast", time:"Morning (1 hr before run)", portable:false, items:["Chick-fil-A chicken biscuit + hash brown","Water"], cals:680, p:28, f:30, c:72 },
    { id:"su2", name:"Post-Run Recovery", time:"Within 30 min after run", portable:false, items:["1 scoop whey protein in water","1 banana","Electrolyte packet"], cals:300, p:25, f:3, c:40 },
    { id:"su3", name:"Meal Prep Block 🥩", time:"Afternoon", portable:false, items:["Cook 2–3 lbs meatballs → 4 containers","Bake 3–4 lbs chicken → portion w/ rice","Cook 2 lbs ground beef patties","Hard boil 8–10 eggs","Cook big batch of rice"], cals:0, p:0, f:0, c:0 },
    { id:"su4", name:"Dinner", time:"6–7 PM", portable:false, items:["1 lb meatballs (your recipe)","½ cup black-eyed peas","Side of fruit"], cals:1970, p:153, f:108, c:42 },
    { id:"su5", name:"Before Bed", time:"10–11 PM", portable:false, items:["2 oz beef jerky","2 oz sharp cheddar"], cals:280, p:30, f:16, c:4 },
  ],
};

export const DEFAULT_GROCERY = [
  { section:"🥩 Meat & Seafood", color:T.accent, items:[
    { id:"g1", name:"Ground beef 85/15 (bulk)", qty:"6–7 lbs", use:"Meatballs + patties + breakfast bowl" },
    { id:"g2", name:"Chicken breasts", qty:"4–5 lbs", use:"Baked chicken meals" },
    { id:"g3", name:"Skirt or flat iron steak", qty:"1–2 lbs", use:"Steak & eggs breakfast" },
    { id:"g4", name:"Bacon (thick cut)", qty:"1 lb", use:"Bacon & egg scramble" },
    { id:"g5", name:"Ground pork rinds", qty:"1 bag", use:"Meatball recipe binder" },
    { id:"g6", name:"Beef jerky", qty:"4–5 bags", use:"Pre-bed snack + on-the-go" },
  ]},
  { section:"🥛 Dairy & Eggs", color:T.blue, items:[
    { id:"g7", name:"Eggs (large)", qty:"3 dozen", use:"Omelets, scrambles, hard boiled, meatballs" },
    { id:"g8", name:"Sharp cheddar (block)", qty:"1 lb", use:"Pre-bed snack" },
    { id:"g9", name:"String cheese (12-pack)", qty:"1 bag", use:"Portable snack + pre-bed" },
    { id:"g10", name:"Mozzarella (shredded)", qty:"2 bags", use:"Omelets + beef bowls" },
    { id:"g11", name:"Parmesan (shredded)", qty:"1 large bag", use:"Meatballs + meal topper" },
    { id:"g12", name:"Cottage cheese", qty:"1 large tub", use:"Omelets (breakfast only)" },
    { id:"g13", name:"Whole milk", qty:"1 gallon", use:"Post-workout shakes" },
    { id:"g14", name:"Butter (unsalted)", qty:"1 lb", use:"Cooking eggs + steak" },
  ]},
  { section:"🍌 Produce & Fruit", color:T.green, items:[
    { id:"g15", name:"Bananas", qty:"2 bunches (~10)", use:"Post-workout shakes + breakfast sides" },
    { id:"g16", name:"Apples", qty:"4–5", use:"On-the-go snacks" },
    { id:"g17", name:"Blueberries or strawberries", qty:"1 pint", use:"Occasional snack" },
    { id:"g18", name:"Broccoli or spinach", qty:"Your preference", use:"Dinner sides" },
  ]},
  { section:"🌾 Pantry & Dry Goods", color:"#a06c30", items:[
    { id:"g19", name:"White rice (5 lb bag)", qty:"1 bag", use:"All rice meals" },
    { id:"g20", name:"Black-eyed peas (canned)", qty:"2–3 cans", use:"Meatball side dish" },
    { id:"g21", name:"Olive oil", qty:"1 bottle", use:"Cooking + drizzle" },
    { id:"g22", name:"Garlic powder, salt, pepper, paprika", qty:"As needed", use:"Seasoning everything" },
    { id:"g23", name:"Hot sauce", qty:"1 bottle", use:"Eggs, beef bowls (optional)" },
  ]},
  { section:"💊 Supplements", color:T.purple, items:[
    { id:"g24", name:"Whey protein powder (5 lb)", qty:"1 tub", use:"Post-workout shakes daily" },
    { id:"g25", name:"Creatine monohydrate", qty:"1 large tub", use:"5g daily — non-negotiable" },
    { id:"g26", name:"Electrolyte packets", qty:"1 box", use:"Post-run + hot sessions" },
  ]},
];

export const MEAL_IDEAS = [
  { cat:"🍳 Breakfast", emoji:"🍳", items:[
    { name:"Bacon & Egg Scramble", macros:"680 cal · 52g P", time:"10 min", desc:"Cook 4 strips bacon until crispy. Scramble 4 eggs right in the bacon grease. Top with shredded parmesan. One pan, zero waste.", ingredients:["4 strips thick-cut bacon","4 large eggs","2 tbsp shredded parmesan","Salt & pepper"], tip:"Don't drain the bacon grease — that's your cooking fat and your flavor." },
    { name:"Steak & Eggs", macros:"740 cal · 70g P", time:"12 min", desc:"Season a 6 oz skirt steak with salt, pepper, garlic powder. Sear 3–4 min per side in butter on high heat. Fry 3 eggs in the same pan. Slice thin and eat alongside.", ingredients:["6 oz skirt steak","3 large eggs","1 tbsp butter","Salt, pepper, garlic powder"], tip:"Skirt steak is cheap, cooks fast, insanely flavorful. Don't overcook — medium rare is perfect." },
    { name:"Ground Beef Breakfast Bowl", macros:"760 cal · 72g P", time:"10 min", desc:"Brown 6 oz ground beef with salt, garlic powder, paprika. Crack 3 eggs directly into the pan and scramble everything together. Top with shredded mozzarella, let it melt.", ingredients:["6 oz ground beef (85/15)","3 large eggs","¼ cup shredded mozzarella","Salt, garlic powder, paprika"], tip:"Great use of leftover seasoned beef from the night before." },
    { name:"Smoked Salmon & Egg Scramble", macros:"620 cal · 58g P", time:"8 min", desc:"Melt butter over medium-low. Slowly scramble 4 eggs. When nearly set, fold in 3 oz smoked salmon and 2 tbsp cream cheese. Grate parmesan on top.", ingredients:["4 large eggs","3 oz smoked salmon","2 tbsp cream cheese","1 tbsp butter","Parmesan to top"], tip:"Smoked salmon is fully cooked. Buy vacuum-sealed packs — they last weeks in the fridge." },
    { name:"Sausage & Cheese Egg Bake", macros:"700 cal · 60g P (per serving)", time:"35 min · makes 4 servings", desc:"Brown 1 lb breakfast sausage, spread in greased 8x8 dish. Whisk 8 eggs with salt/pepper, pour over sausage. Top with 1 cup shredded cheddar. Bake 375°F for 25 min. Cut into 4 squares.", ingredients:["1 lb breakfast sausage","8 large eggs","1 cup shredded cheddar","Salt & pepper","Cooking spray"], tip:"Make this Sunday during your meal prep block. Four no-think breakfasts for the week." },
  ]},
  { cat:"🎒 Portable Meals", emoji:"🎒", items:[
    { name:"Beef & Cheese Roll-Ups", macros:"480 cal · 48g P", time:"5 min (no cook)", desc:"Lay thick-cut deli roast beef flat. Place a strip of cheddar on each slice and roll up. Pack in a container. Zero cooking, carnivore-perfect, easy to eat one-handed.", ingredients:["4 oz thick-cut deli roast beef","2 oz cheddar (sliced)","Optional: mustard or hot sauce packet"], tip:"Get roast beef from the deli counter sliced thick — way better macros than the pre-packaged stuff." },
    { name:"Boiled Egg & Jerky Box", macros:"420 cal · 44g P", time:"0 min day-of", desc:"4 hard boiled eggs + 2 oz jerky + 2 string cheeses in a container. Your backup protein box when nothing else is ready. No utensils, no heating, 44g protein.", ingredients:["4 hard boiled eggs","2 oz beef jerky","2 string cheeses"], tip:"Hard boil 10 every Sunday. Keep them unpeeled in the fridge — they last all week." },
    { name:"Bacon Ranch Chicken Wrap", macros:"720 cal · 64g P", time:"5 min (uses prepped chicken)", desc:"On a large flour tortilla: 6 oz sliced prepped chicken, 3 strips crumbled bacon, shredded cheddar, drizzle of ranch. Wrap tight, cut in half, wrap in foil.", ingredients:["1 large flour tortilla","6 oz prepped chicken","3 strips cooked bacon","¼ cup shredded cheddar","Ranch dressing"], tip:"Wrap in foil the morning you pack it — stays together better, easier to hold one-handed." },
  ]},
  { cat:"⚡ Snacks & Sides", emoji:"⚡", items:[
    { name:"Truck Snack Kit", macros:"~380 cal · 34g P", time:"0 min", desc:"Keep these permanently stocked in your truck: a bag of beef jerky, a box of string cheese, and a low-sugar protein bar. When you're between jobs and running low, this covers you.", ingredients:["Beef jerky (2 oz)","String cheese x2","Low-sugar protein bar (optional)"], tip:"Quest bars: 20g+ protein, under 5g sugar. Built bars are good too." },
    { name:"Hard Boiled Eggs + Hot Sauce", macros:"280 cal · 24g P", time:"0 min day-of", desc:"4 peeled hard boiled eggs with hot sauce and a pinch of salt. Dead simple, pure protein. Keep a small bottle of Cholula in your truck.", ingredients:["4 hard boiled eggs","Hot sauce (Cholula or Tapatio)","Salt"], tip:"Sounds boring until you're starving at 2 PM on a job site and you have four ready to go." },
    { name:"Parmesan Beef Bites", macros:"520 cal · 46g P", time:"15 min", desc:"Mix ½ lb ground beef with ¼ cup grated parmesan, garlic powder, salt, pepper. Form into small 1-inch bites. Bake 400°F for 12 min or pan fry. Cool and pack.", ingredients:["½ lb ground beef (85/15)","¼ cup grated parmesan","Garlic powder, salt, pepper"], tip:"Mini meatballs without pork rinds. Great snackable protein that travels perfectly." },
    { name:"Cheesy Egg Cups (Meal Prep)", macros:"360 cal · 32g P (per 4 cups)", time:"20 min · makes 12", desc:"Whisk 8 eggs with salt, pepper, garlic powder. Stir in ½ cup cheddar and 4 strips crumbled bacon. Pour into greased muffin tin. Bake 375°F for 15 min. Makes 12 cups.", ingredients:["8 large eggs","½ cup shredded cheddar","4 strips bacon (cooked, crumbled)","Salt, pepper, garlic powder","Cooking spray"], tip:"Make Sunday alongside your meal prep. Reheat in 45 seconds or eat cold. Extremely portable." },
    { name:"Buttered Parmesan Broccoli", macros:"180 cal · 8g P", time:"10 min", desc:"Steam or microwave 2 cups broccoli until tender. Toss with 1 tbsp butter, 3 tbsp grated parmesan, salt, garlic powder.", ingredients:["2 cups broccoli florets","1 tbsp butter","3 tbsp grated parmesan","Garlic powder, salt"], tip:"The parmesan is what makes this worth eating. Don't skip it." },
  ]},
];

export const PREP_STEPS = [
  { id: 1, label: "Preheat oven to 400°F", time: 5, parallel: false },
  { id: 2, label: "Mix meatball ingredients (2-3 lbs ground beef, eggs, parmesan, pork rinds)", time: 10, parallel: false },
  { id: 3, label: "Form meatballs, place on sheet pan", time: 15, parallel: false },
  { id: 4, label: "Put meatballs in oven — set 25 min timer", time: 2, parallel: false },
  { id: 5, label: "While meatballs bake: season chicken breasts (salt, pepper, garlic)", time: 5, parallel: true },
  { id: 6, label: "Start rice in rice cooker / pot (big batch)", time: 5, parallel: true },
  { id: 7, label: "Put eggs on to boil (8–10 eggs)", time: 3, parallel: true },
  { id: 8, label: "Pull meatballs at 25 min, put chicken in oven", time: 2, parallel: false },
  { id: 9, label: "Form ground beef patties while chicken bakes", time: 10, parallel: true },
  { id: 10, label: "Pan-sear patties or bake second batch", time: 15, parallel: false },
  { id: 11, label: "Pull chicken, let rest 5 min, then slice", time: 5, parallel: false },
  { id: 12, label: "Pull eggs off heat, ice bath", time: 2, parallel: true },
  { id: 13, label: "Portion meatballs → 4 containers", time: 5, parallel: false },
  { id: 14, label: "Portion chicken + rice → containers", time: 5, parallel: false },
  { id: 15, label: "Pack patties → containers", time: 3, parallel: false },
  { id: 16, label: "Peel & store hard boiled eggs", time: 5, parallel: false },
  { id: 17, label: "Stock fridge: jerky + cheddar for pre-bed snacks", time: 2, parallel: false },
];
