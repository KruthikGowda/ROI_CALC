"use strict";

// ! button toggle to show or hide based on change *****************************************

// function initDOMInput() {
//   window.noOfSkus = document.getElementById("Number_of_SKUs").value;
//   window.noOfWarehouses = document.getElementById("Number_of_Warehouses_+_Cs_+_Stores").value;
//   window.annualRevenue = document.getElementById("Annual_Revenue_(In USD millions)").value;
//   window.marginPercentage = document.getElementById("Margin_%").value;
//   window.avgDaysOnHand = document.getElementById("Average_days_on_hand").value;
// }

window.useSubmit = false;

if (window.useSubmit) {
  document.getElementById("submitButton").style.display = "none";
}

document.getElementById("submitButton").addEventListener("click", (e) => {
  e.preventDefault();
  calculate_roi();
});

// ! FORM VALIDATION
// ! GETTING VALID INPUTS FROM PAGE
document.getElementById("Number_of_SKUs").attributes["type"].value = "number";
document.getElementById("Number_of_Warehouses_+_Cs_+_Stores").attributes["type"].value = "number";
document.getElementById("Annual_Revenue_(In USD millions)").attributes["type"].value = "number";
document.getElementById("Margin_%").attributes["type"].value = "number";
document.getElementById("Average_days_on_hand").attributes["type"].value = "number";

document.getElementById("Number_of_SKUs").addEventListener("input", (e) => {
  if (e.target.value < 0) {
    alert("Please enter a valid number");
    return;
  } else {
    window.noOfSkus = e.target.value;
    if (window.useSubmit) {
      calculate_roi();
    }
  }
});

document.getElementById("Number_of_Warehouses_+_Cs_+_Stores").addEventListener("input", (e) => {
  if (e.target.value < 0) {
    alert("Please enter a valid number");
    e.target.value = null;
    return;
  } else {
    window.noOfWarehouses = e.target.value;
    if (window.useSubmit) {
      calculate_roi();
    }
  }
});

document.getElementById("Annual_Revenue_(In USD millions)").addEventListener("input", (e) => {
  if (e.target.value < 0) {
    alert("Please enter a valid number");
    return;
  } else {
    window.annualRevenue = e.target.value;
    if (window.useSubmit) {
      calculate_roi();
    }
  }
});

document.getElementById("Margin_%").addEventListener("input", (e) => {
  if (e.target.value < 0) {
    alert("Please enter a valid number");
    return;
  } else {
    window.marginPercentage = e.target.value;
    if (window.useSubmit) {
      calculate_roi();
    }
  }
});

document.getElementById("Average_days_on_hand").addEventListener("input", (e) => {
  if (e.target.value < 0) {
    alert("Please enter a valid number");
    return;
  } else {
    window.avgDaysOnHand = e.target.value;
    if (window.useSubmit) {
      calculate_roi();
    }
  }
});
// ! ************ END OF FORM VALIDATION ************

//ACTION: Caluating ROI outputs
//INPUT: Variables declared in initVar()
//OUTPUT: Gives Required ROI Outputs

function calculate_roi() {
  console.time("Execution Time");
  // initDOMInput();

  // ! Calculations of value passed into funtions parameters

  const Annual_Revenue_ = window.annualRevenue * 1000000;
  let anlRev = annualRev(Annual_Revenue_);

  let No_of_SKU_combs = window.noOfSkus * window.noOfWarehouses;
  let No_of_SKU_comb_range = skuCombinationHandler(No_of_SKU_combs);

  const out_of_stock_percent = lookUpTable(anlRev, No_of_SKU_comb_range, 0);

  const impact_percentage = lookUpTable(anlRev, No_of_SKU_comb_range, 1);

  // ! POTENTIAL OUT OF STOCKS HANDLER
  const Potential_out_of_stock_losses = Potential_out_of_stock_losses_handler(
    Annual_Revenue_,
    out_of_stock_percent,
    No_of_SKU_combs
  );

  // ! SCOPE OF REVENUE INCREASE HANDLER
  const Scope_of_revenue_increase = Scope_of_revenue_increase_handler(
    Potential_out_of_stock_losses,
    impact_percentage
  );

  // ! Calculations of value passed into funtions parameters
  const Inventory_turns = (365 / window.avgDaysOnHand).toFixed(2);
  let Inventory_cost_per_turn =
    (Annual_Revenue_ * (1 - window.marginPercentage * 0.01)) / Inventory_turns;
  Inventory_cost_per_turn = Math.round(Inventory_cost_per_turn);

  // ! SCOPE OF FINAL INVENTORY COST HANDLER
  let Final_Inventory_cost = Final_Inventory_cost_handler(No_of_SKU_combs, Inventory_cost_per_turn);

  // ! Calculations of value passed into funtions parameters
  const Inventory_cost_saved_per_turn = Math.round(
    Final_Inventory_cost * (impact_percentage * 0.01)
  );

  // ! SCOPE OF INVENTORY COST THAT CAN BE SAVED HANDLER
  const Inventory_cost_can_be_saved = Inventory_cost_can_be_saved_handler(
    Inventory_cost_saved_per_turn,
    Inventory_turns
  );

  // ! Output of calculations done
  let dollarUSLocale = Intl.NumberFormat("en-US");
  document.getElementById("ptag_1").innerHTML =
    // "Potential out of stock losses: &nbsp;$" + dollarUSLocale.format(Potential_out_of_stock_losses);
    `Potential out of stock losses: &nbsp;$ ${
      Potential_out_of_stock_losses ? dollarUSLocale.format(Potential_out_of_stock_losses) : 0
    }`;

  document.getElementById("ptag_2").innerHTML =
    // "Scope of revenue increase: &nbsp;$" + dollarUSLocale.format(Scope_of_revenue_increase);
    `Scope of revenue increase: &nbsp;$ ${
      Scope_of_revenue_increase ? dollarUSLocale.format(Scope_of_revenue_increase) : 0
    }`;

  document.getElementById("ptag_3").innerHTML =
    // "Final inventory cost: &nbsp;$" + dollarUSLocale.format(Final_Inventory_cost);
    `Final inventory cost: &nbsp;$ ${
      Final_Inventory_cost ? dollarUSLocale.format(Final_Inventory_cost) : 0
    }`;

  document.getElementById("ptag_4").innerHTML =
    // "Inventory cost that can be saved: &nbsp;$" +
    // dollarUSLocale.format(Inventory_cost_can_be_saved);
    `Inventory cost that can be saved: &nbsp;$ ${
      Inventory_cost_can_be_saved ? dollarUSLocale.format(Inventory_cost_can_be_saved) : 0
    }`;

  console.timeEnd("Execution Time");
}

/**
 * @param  {} Annual_Revenue_
 * @param  {} out_of_stock_percent
 * @param  {} No_of_SKU_combs
 */
function Potential_out_of_stock_losses_handler(
  Annual_Revenue_,
  out_of_stock_percent,
  No_of_SKU_combs
) {
  const Potential_out_of_stock_losses = Math.round(
    Annual_Revenue_ * (out_of_stock_percent * 0.01) + 0.02495 * No_of_SKU_combs
  );

  return Potential_out_of_stock_losses;
}

/**
 * @param  {} Potential_out_of_stock_losses
 * @param  {} impact_percentage
 */
function Scope_of_revenue_increase_handler(Potential_out_of_stock_losses, impact_percentage) {
  let Scope_of_revenue_increase = Math.round(
    Potential_out_of_stock_losses * (impact_percentage * 0.01)
  );

  return Scope_of_revenue_increase;
}

/**
 * @param  {} Inventory_cost_saved_per_turn
 * @param  {} Inventory_turns
 */
function Inventory_cost_can_be_saved_handler(Inventory_cost_saved_per_turn, Inventory_turns) {
  let Inventory_cost_can_be_saved = Math.round(
    Inventory_cost_saved_per_turn.toFixed(2) * Inventory_turns
  );

  return Inventory_cost_can_be_saved;
}

/**
 * @param  {} No_of_SKU_combs
 * @param  {} Inventory_cost_per_turn
 */
function Final_Inventory_cost_handler(No_of_SKU_combs, Inventory_cost_per_turn) {
  let Final_Inventory_cost =
    No_of_SKU_combs > 1000000
      ? Inventory_cost_per_turn + 0.000001243 * No_of_SKU_combs
      : Inventory_cost_per_turn + 0.001243 * No_of_SKU_combs;
  return (Final_Inventory_cost = Math.round(Final_Inventory_cost));
}

/**
 * @param  {} annualRevenue
 */

function annualRev(annualRevenue) {
  let anlRev =
    annualRevenue <= 15000000
      ? "<15M"
      : annualRevenue <= 50000000
      ? "15M-50M"
      : annualRevenue <= 500000000
      ? "50M-500M"
      : annualRevenue <= 1000000000
      ? "500M-1B"
      : annualRevenue <= 5000000000
      ? "1B-5B"
      : annualRevenue <= 10000000000
      ? "5B-10B"
      : "10B+";

  return anlRev;
}

/**
 * @param  {} noOfSKU
 */
function skuCombinationHandler(noOfSKU) {
  return noOfSKU <= 50000
    ? "50K"
    : noOfSKU <= 200000
    ? "50K-200K"
    : noOfSKU <= 500000
    ? "200K-500K"
    : noOfSKU <= 1000000
    ? "500K-1M"
    : "1M+";
}

/**
 * @param  {} anlRev
 * @param  {} warehouseComboRange
 * @param  {} tabletype
 */
function lookUpTable(anlRev, warehouseComboRange, tabletype) {
  let check = warehouseComboRange + anlRev;
  let range = {
    // ! Combination 50K & Range
    // ! warehouseComboRange: 50K & anlRev(AnualRevenue): <15M =>  50K + <15M = 50K<15M
    "50K<15M": [17, 20],
    "50K15M-50M": [15, 21],
    "50K50M-500M": [13, 21],
    "50K500M-1B": [12, 22],
    "50K1B-5B": [10, 23],
    "50K5B-10B": [8, 24],
    "50K10B+": [6, 24],

    // ! Combination 50K-200K & Range
    "50K-200K<15M": [18, 21],
    "50K-200K15M-50M": [16, 21],
    "50K-200K50M-500M": [14, 22],
    "50K-200K500M-1B": [13, 22],
    "50K-200K1B-5B": [11, 23],
    "50K-200K5B-10B": [9, 24],
    "50K-200K10B+": [7, 24],

    // ! Combination 200K-500k & Range
    "200K-500K<15M": [19, 22],
    "200K-500K15M-50M": [16, 22],
    "200K-500K50M-500M": [14, 22],
    "200K-500K500M-1B": [14, 23],
    "200K-500K1B-5B": [12, 23],
    "200K-500K5B-10B": [9, 24],
    "200K-500K10B+": [8, 24],

    // ! Combination 500k-1M & Range
    "500K-1M<15M": [19, 23],
    "500K-1M15M-50M": [17, 23],
    "500K-1M50M-500M": [15, 23],
    "500K-1M500M-1B": [14, 23],
    "500K-1M1B-5B": [12, 24],
    "500K-1M5B-10B": [10, 24],
    "500K-1M10B+": [9, 24],

    // ! Combination 1M+ & Range
    "1M+<15M": [20, 24],
    "1M+15M-50M": [18, 24],
    "1M+50M-500M": [16, 24],
    "1M+500M-1B": [15, 24],
    "1M+1B-5B": [13, 24],
    "1M+5B-10B": [11, 24],
    "1M+10B+": [9, 24],
  };

  let test = range[check];
  // console.log(range[check]);
  // console.log("Test" + test[tabletype]);
  return test[tabletype];
}
