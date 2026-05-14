import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Trash2,
  Printer,
  Wheat,
  Thermometer,
  Droplets,
  Mountain,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Scale,
  ChefHat,
  Settings,
  BookOpen,
  ClipboardList,
  FlaskConical,
  Save,
  Copy,
} from "lucide-react";

function Card({ children, className = "" }) {
  return <div className={`card ${className}`}>{children}</div>;
}

function CardContent({ children, className = "" }) {
  return <div className={className}>{children}</div>;
}

function Button({ children, onClick, className = "", variant, size }) {
  return (
    <button
      onClick={onClick}
      className={`btn ${variant || ""} ${size || ""} ${className}`}
    >
      {children}
    </button>
  );
}

const initialRecipes = [
  {
    id: "rustic-loaf",
    name: "Rustic Sourdough Loaf",
    category: "Loaf",
    unitsLabel: "loaves",
    finishedUnitWeight: 680,
    bakeLossPct: 12,
    batchMaxDoughG: 7200,
    flourTypes: [
      { name: "Bread Flour", pct: 85 },
      { name: "Whole Wheat Flour", pct: 15 },
    ],
    hydrationPct: 78,
    starterPct: 22,
    starterHydrationPct: 100,
    saltPct: 2.1,
    otherIngredients: [],
    process: {
      autolyseMin: 30,
      mixMin: 12,
      bulkMin: 300,
      foldCount: 4,
      foldIntervalMin: 30,
      benchRestMin: 20,
      finalProofMin: 180,
      bakeTempF: 475,
      bakeMin: 42,
      coolMin: 120,
    },
  },
  {
    id: "ciabatta",
    name: "Ciabatta",
    category: "High Hydration",
    unitsLabel: "pieces",
    finishedUnitWeight: 280,
    bakeLossPct: 14,
    batchMaxDoughG: 6500,
    flourTypes: [{ name: "Bread Flour", pct: 100 }],
    hydrationPct: 88,
    starterPct: 18,
    starterHydrationPct: 100,
    saltPct: 2.2,
    otherIngredients: [{ name: "Olive Oil", pct: 2 }],
    process: {
      autolyseMin: 20,
      mixMin: 10,
      bulkMin: 240,
      foldCount: 4,
      foldIntervalMin: 25,
      benchRestMin: 0,
      finalProofMin: 60,
      bakeTempF: 460,
      bakeMin: 24,
      coolMin: 60,
    },
  },
  {
    id: "baguette",
    name: "Sourdough Baguette",
    category: "Baguette",
    unitsLabel: "baguettes",
    finishedUnitWeight: 300,
    bakeLossPct: 13,
    batchMaxDoughG: 6000,
    flourTypes: [{ name: "Bread Flour", pct: 100 }],
    hydrationPct: 72,
    starterPct: 20,
    starterHydrationPct: 100,
    saltPct: 2,
    otherIngredients: [],
    process: {
      autolyseMin: 25,
      mixMin: 10,
      bulkMin: 210,
      foldCount: 3,
      foldIntervalMin: 30,
      benchRestMin: 20,
      finalProofMin: 75,
      bakeTempF: 480,
      bakeMin: 22,
      coolMin: 45,
    },
  },
  {
    id: "sandwich-loaf",
    name: "Sourdough Sandwich Loaf",
    category: "Pan Loaf",
    unitsLabel: "loaves",
    finishedUnitWeight: 720,
    bakeLossPct: 10,
    batchMaxDoughG: 7800,
    flourTypes: [{ name: "Bread Flour", pct: 100 }],
    hydrationPct: 68,
    starterPct: 18,
    starterHydrationPct: 100,
    saltPct: 2,
    otherIngredients: [
      { name: "Honey / Sugar", pct: 5 },
      { name: "Butter / Oil", pct: 6 },
      { name: "Milk Powder", pct: 3 },
    ],
    process: {
      autolyseMin: 0,
      mixMin: 14,
      bulkMin: 240,
      foldCount: 2,
      foldIntervalMin: 35,
      benchRestMin: 15,
      finalProofMin: 150,
      bakeTempF: 385,
      bakeMin: 38,
      coolMin: 120,
    },
  },
];

const defaultSettings = {
  altitudeFt: 980,
  baselineTempF: 72,
  baselineHumidityPct: 55,
  starterHydrationPct: 100,
  levainBufferPct: 10,
  ingredientBufferPct: 3,
  mixerCapacityG: 7000,
  ovenCapacityUnits: 8,
  proofingCapacityUnits: 24,
  defaultStartTime: "06:00",
};

function round(value, digits = 0) {
  const factor = Math.pow(10, digits);
  return Math.round((Number(value) || 0) * factor) / factor;
}

function minutesToLabel(minutes) {
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  if (h <= 0) return `${m} min`;
  if (m === 0) return `${h} hr`;
  return `${h} hr ${m} min`;
}

function addMinutesToTime(time, minutes) {
  const [h, m] = time.split(":").map(Number);

  const base = h * 60 + m + Math.round(minutes);

  const dayMin = ((base % 1440) + 1440) % 1440;

  const hour24 = Math.floor(dayMin / 60);
  const minute = dayMin % 60;

  const ampm = hour24 >= 12 ? "PM" : "AM";

  let hour12 = hour24 % 12;

  if (hour12 === 0) hour12 = 12;

  const hh = String(hour12);
  const mm = String(minute).padStart(2, "0");

  return `${hh}:${mm} ${ampm}`;
}

function tempFermentationFactor(tempF, baselineF) {
  const diff = tempF - baselineF;
  const factor = 1 - diff * 0.035;
  return Math.min(1.35, Math.max(0.62, factor));
}

function humidityHydrationAdjustment(humidityPct, baselineHumidityPct) {
  const diff = humidityPct - baselineHumidityPct;
  if (diff <= -20) return 1.5;
  if (diff <= -10) return 0.8;
  if (diff >= 20) return -1.0;
  if (diff >= 10) return -0.5;
  return 0;
}

function altitudeBakeAdjustment(altitudeFt) {
  if (altitudeFt < 1500) return { tempF: 0, timePct: 0, hydrationPct: 0 };
  if (altitudeFt < 3000) return { tempF: 5, timePct: 3, hydrationPct: 0.5 };
  if (altitudeFt < 5000) return { tempF: 10, timePct: 6, hydrationPct: 1 };
  return { tempF: 15, timePct: 10, hydrationPct: 1.5 };
}

function calculateRecipePlan(recipe, quantity, env, settings) {
  const qty = Number(quantity) || 0;
  const desiredBakedWeight = qty * recipe.finishedUnitWeight;
  const doughWeight = desiredBakedWeight / (1 - recipe.bakeLossPct / 100);

  const humidityAdj = humidityHydrationAdjustment(
    env.humidityPct,
    settings.baselineHumidityPct
  );
  const altitudeAdj = altitudeBakeAdjustment(settings.altitudeFt);
  const adjustedHydrationPct =
    recipe.hydrationPct + humidityAdj + altitudeAdj.hydrationPct;

  const otherPct = recipe.otherIngredients.reduce(
    (sum, item) => sum + Number(item.pct || 0),
    0
  );

  const formulaTotalPct =
    100 + adjustedHydrationPct + recipe.starterPct + recipe.saltPct + otherPct;

  const baseFlourG = doughWeight / (formulaTotalPct / 100);

  const starterG = (baseFlourG * recipe.starterPct) / 100;
  const waterG = (baseFlourG * adjustedHydrationPct) / 100;
  const saltG = (baseFlourG * recipe.saltPct) / 100;

  const flourBreakdown = recipe.flourTypes.map((f) => ({
    name: f.name,
    grams: (baseFlourG * f.pct) / 100,
    pct: f.pct,
  }));

  const otherBreakdown = recipe.otherIngredients.map((item) => ({
    name: item.name,
    grams: (baseFlourG * item.pct) / 100,
    pct: item.pct,
  }));

  const fermentationFactor = tempFermentationFactor(
    env.tempF,
    settings.baselineTempF
  );

  const bulkMin = recipe.process.bulkMin * fermentationFactor;
  const finalProofMin = recipe.process.finalProofMin * fermentationFactor;
  const bakeMin = recipe.process.bakeMin * (1 + altitudeAdj.timePct / 100);
  const bakeTempF = recipe.process.bakeTempF + altitudeAdj.tempF;

  const batchesByMixer = Math.ceil(
    doughWeight / Math.min(recipe.batchMaxDoughG, settings.mixerCapacityG)
  );

  const ovenLoads = Math.ceil(qty / settings.ovenCapacityUnits);

  const totalProcessMin =
    recipe.process.autolyseMin +
    recipe.process.mixMin +
    bulkMin +
    recipe.process.benchRestMin +
    finalProofMin +
    bakeMin * ovenLoads +
    recipe.process.coolMin;

  return {
    recipe,
    quantity: qty,
    desiredBakedWeight,
    doughWeight,
    baseFlourG,
    starterG,
    waterG,
    saltG,
    flourBreakdown,
    otherBreakdown,
    adjustedHydrationPct,
    humidityAdj,
    altitudeAdj,
    fermentationFactor,
    bulkMin,
    finalProofMin,
    bakeMin,
    bakeTempF,
    batchesByMixer,
    ovenLoads,
    totalProcessMin,
  };
}

function StatCard({ icon: Icon, label, value, sub }) {
  return (
    <Card className="stat-card">
      <CardContent className="stat-card-content">
        <div className="icon-badge">
          <Icon size={20} />
        </div>
        <div>
          <p className="muted small">{label}</p>
          <p className="stat-value">{value}</p>
          {sub && <p className="muted tiny">{sub}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

function ProgressBar({ label, value, max, suffix = "", warningAt = 90 }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  const isWarn = pct >= warningAt;

  return (
    <div className="progress-wrap">
      <div className="progress-head">
        <span>{label}</span>
        <span className={isWarn ? "warning-text" : "muted"}>
          {round(value)} / {round(max)}
          {suffix}
        </span>
      </div>
      <div className="progress-track">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.7 }}
          className={isWarn ? "progress-fill warning" : "progress-fill"}
        />
      </div>
    </div>
  );
}

function NumberInput({ label, value, onChange, suffix, min = 0, step = "any" }) {
  return (
    <label className="field">
      <span>{label}</span>
      <div className="input-wrap">
        <input
          type="number"
          min={min}
          step={step}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        {suffix && <span className="suffix">{suffix}</span>}
      </div>
    </label>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState("planner");
  const [recipes, setRecipes] = useState(initialRecipes);
  const [settings, setSettings] = useState(defaultSettings);
  const [env, setEnv] = useState({ tempF: 74, humidityPct: 52 });
  const [quantities, setQuantities] = useState({
    "rustic-loaf": 12,
    ciabatta: 20,
    baguette: 24,
    "sandwich-loaf": 8,
  });
  const [selectedRecipeId, setSelectedRecipeId] = useState(initialRecipes[0].id);

  const plans = useMemo(() => {
    return recipes
      .map((recipe) =>
        calculateRecipePlan(recipe, quantities[recipe.id], env, settings)
      )
      .filter((plan) => plan.quantity > 0);
  }, [recipes, quantities, env, settings]);

  const totals = useMemo(() => {
    const flourMap = {};
    const otherMap = {};
    let doughWeight = 0;
    let starterG = 0;
    let waterG = 0;
    let saltG = 0;
    let units = 0;
    let maxProcess = 0;

    plans.forEach((plan) => {
      doughWeight += plan.doughWeight;
      starterG += plan.starterG;
      waterG += plan.waterG;
      saltG += plan.saltG;
      units += plan.quantity;
      maxProcess = Math.max(maxProcess, plan.totalProcessMin);

      plan.flourBreakdown.forEach((f) => {
        flourMap[f.name] = (flourMap[f.name] || 0) + f.grams;
      });

      plan.otherBreakdown.forEach((item) => {
        otherMap[item.name] = (otherMap[item.name] || 0) + item.grams;
      });
    });

    const ingredientBuffer = 1 + settings.ingredientBufferPct / 100;

    return {
      doughWeight,
      starterG,
      waterG,
      saltG,
      units,
      maxProcess,
      flourMap,
      otherMap,
      bufferedStarterG: starterG * (1 + settings.levainBufferPct / 100),
      bufferedFlourMap: Object.fromEntries(
        Object.entries(flourMap).map(([k, v]) => [k, v * ingredientBuffer])
      ),
      bufferedWaterG: waterG * ingredientBuffer,
      bufferedSaltG: saltG * ingredientBuffer,
    };
  }, [plans, settings]);

  const levain = useMemo(() => {
    const totalLevain = totals.bufferedStarterG;
    const hydration = settings.starterHydrationPct / 100;
    const flour = totalLevain / (1 + hydration);
    const water = totalLevain - flour;
    const seedStarter = totalLevain * 0.2;
    return { totalLevain, flour, water, seedStarter };
  }, [totals.bufferedStarterG, settings.starterHydrationPct]);

  const warnings = useMemo(() => {
    const list = [];
    const totalOvenLoads = plans.reduce((sum, p) => sum + p.ovenLoads, 0);
    const maxUnitsAtOnce = plans.reduce((sum, p) => sum + p.quantity, 0);
    const maxBatch = plans.some((p) => p.batchesByMixer > 1);

    if (maxBatch) {
      list.push(
        "One or more products exceed mixer or recipe batch capacity and need split batches."
      );
    }

    if (maxUnitsAtOnce > settings.proofingCapacityUnits) {
      list.push(
        "Planned unit count exceeds saved proofing capacity. Stagger production or add proofing space."
      );
    }

    if (totalOvenLoads > 6) {
      list.push(
        "Oven schedule may be long. Consider staggering mix times or reducing same-day variety count."
      );
    }

    if (env.tempF >= settings.baselineTempF + 6) {
      list.push("Room is warm compared with baseline. Watch bulk fermentation closely.");
    }

    if (env.tempF <= settings.baselineTempF - 6) {
      list.push("Room is cool compared with baseline. Expect slower fermentation.");
    }

    return list;
  }, [plans, settings, env]);

  const selectedRecipe =
    recipes.find((r) => r.id === selectedRecipeId) || recipes[0];

  function updateRecipeField(field, value) {
    setRecipes((prev) =>
      prev.map((r) => (r.id === selectedRecipe.id ? { ...r, [field]: value } : r))
    );
  }

  function updateRecipeProcess(field, value) {
    setRecipes((prev) =>
      prev.map((r) =>
        r.id === selectedRecipe.id
          ? { ...r, process: { ...r.process, [field]: Number(value) || 0 } }
          : r
      )
    );
  }

  function addRecipe() {
    const id = `recipe-${Date.now()}`;
    const base = {
      ...initialRecipes[0],
      id,
      name: "New Sourdough Product",
      category: "Custom",
      flourTypes: [{ name: "Bread Flour", pct: 100 }],
      otherIngredients: [],
    };
    setRecipes((prev) => [...prev, base]);
    setSelectedRecipeId(id);
    setActiveTab("recipes");
  }

  function duplicateRecipe() {
    const id = `${selectedRecipe.id}-copy-${Date.now()}`;
    setRecipes((prev) => [
      ...prev,
      { ...selectedRecipe, id, name: `${selectedRecipe.name} Copy` },
    ]);
    setSelectedRecipeId(id);
  }

  function deleteRecipe(id) {
    if (recipes.length <= 1) return;
    setRecipes((prev) => prev.filter((r) => r.id !== id));
    setSelectedRecipeId(recipes.find((r) => r.id !== id)?.id || recipes[0].id);
  }

  const tabButton = (id, label, Icon) => (
    <button
      onClick={() => setActiveTab(id)}
      className={activeTab === id ? "tab active" : "tab"}
    >
      <Icon size={16} /> {label}
    </button>
  );

  return (
    <div className="app">
      <div className="page">
        <header className="hero">
          <div className="hero-inner">
            <div>
              <div className="eyebrow">
                <Wheat size={16} /> Sourdough Production Planner
              </div>
              <h1>Plan consistent bake days with fewer surprises.</h1>
              <p>
                Scale recipes by finished goods, adjust for temperature,
                humidity, and altitude, then generate a practical production
                sheet for your bake day.
              </p>
            </div>
            <div className="hero-stats">
              <div>
                <p>Products</p>
                <strong>{recipes.length}</strong>
              </div>
              <div>
                <p>Planned Units</p>
                <strong>{round(totals.units)}</strong>
              </div>
            </div>
          </div>
        </header>

        <nav className="tabs">
          {tabButton("planner", "Bake Plan", ClipboardList)}
          {tabButton("recipes", "Recipes", BookOpen)}
          {tabButton("starter", "Starter", FlaskConical)}
          {tabButton("sheet", "Production Sheet", Printer)}
          {tabButton("settings", "Settings", Settings)}
        </nav>

        {activeTab === "planner" && (
          <div className="layout two-col">
            <div className="stack">
              <Card>
                <CardContent className="panel">
                  <div className="section-head">
                    <div>
                      <h2>Production Quantities</h2>
                      <p>
                        Enter how many finished goods you want for this bake
                        period.
                      </p>
                    </div>
                    <Button onClick={addRecipe}>
                      <Plus size={16} /> Add Product
                    </Button>
                  </div>

                  <div className="stack">
                    {recipes.map((recipe) => (
                      <div key={recipe.id} className="recipe-row">
                        <div>
                          <p className="recipe-title">{recipe.name}</p>
                          <p className="muted small">
                            {recipe.finishedUnitWeight}g finished weight •{" "}
                            {recipe.hydrationPct}% base hydration •{" "}
                            {recipe.starterPct}% starter
                          </p>
                        </div>
                        <NumberInput
                          label={`Qty (${recipe.unitsLabel})`}
                          value={quantities[recipe.id] || ""}
                          onChange={(v) =>
                            setQuantities((prev) => ({
                              ...prev,
                              [recipe.id]: Number(v),
                            }))
                          }
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="panel">
                  <h2>Current Bake Conditions</h2>
                  <div className="grid two">
                    <NumberInput
                      label="Room Temperature"
                      value={env.tempF}
                      onChange={(v) =>
                        setEnv((p) => ({ ...p, tempF: Number(v) }))
                      }
                      suffix="°F"
                    />
                    <NumberInput
                      label="Room Humidity"
                      value={env.humidityPct}
                      onChange={(v) =>
                        setEnv((p) => ({ ...p, humidityPct: Number(v) }))
                      }
                      suffix="%"
                    />
                  </div>

                  <div className="grid three">
                    <ProgressBar
                      label="Fermentation Speed"
                      value={round(100 / (plans[0]?.fermentationFactor || 1))}
                      max={160}
                      suffix="%"
                      warningAt={120}
                    />
                    <ProgressBar
                      label="Proofing Capacity"
                      value={totals.units}
                      max={settings.proofingCapacityUnits}
                      suffix=" units"
                      warningAt={90}
                    />
                    <ProgressBar
                      label="Mixer Load"
                      value={Math.max(
                        ...plans.map((p) =>
                          Math.min(p.doughWeight, settings.mixerCapacityG)
                        ),
                        0
                      )}
                      max={settings.mixerCapacityG}
                      suffix="g"
                      warningAt={90}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            <aside className="stack">
              <StatCard
                icon={Scale}
                label="Total Dough"
                value={`${round(totals.doughWeight / 1000, 1)} kg`}
                sub="before bake loss"
              />
              <StatCard
                icon={Wheat}
                label="Starter Needed"
                value={`${round(totals.bufferedStarterG)} g`}
                sub={`includes ${settings.levainBufferPct}% levain buffer`}
              />
              <StatCard
                icon={Clock}
                label="Longest Product Window"
                value={minutesToLabel(totals.maxProcess)}
                sub={`starting near ${settings.defaultStartTime}`}
              />
              <StatCard
                icon={Mountain}
                label="Altitude Setting"
                value={`${settings.altitudeFt} ft`}
                sub="saved as a permanent variable"
              />

              <Card>
                <CardContent className="panel">
                  <div className="inline-head">
                    {warnings.length ? (
                      <AlertTriangle size={20} className="amber" />
                    ) : (
                      <CheckCircle2 size={20} className="green" />
                    )}
                    <h3>Plan Check</h3>
                  </div>

                  {warnings.length ? (
                    <div className="stack">
                      {warnings.map((w, idx) => (
                        <p key={idx} className="notice warning-box">
                          {w}
                        </p>
                      ))}
                    </div>
                  ) : (
                    <p className="notice good-box">
                      No major production conflicts found.
                    </p>
                  )}
                </CardContent>
              </Card>
            </aside>
          </div>
        )}

        {activeTab === "recipes" && (
          <div className="layout recipe-layout">
            <Card>
              <CardContent className="panel">
                <div className="section-head">
                  <h2>Recipe Library</h2>
                  <Button onClick={addRecipe}>
                    <Plus size={16} />
                  </Button>
                </div>

                <div className="stack">
                  {recipes.map((recipe) => (
                    <button
                      key={recipe.id}
                      onClick={() => setSelectedRecipeId(recipe.id)}
                      className={
                        selectedRecipeId === recipe.id
                          ? "recipe-select active"
                          : "recipe-select"
                      }
                    >
                      <p>{recipe.name}</p>
                      <span>{recipe.category}</span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="panel">
                <div className="section-head">
                  <div>
                    <h2>Edit Recipe</h2>
                    <p>
                      Use baker’s percentages so every product scales cleanly.
                    </p>
                  </div>
                  <div className="button-row">
                    <Button variant="outline" onClick={duplicateRecipe}>
                      <Copy size={16} /> Duplicate
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => deleteRecipe(selectedRecipe.id)}
                    >
                      <Trash2 size={16} /> Delete
                    </Button>
                  </div>
                </div>

                <div className="grid two">
                  <label className="field span-two">
                    <span>Product Name</span>
                    <input
                      value={selectedRecipe.name}
                      onChange={(e) =>
                        updateRecipeField("name", e.target.value)
                      }
                    />
                  </label>

                  <NumberInput
                    label="Finished Unit Weight"
                    value={selectedRecipe.finishedUnitWeight}
                    onChange={(v) =>
                      updateRecipeField("finishedUnitWeight", Number(v))
                    }
                    suffix="g"
                  />
                  <NumberInput
                    label="Bake Loss"
                    value={selectedRecipe.bakeLossPct}
                    onChange={(v) =>
                      updateRecipeField("bakeLossPct", Number(v))
                    }
                    suffix="%"
                  />
                  <NumberInput
                    label="Base Hydration"
                    value={selectedRecipe.hydrationPct}
                    onChange={(v) =>
                      updateRecipeField("hydrationPct", Number(v))
                    }
                    suffix="%"
                  />
                  <NumberInput
                    label="Starter / Levain"
                    value={selectedRecipe.starterPct}
                    onChange={(v) =>
                      updateRecipeField("starterPct", Number(v))
                    }
                    suffix="%"
                  />
                  <NumberInput
                    label="Salt"
                    value={selectedRecipe.saltPct}
                    onChange={(v) => updateRecipeField("saltPct", Number(v))}
                    suffix="%"
                  />
                  <NumberInput
                    label="Max Dough Per Batch"
                    value={selectedRecipe.batchMaxDoughG}
                    onChange={(v) =>
                      updateRecipeField("batchMaxDoughG", Number(v))
                    }
                    suffix="g"
                  />
                </div>

                <div>
                  <h3>Process Timing</h3>
                  <div className="grid four">
                    <NumberInput
                      label="Autolyse"
                      value={selectedRecipe.process.autolyseMin}
                      onChange={(v) => updateRecipeProcess("autolyseMin", v)}
                      suffix="min"
                    />
                    <NumberInput
                      label="Mix"
                      value={selectedRecipe.process.mixMin}
                      onChange={(v) => updateRecipeProcess("mixMin", v)}
                      suffix="min"
                    />
                    <NumberInput
                      label="Bulk"
                      value={selectedRecipe.process.bulkMin}
                      onChange={(v) => updateRecipeProcess("bulkMin", v)}
                      suffix="min"
                    />
                    <NumberInput
                      label="Final Proof"
                      value={selectedRecipe.process.finalProofMin}
                      onChange={(v) => updateRecipeProcess("finalProofMin", v)}
                      suffix="min"
                    />
                    <NumberInput
                      label="Bake Temp"
                      value={selectedRecipe.process.bakeTempF}
                      onChange={(v) => updateRecipeProcess("bakeTempF", v)}
                      suffix="°F"
                    />
                    <NumberInput
                      label="Bake Time"
                      value={selectedRecipe.process.bakeMin}
                      onChange={(v) => updateRecipeProcess("bakeMin", v)}
                      suffix="min"
                    />
                    <NumberInput
                      label="Cool Time"
                      value={selectedRecipe.process.coolMin}
                      onChange={(v) => updateRecipeProcess("coolMin", v)}
                      suffix="min"
                    />
                    <NumberInput
                      label="Fold Count"
                      value={selectedRecipe.process.foldCount}
                      onChange={(v) => updateRecipeProcess("foldCount", v)}
                      suffix="folds"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "starter" && (
          <div className="layout two-col">
            <Card>
              <CardContent className="panel">
                <h2>Levain Builder</h2>
                <p>
                  This uses the total starter required across the active bake
                  plan and adds your saved buffer.
                </p>

                <div className="stack">
                  <NumberInput
                    label="Starter Hydration"
                    value={settings.starterHydrationPct}
                    onChange={(v) =>
                      setSettings((p) => ({
                        ...p,
                        starterHydrationPct: Number(v),
                      }))
                    }
                    suffix="%"
                  />
                  <NumberInput
                    label="Levain Buffer"
                    value={settings.levainBufferPct}
                    onChange={(v) =>
                      setSettings((p) => ({
                        ...p,
                        levainBufferPct: Number(v),
                      }))
                    }
                    suffix="%"
                  />
                </div>
              </CardContent>
            </Card>

            <div className="grid two">
              <StatCard
                icon={FlaskConical}
                label="Total Mature Levain"
                value={`${round(levain.totalLevain)} g`}
                sub="including buffer"
              />
              <StatCard
                icon={Wheat}
                label="Flour for Levain"
                value={`${round(levain.flour)} g`}
                sub={`${settings.starterHydrationPct}% hydration`}
              />
              <StatCard
                icon={Droplets}
                label="Water for Levain"
                value={`${round(levain.water)} g`}
                sub="for levain build"
              />
              <StatCard
                icon={ChefHat}
                label="Seed Starter Estimate"
                value={`${round(levain.seedStarter)} g`}
                sub="editable later as feeding ratios are added"
              />
            </div>
          </div>
        )}

        {activeTab === "sheet" && (
          <Card>
            <CardContent className="panel">
              <div className="section-head">
                <div>
                  <h2>Bake Day Production Sheet</h2>
                  <p>
                    Generated from current recipes, quantities, conditions, and
                    settings.
                  </p>
                </div>
                <Button onClick={() => window.print()}>
                  <Printer size={16} /> Print
                </Button>
              </div>

              <div className="grid four">
                <StatCard
                  icon={Scale}
                  label="Total Dough"
                  value={`${round(totals.doughWeight / 1000, 2)} kg`}
                />
                <StatCard
                  icon={ChefHat}
                  label="Finished Units"
                  value={round(totals.units)}
                />
                <StatCard
                  icon={Thermometer}
                  label="Room Temp"
                  value={`${env.tempF}°F`}
                />
                <StatCard
                  icon={Droplets}
                  label="Humidity"
                  value={`${env.humidityPct}%`}
                />
              </div>

              <div className="grid two">
                <div className="soft-panel">
                  <h3>Ingredient Pull List</h3>
                  <div>
                    {Object.entries(totals.bufferedFlourMap).map(
                      ([name, grams]) => (
                        <div key={name} className="line-item">
                          <span>{name}</span>
                          <strong>{round(grams)} g</strong>
                        </div>
                      )
                    )}
                    <div className="line-item">
                      <span>Water</span>
                      <strong>{round(totals.bufferedWaterG)} g</strong>
                    </div>
                    <div className="line-item">
                      <span>Mature Starter / Levain</span>
                      <strong>{round(totals.bufferedStarterG)} g</strong>
                    </div>
                    <div className="line-item">
                      <span>Salt</span>
                      <strong>{round(totals.bufferedSaltG)} g</strong>
                    </div>
                    {Object.entries(totals.otherMap).map(([name, grams]) => (
                      <div key={name} className="line-item">
                        <span>{name}</span>
                        <strong>
                          {round(grams * (1 + settings.ingredientBufferPct / 100))} g
                        </strong>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="soft-panel">
                  <h3>Environmental Adjustments</h3>
                  <p className="pill">
                    Fermentation timing factor:{" "}
                    <strong>
                      {round((plans[0]?.fermentationFactor || 1) * 100)}%
                    </strong>{" "}
                    of baseline.
                  </p>
                  <p className="pill">
                    Humidity hydration adjustment:{" "}
                    <strong>
                      {plans[0]?.humidityAdj > 0 ? "+" : ""}
                      {round(plans[0]?.humidityAdj || 0, 1)}%
                    </strong>
                    .
                  </p>
                  <p className="pill">
                    Altitude adjustment:{" "}
                    <strong>+{plans[0]?.altitudeAdj.tempF || 0}°F bake temp</strong>
                    ,{" "}
                    <strong>+{plans[0]?.altitudeAdj.timePct || 0}% bake time</strong>
                    .
                  </p>
                </div>
              </div>

              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Qty</th>
                      <th>Dough</th>
                      <th>Batches</th>
                      <th>Bulk</th>
                      <th>Proof</th>
                      <th>Bake</th>
                      <th>Suggested Timeline</th>
                    </tr>
                  </thead>
                  <tbody>
                    {plans.map((plan, idx) => {
                      let t = 0;
                      const start = settings.defaultStartTime;
                      const mix = addMinutesToTime(
                        start,
                        t + plan.recipe.process.autolyseMin
                      );
                      t += plan.recipe.process.autolyseMin + plan.recipe.process.mixMin;
                      const foldsEnd = addMinutesToTime(
                        start,
                        t +
                          Math.min(
                            plan.bulkMin,
                            plan.recipe.process.foldCount *
                              plan.recipe.process.foldIntervalMin
                          )
                      );
                      t += plan.bulkMin;
                      const shape = addMinutesToTime(
                        start,
                        t + plan.recipe.process.benchRestMin
                      );
                      t += plan.recipe.process.benchRestMin + plan.finalProofMin;
                      const bake = addMinutesToTime(start, t);

                      return (
                        <tr key={plan.recipe.id} className={idx % 2 ? "" : "alt"}>
                          <td>
                            <strong>{plan.recipe.name}</strong>
                          </td>
                          <td>{plan.quantity}</td>
                          <td>{round(plan.doughWeight)}g</td>
                          <td>{plan.batchesByMixer}</td>
                          <td>{minutesToLabel(plan.bulkMin)}</td>
                          <td>{minutesToLabel(plan.finalProofMin)}</td>
                          <td>
                            {round(plan.bakeTempF)}°F / {minutesToLabel(plan.bakeMin)}
                          </td>
                          <td className="tiny">
                            Mix {mix} • Folds done {foldsEnd} • Shape {shape} • Bake{" "}
                            {bake}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "settings" && (
          <Card>
            <CardContent className="panel">
              <div>
                <h2>Permanent Settings</h2>
                <p>
                  These stay saved as assumptions for your regular bake location
                  and equipment.
                </p>
              </div>

              <div className="grid three">
                <NumberInput
                  label="Altitude"
                  value={settings.altitudeFt}
                  onChange={(v) =>
                    setSettings((p) => ({ ...p, altitudeFt: Number(v) }))
                  }
                  suffix="ft"
                />
                <NumberInput
                  label="Baseline Temperature"
                  value={settings.baselineTempF}
                  onChange={(v) =>
                    setSettings((p) => ({ ...p, baselineTempF: Number(v) }))
                  }
                  suffix="°F"
                />
                <NumberInput
                  label="Baseline Humidity"
                  value={settings.baselineHumidityPct}
                  onChange={(v) =>
                    setSettings((p) => ({
                      ...p,
                      baselineHumidityPct: Number(v),
                    }))
                  }
                  suffix="%"
                />
                <NumberInput
                  label="Mixer Capacity"
                  value={settings.mixerCapacityG}
                  onChange={(v) =>
                    setSettings((p) => ({ ...p, mixerCapacityG: Number(v) }))
                  }
                  suffix="g dough"
                />
                <NumberInput
                  label="Oven Capacity"
                  value={settings.ovenCapacityUnits}
                  onChange={(v) =>
                    setSettings((p) => ({
                      ...p,
                      ovenCapacityUnits: Number(v),
                    }))
                  }
                  suffix="units"
                />
                <NumberInput
                  label="Proofing Capacity"
                  value={settings.proofingCapacityUnits}
                  onChange={(v) =>
                    setSettings((p) => ({
                      ...p,
                      proofingCapacityUnits: Number(v),
                    }))
                  }
                  suffix="units"
                />
                <NumberInput
                  label="Ingredient Buffer"
                  value={settings.ingredientBufferPct}
                  onChange={(v) =>
                    setSettings((p) => ({
                      ...p,
                      ingredientBufferPct: Number(v),
                    }))
                  }
                  suffix="%"
                />
                <label className="field">
                  <span>Default Start Time</span>
                  <input
                    type="time"
                    value={settings.defaultStartTime}
                    onChange={(e) =>
                      setSettings((p) => ({
                        ...p,
                        defaultStartTime: e.target.value,
                      }))
                    }
                  />
                </label>
              </div>

              <div className="soft-panel">
                <div className="inline-head">
                  <Save size={16} />
                  <strong>Next build recommendation</strong>
                </div>
                Add browser local storage so recipes, settings, and production
                history persist after refreshing. Then add Google Sheets syncing.
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
