import { useState } from "react";
import { useSupabaseState } from "./useSupabaseState";

// ─── THEME ───────────────────────────────────────────────────────────────────
const T = {
  bg: "#0e0f14",
  surface: "#16181f",
  surfaceHigh: "#1c1e27",
  border: "#252830",
  borderLight: "#2e3140",
  text: "#f0ece4",
  textMid: "#9a9488",
  textDim: "#555a6a",
  accent: "#e8793a",
  accentDim: "#e8793a22",
  green: "#4ead78",
  greenDim: "#4ead7820",
  blue: "#4a88d0",
  purple: "#9060cc",
  upper: "#e8793a",
  lower: "#4ead78",
  rest: "#4a88d0",
  run: "#9060cc",
};

// ─── DATA ────────────────────────────────────────────────────────────────────
const SCHEDULE = {
  Monday: { type: "upper", label: "Upper Body" },
  Tuesday: { type: "rest", label: "Rest Day" },
  Wednesday: { type: "lower", label: "Lower Body" },
  Thursday: { type: "upper", label: "Upper Body" },
  Friday: { type: "rest", label: "Rest Day" },
  Saturday: { type: "lower", label: "Lower Body" },
  Sunday: { type: "run", label: "Run Day" },
};
const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
const DAY_SHORT = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

const DEFAULT_MEALS = {
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

const DEFAULT_GROCERY = [
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

// ─── STORAGE KEYS ────────────────────────────────────────────────────────────
const GROCERY_KEY = "jesse-grocery-v1";
const LOG_KEY = "jesse-log-v1";
const MEALS_KEY = "jesse-meals-v1";

// ─── ICONS ───────────────────────────────────────────────────────────────────
const Icon = ({ name, size=20, color="currentColor" }) => {
  const paths = {
    plan: "M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01",
    ideas: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z",
    grocery: "M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z",
    log: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
    check: "M5 13l4 4L19 7",
    edit: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z",
    bag: "M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z",
    plus: "M12 4v16m8-8H4",
    x: "M6 18L18 6M6 6l12 12",
    save: "M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4",
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {(paths[name]||"").split("M").filter(Boolean).map((d,i)=>(
        <path key={i} d={"M"+d} />
      ))}
    </svg>
  );
};

// ─── MEAL IDEAS ──────────────────────────────────────────────────────────────
const MEAL_IDEAS = [
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

// ─── MAIN APP ────────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState("plan");
  const [activeDay, setActiveDay] = useState(() => {
    const today = new Date().toLocaleDateString("en-US",{weekday:"long"});
    return DAYS.includes(today) ? today : "Monday";
  });
  const [editingMeal, setEditingMeal] = useState(null);
  const [editContent, setEditContent] = useState({ items:[], cals:"", p:"", f:"", c:"" });
  const [expandedIdea, setExpandedIdea] = useState(null);

  const todayKey = new Date().toISOString().split("T")[0];

  // ── Supabase-backed state (replaces window.storage) ──
  const [checkedItems, setCheckedItems, groceryReady] = useSupabaseState(GROCERY_KEY, {});
  const [loggedMeals, setLoggedMeals, logReady] = useSupabaseState(LOG_KEY + "-" + todayKey, {});
  const [meals, setMeals, mealsReady] = useSupabaseState(MEALS_KEY, DEFAULT_MEALS);

  const storageReady = groceryReady && logReady && mealsReady;

  const toggleGrocery = (id) => {
    setCheckedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleLog = (day, mealId) => {
    const key = `${day}-${mealId}`;
    setLoggedMeals(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const resetGrocery = () => {
    setCheckedItems({});
  };

  const openEdit = (day, meal) => {
    setEditingMeal({ day, id: meal.id });
    setEditContent({
      items: [...meal.items],
      cals: String(meal.cals),
      p: String(meal.p),
      f: String(meal.f),
      c: String(meal.c),
    });
  };

  const saveEdit = () => {
    if (!editingMeal) return;
    setMeals(prev => ({
      ...prev,
      [editingMeal.day]: prev[editingMeal.day].map(m =>
        m.id === editingMeal.id
          ? { ...m, items: editContent.items, cals: parseInt(editContent.cals)||m.cals, p: parseInt(editContent.p)||m.p, f: parseInt(editContent.f)||m.f, c: parseInt(editContent.c)||m.c }
          : m
      )
    }));
    setEditingMeal(null);
  };

  const updateEditItem = (i, val) => {
    const next = [...editContent.items];
    next[i] = val;
    setEditContent(p => ({ ...p, items: next }));
  };
  const removeEditItem = (i) => setEditContent(p => ({ ...p, items: p.items.filter((_,idx)=>idx!==i) }));
  const addEditItem = () => setEditContent(p => ({ ...p, items: [...p.items, ""] }));

  // ── Derived ──
  const dayMeals = meals[activeDay] || [];
  const totals = dayMeals.reduce((a,m)=>({ cals:a.cals+m.cals, p:a.p+m.p, f:a.f+m.f, c:a.c+m.c }),{cals:0,p:0,f:0,c:0});
  const loggedTotals = dayMeals.filter(m=>loggedMeals[`${activeDay}-${m.id}`]).reduce((a,m)=>({ cals:a.cals+m.cals, p:a.p+m.p }),{cals:0,p:0});
  const accent = T[SCHEDULE[activeDay]?.type] || T.accent;
  const totalGrocery = DEFAULT_GROCERY.reduce((a,s)=>a+s.items.length,0);
  const checkedCount = Object.values(checkedItems).filter(Boolean).length;

  if (!storageReady) return (
    <div style={{ minHeight:"100vh", background:T.bg, display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ color:T.textDim, fontFamily:"Georgia, serif", fontSize:14 }}>Loading your plan...</div>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", maxWidth:480, margin:"0 auto", background:T.bg, fontFamily:"Georgia, 'Palatino Linotype', serif", color:T.text, display:"flex", flexDirection:"column", position:"relative" }}>

      {/* ── HEADER ── */}
      <div style={{ background:T.surface, borderBottom:`1px solid ${T.border}`, padding:"16px 20px 14px", position:"sticky", top:0, zIndex:10 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
          <div>
            <div style={{ fontSize:11, letterSpacing:4, color:T.textDim, textTransform:"uppercase" }}>Lean Bulk · Carnivore</div>
            <div style={{ fontSize:22, color:T.text, marginTop:2 }}>Jesse's Plan</div>
          </div>
          <div style={{ textAlign:"right" }}>
            <div style={{ fontSize:11, color:T.textDim }}>Shared w/ wife ✓</div>
          </div>
        </div>
        {/* Macro targets */}
        <div style={{ display:"flex", gap:8, marginTop:12 }}>
          {[["3,400","cal"],["195g","prot"],["120g","fat"],["240g","carb"]].map(([v,l])=>(
            <div key={l} style={{ flex:1, background:T.surfaceHigh, borderRadius:8, padding:"6px 4px", textAlign:"center" }}>
              <div style={{ fontSize:13, fontWeight:"bold", color:T.text }}>{v}</div>
              <div style={{ fontSize:9, color:T.textDim, letterSpacing:1, textTransform:"uppercase" }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div style={{ flex:1, overflowY:"auto", paddingBottom:80 }}>

        {/* ══ PLAN TAB ══ */}
        {tab === "plan" && (<>
          {/* Day pills */}
          <div style={{ overflowX:"auto", padding:"14px 20px 0", display:"flex", gap:8, scrollbarWidth:"none" }}>
            {DAYS.map((d,i) => {
              const isActive = d===activeDay;
              const ac = T[SCHEDULE[d].type];
              return (
                <button key={d} onClick={()=>setActiveDay(d)} style={{
                  flexShrink:0, padding:"8px 12px", borderRadius:10,
                  background: isActive ? ac+"22" : T.surface,
                  border:`1.5px solid ${isActive ? ac : T.border}`,
                  color: isActive ? ac : T.textDim,
                  fontSize:12, letterSpacing:1, cursor:"pointer", fontFamily:"inherit",
                  transition:"all 0.15s",
                }}>
                  <div style={{ fontWeight:isActive?"bold":"normal" }}>{DAY_SHORT[i]}</div>
                  <div style={{ fontSize:9, marginTop:2, opacity:0.8 }}>{SCHEDULE[d].label.split(" ")[0]}</div>
                </button>
              );
            })}
          </div>

          {/* Day summary */}
          <div style={{ padding:"14px 20px 0" }}>
            <div style={{ background:T.surface, borderRadius:12, padding:"14px 16px", borderLeft:`3px solid ${accent}` }}>
              <div style={{ fontSize:9, letterSpacing:4, color:accent, textTransform:"uppercase" }}>{SCHEDULE[activeDay].label} · Gym 7–8 PM</div>
              <div style={{ display:"flex", gap:12, marginTop:10, flexWrap:"wrap" }}>
                {[["Today",totals.cals,"cal",3400],["Logged",loggedTotals.cals,"cal",totals.cals||1]].map(([l,v,unit,max])=>(
                  <div key={l} style={{ flex:1, minWidth:100 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline" }}>
                      <div style={{ fontSize:10, color:T.textDim, letterSpacing:1 }}>{l.toUpperCase()}</div>
                      <div style={{ fontSize:16, color:T.text }}>{v} <span style={{ fontSize:10, color:T.textDim }}>{unit}</span></div>
                    </div>
                    <div style={{ height:3, background:T.border, borderRadius:2, marginTop:4 }}>
                      <div style={{ height:"100%", width:`${Math.min(100,Math.round(v/(max||1)*100))}%`, background:l==="Logged"?T.green:accent, borderRadius:2, transition:"width 0.4s" }} />
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ display:"flex", gap:8, marginTop:8 }}>
                {[["P",totals.p,195],["F",totals.f,120],["C",totals.c,240]].map(([l,v,target])=>(
                  <div key={l} style={{ flex:1, fontSize:11, color:T.textMid, textAlign:"center" }}>
                    <span style={{ color:T.text }}>{v}g</span> {l} <span style={{ color:T.textDim, fontSize:9 }}>/{target}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Meals */}
          <div style={{ padding:"12px 20px 0", display:"flex", flexDirection:"column", gap:10 }}>
            {dayMeals.map((meal,i) => {
              const logKey = `${activeDay}-${meal.id}`;
              const isLogged = !!loggedMeals[logKey];
              const isMealPrep = meal.name.includes("Meal Prep");
              return (
                <div key={meal.id} style={{ background:T.surface, border:`1px solid ${meal.portable ? T.green+"44" : T.border}`, borderRadius:12, overflow:"hidden", opacity: isLogged ? 0.65 : 1, transition:"opacity 0.2s" }}>
                  {/* Meal header */}
                  <div style={{ padding:"12px 14px", background:T.surfaceHigh, display:"flex", alignItems:"center", gap:10 }}>
                    <div style={{ width:32, height:32, borderRadius:10, background:accent+"18", border:`1px solid ${accent}33`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, color:accent, fontWeight:"bold", flexShrink:0 }}>
                      {isMealPrep?"📦":i+1}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:6, flexWrap:"wrap" }}>
                        <span style={{ fontSize:14, color:T.text }}>{meal.name}</span>
                        {meal.portable && <span style={{ fontSize:9, color:T.green, background:T.greenDim, border:`1px solid ${T.green}44`, borderRadius:4, padding:"1px 6px", letterSpacing:1 }}>🎒 PORTABLE</span>}
                        {isLogged && <span style={{ fontSize:9, color:T.green, letterSpacing:1 }}>✓ LOGGED</span>}
                      </div>
                      <div style={{ fontSize:11, color:T.textDim, marginTop:1 }}>{meal.time}</div>
                    </div>
                    {!isMealPrep && (
                      <div style={{ textAlign:"right", flexShrink:0 }}>
                        <div style={{ fontSize:15, color:T.text }}>{meal.cals}<span style={{ fontSize:9, color:T.textDim }}> cal</span></div>
                        <div style={{ fontSize:10, color:T.textDim }}>P{meal.p}·F{meal.f}·C{meal.c}</div>
                      </div>
                    )}
                  </div>
                  {/* Meal body */}
                  <div style={{ padding:"12px 14px" }}>
                    <ul style={{ margin:0, padding:"0 0 0 16px", color:T.textMid, fontSize:13, lineHeight:1.8 }}>
                      {meal.items.map((item,j)=><li key={j}>{item}</li>)}
                    </ul>
                    {!isMealPrep && (
                      <div style={{ display:"flex", gap:8, marginTop:12 }}>
                        <button onClick={()=>toggleLog(activeDay, meal.id)} style={{
                          flex:1, padding:"10px 0", borderRadius:8,
                          background: isLogged ? T.green+"22" : T.surfaceHigh,
                          border:`1px solid ${isLogged ? T.green : T.border}`,
                          color: isLogged ? T.green : T.textMid,
                          fontSize:12, cursor:"pointer", fontFamily:"inherit",
                          transition:"all 0.15s",
                        }}>{isLogged ? "✓ Logged" : "Log this meal"}</button>
                        <button onClick={()=>openEdit(activeDay, meal)} style={{
                          padding:"10px 14px", borderRadius:8,
                          background:T.surfaceHigh, border:`1px solid ${T.border}`,
                          color:T.textDim, cursor:"pointer",
                        }}>
                          <Icon name="edit" size={15} color={T.textDim} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>)}

        {/* ══ IDEAS TAB ══ */}
        {tab === "ideas" && (
          <div style={{ padding:"16px 20px 0" }}>
            <div style={{ fontSize:11, color:T.textDim, letterSpacing:3, textTransform:"uppercase", marginBottom:16 }}>Tap any card for full recipe</div>
            {MEAL_IDEAS.map(cat => (
              <div key={cat.cat} style={{ marginBottom:24 }}>
                <div style={{ fontSize:16, color:T.text, marginBottom:10 }}>{cat.cat}</div>
                <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                  {cat.items.map((idea,idx) => {
                    const key = `${cat.cat}-${idx}`;
                    const isOpen = expandedIdea===key;
                    return (
                      <div key={idx} style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:12, overflow:"hidden", cursor:"pointer" }} onClick={()=>setExpandedIdea(isOpen?null:key)}>
                        <div style={{ padding:"14px 16px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                          <div>
                            <div style={{ fontSize:14, color:T.text }}>{idea.name}</div>
                            <div style={{ display:"flex", gap:10, marginTop:3 }}>
                              <span style={{ fontSize:11, color:T.accent }}>{idea.macros}</span>
                              <span style={{ fontSize:11, color:T.textDim }}>⏱ {idea.time}</span>
                            </div>
                          </div>
                          <div style={{ fontSize:18, color:T.border, transform:isOpen?"rotate(180deg)":"none", transition:"transform 0.2s" }}>⌄</div>
                        </div>
                        {isOpen && (
                          <div style={{ padding:"0 16px 16px", borderTop:`1px solid ${T.border}` }}>
                            <p style={{ margin:"12px 0 10px", fontSize:13, color:T.textMid, lineHeight:1.7 }}>{idea.desc}</p>
                            <div style={{ fontSize:10, color:T.textDim, letterSpacing:3, textTransform:"uppercase", marginBottom:6 }}>Ingredients</div>
                            <ul style={{ margin:"0 0 10px", padding:"0 0 0 16px", color:T.textMid, fontSize:13, lineHeight:1.8 }}>
                              {idea.ingredients.map((ing,j)=><li key={j}>{ing}</li>)}
                            </ul>
                            {idea.tip && <div style={{ padding:"8px 12px", background:T.accent+"0d", borderLeft:`2px solid ${T.accent}55`, borderRadius:"0 6px 6px 0", fontSize:12, color:T.textMid, fontStyle:"italic", lineHeight:1.6 }}>💡 {idea.tip}</div>}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ══ GROCERY TAB ══ */}
        {tab === "grocery" && (
          <div style={{ padding:"16px 20px 0" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
              <div>
                <div style={{ fontSize:16, color:T.text }}>Weekly List</div>
                <div style={{ fontSize:11, color:T.textDim, marginTop:2 }}>Shared · syncs with your wife in real time</div>
              </div>
              <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                <div style={{ fontSize:13, color:T.green }}>{checkedCount}/{totalGrocery}</div>
                <button onClick={resetGrocery} style={{ padding:"6px 12px", background:T.surface, border:`1px solid ${T.border}`, borderRadius:8, color:T.textDim, fontSize:11, cursor:"pointer", fontFamily:"inherit" }}>Reset</button>
              </div>
            </div>
            {/* Progress */}
            <div style={{ height:4, background:T.border, borderRadius:2, marginBottom:18 }}>
              <div style={{ height:"100%", width:`${Math.round(checkedCount/totalGrocery*100)}%`, background:T.green, borderRadius:2, transition:"width 0.3s" }} />
            </div>
            {DEFAULT_GROCERY.map(section => (
              <div key={section.section} style={{ marginBottom:18 }}>
                <div style={{ fontSize:13, color:section.color, letterSpacing:1, marginBottom:8 }}>{section.section}</div>
                <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                  {section.items.map(item => {
                    const done = !!checkedItems[item.id];
                    return (
                      <div key={item.id} onClick={()=>toggleGrocery(item.id)} style={{
                        display:"flex", alignItems:"center", gap:12,
                        padding:"12px 14px", borderRadius:10,
                        background: done ? T.surfaceHigh : T.surface,
                        border:`1px solid ${done ? T.border : T.borderLight}`,
                        cursor:"pointer", opacity: done ? 0.45 : 1,
                        transition:"opacity 0.15s",
                      }}>
                        <div style={{ width:22, height:22, borderRadius:6, flexShrink:0, background: done ? section.color : "none", border:`1.5px solid ${done ? section.color : T.borderLight}`, display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.15s" }}>
                          {done && <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7"/></svg>}
                        </div>
                        <div style={{ flex:1 }}>
                          <div style={{ fontSize:14, color: done ? T.textDim : T.text, textDecoration: done ? "line-through" : "none" }}>{item.name}</div>
                          <div style={{ fontSize:11, color:T.textDim, marginTop:1 }}>{item.qty} · {item.use}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
            {/* Meal prep reminder */}
            <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderLeft:`3px solid ${T.green}`, borderRadius:10, padding:"14px 16px", marginBottom:20 }}>
              <div style={{ fontSize:10, letterSpacing:3, color:T.green, marginBottom:8 }}>📦 SUNDAY PREP CHECKLIST</div>
              {["Cook 2–3 lbs meatballs → 4 containers","Bake 3–4 lbs chicken → portion w/ rice","Cook 2 lbs ground beef patties","Hard boil 8–10 eggs","Cook big batch of rice","Stock fridge: jerky + cheddar for pre-bed"].map((item,i) => (
                <div key={i} style={{ fontSize:13, color:T.textMid, lineHeight:2 }}>✦ {item}</div>
              ))}
            </div>
          </div>
        )}

        {/* ══ LOG TAB ══ */}
        {tab === "log" && (
          <div style={{ padding:"16px 20px 0" }}>
            <div style={{ marginBottom:16 }}>
              <div style={{ fontSize:16, color:T.text }}>Today's Log</div>
              <div style={{ fontSize:11, color:T.textDim, marginTop:2 }}>{new Date().toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"})}</div>
            </div>
            {/* Running totals */}
            <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:12, padding:"14px 16px", marginBottom:16 }}>
              <div style={{ fontSize:10, color:T.textDim, letterSpacing:3, textTransform:"uppercase", marginBottom:10 }}>Running Total</div>
              <div style={{ display:"flex", gap:12 }}>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:24, color:T.text }}>{loggedTotals.cals}</div>
                  <div style={{ fontSize:10, color:T.textDim }}>of 3,400 cal</div>
                  <div style={{ height:4, background:T.border, borderRadius:2, marginTop:6 }}>
                    <div style={{ height:"100%", width:`${Math.min(100,Math.round(loggedTotals.cals/3400*100))}%`, background:loggedTotals.cals>=3400?T.green:T.accent, borderRadius:2, transition:"width 0.4s" }} />
                  </div>
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:24, color:T.text }}>{loggedTotals.p}g</div>
                  <div style={{ fontSize:10, color:T.textDim }}>of 195g protein</div>
                  <div style={{ height:4, background:T.border, borderRadius:2, marginTop:6 }}>
                    <div style={{ height:"100%", width:`${Math.min(100,Math.round(loggedTotals.p/195*100))}%`, background:loggedTotals.p>=195?T.green:T.blue, borderRadius:2, transition:"width 0.4s" }} />
                  </div>
                </div>
              </div>
            </div>
            {/* All days log view */}
            {DAYS.map(d => {
              const dayMs = meals[d]||[];
              const loggedAny = dayMs.some(m=>loggedMeals[`${d}-${m.id}`]);
              if (!loggedAny && d !== activeDay) return null;
              return (
                <div key={d} style={{ marginBottom:14 }}>
                  <div style={{ fontSize:12, color:T[SCHEDULE[d].type], letterSpacing:2, textTransform:"uppercase", marginBottom:8 }}>{d}</div>
                  {dayMs.filter(m=>!m.name.includes("Meal Prep")).map(meal => {
                    const logKey = `${d}-${meal.id}`;
                    const isLogged = !!loggedMeals[logKey];
                    return (
                      <div key={meal.id} onClick={()=>toggleLog(d, meal.id)} style={{
                        display:"flex", alignItems:"center", gap:12,
                        padding:"12px 14px", borderRadius:10, marginBottom:6,
                        background: isLogged ? T.green+"12" : T.surface,
                        border:`1px solid ${isLogged ? T.green+"44" : T.border}`,
                        cursor:"pointer", transition:"all 0.15s",
                      }}>
                        <div style={{ width:22, height:22, borderRadius:6, background: isLogged ? T.green : "none", border:`1.5px solid ${isLogged ? T.green : T.border}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                          {isLogged && <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7"/></svg>}
                        </div>
                        <div style={{ flex:1 }}>
                          <div style={{ fontSize:14, color: isLogged ? T.text : T.textMid }}>{meal.name}</div>
                          <div style={{ fontSize:11, color:T.textDim }}>{meal.cals} cal · P{meal.p}g</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
            {Object.keys(loggedMeals).length===0 && (
              <div style={{ textAlign:"center", color:T.textDim, fontSize:13, marginTop:40 }}>
                No meals logged yet today.<br/>Head to the Plan tab and tap "Log this meal" after you eat.
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── EDIT MODAL ── */}
      {editingMeal && (
        <div style={{ position:"fixed", inset:0, background:"#000a", zIndex:100, display:"flex", alignItems:"flex-end" }} onClick={e=>{ if(e.target===e.currentTarget) setEditingMeal(null); }}>
          <div style={{ background:T.surface, borderRadius:"16px 16px 0 0", width:"100%", maxWidth:480, margin:"0 auto", padding:"20px", maxHeight:"80vh", overflowY:"auto" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
              <div style={{ fontSize:16, color:T.text }}>Edit Meal</div>
              <button onClick={()=>setEditingMeal(null)} style={{ background:"none", border:"none", color:T.textDim, fontSize:20, cursor:"pointer", padding:4 }}>✕</button>
            </div>
            {/* Items */}
            <div style={{ fontSize:10, color:T.textDim, letterSpacing:3, textTransform:"uppercase", marginBottom:8 }}>Items</div>
            {editContent.items.map((item,i) => (
              <div key={i} style={{ display:"flex", gap:8, marginBottom:8 }}>
                <input value={item} onChange={e=>updateEditItem(i,e.target.value)} style={{ flex:1, background:T.surfaceHigh, border:`1px solid ${T.border}`, borderRadius:8, padding:"10px 12px", color:T.text, fontSize:13, fontFamily:"inherit", outline:"none" }} />
                <button onClick={()=>removeEditItem(i)} style={{ padding:"8px 12px", background:T.surfaceHigh, border:`1px solid ${T.border}`, borderRadius:8, color:T.textDim, cursor:"pointer", fontSize:16 }}>✕</button>
              </div>
            ))}
            <button onClick={addEditItem} style={{ width:"100%", padding:"10px 0", background:"none", border:`1px dashed ${T.border}`, borderRadius:8, color:T.textDim, fontSize:12, cursor:"pointer", fontFamily:"inherit", marginBottom:16 }}>+ Add item</button>
            {/* Macros */}
            <div style={{ fontSize:10, color:T.textDim, letterSpacing:3, textTransform:"uppercase", marginBottom:8 }}>Macros</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:8, marginBottom:20 }}>
              {[["Calories","cals"],["Protein (g)","p"],["Fat (g)","f"],["Carbs (g)","c"]].map(([l,k])=>(
                <div key={k}>
                  <div style={{ fontSize:9, color:T.textDim, marginBottom:4, letterSpacing:1 }}>{l}</div>
                  <input value={editContent[k]} onChange={e=>setEditContent(p=>({...p,[k]:e.target.value}))} type="number" style={{ width:"100%", background:T.surfaceHigh, border:`1px solid ${T.border}`, borderRadius:8, padding:"8px 6px", color:T.text, fontSize:13, fontFamily:"inherit", outline:"none", boxSizing:"border-box" }} />
                </div>
              ))}
            </div>
            <button onClick={saveEdit} style={{ width:"100%", padding:"14px 0", background:T.accent, border:"none", borderRadius:10, color:"#fff", fontSize:14, cursor:"pointer", fontFamily:"inherit" }}>Save Changes</button>
          </div>
        </div>
      )}

      {/* ── BOTTOM NAV ── */}
      <div style={{ position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)", width:"100%", maxWidth:480, background:T.surface, borderTop:`1px solid ${T.border}`, display:"flex", zIndex:10 }}>
        {[
          { id:"plan", icon:"plan", label:"Plan" },
          { id:"ideas", icon:"ideas", label:"Recipes" },
          { id:"grocery", icon:"grocery", label:"Grocery" },
          { id:"log", icon:"log", label:"Log" },
        ].map(item => (
          <button key={item.id} onClick={()=>setTab(item.id)} style={{
            flex:1, padding:"12px 4px 10px",
            background:"none", border:"none",
            color: tab===item.id ? T.accent : T.textDim,
            cursor:"pointer", fontFamily:"inherit",
            display:"flex", flexDirection:"column", alignItems:"center", gap:3,
            transition:"color 0.15s",
          }}>
            <Icon name={item.icon} size={20} color={tab===item.id ? T.accent : T.textDim} />
            <div style={{ fontSize:9, letterSpacing:1, textTransform:"uppercase" }}>{item.label}</div>
            {tab===item.id && <div style={{ width:4, height:4, borderRadius:"50%", background:T.accent }} />}
          </button>
        ))}
      </div>
    </div>
  );
}
