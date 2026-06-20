/* ==========================================================================
   PRITHVIMITRA AI (पृथ्वीमित्र) - INTERACTIVE ENGINE (app.js)
   ========================================================================== */

// --- Global App State ---
const state = {
  // Lifestyle sliders (Twin simulation)
  lifestyle: {
    commuteKm: 80,
    meatMeals: 4,
    thermostatTemp: 22 // AC Temp in Celsius
  },
  
  // Future projection sliders
  projection: {
    scenario: 'moderate', // status-quo, moderate, aggressive, custom
    solarShare: 40,
    transitShare: 30,
    plantDietShare: 50
  },
  
  // Checkable daily actions states
  dailyActions: {
    metro: false,
    bottle: false,
    ac: false,
    walk: false
  },
  
  // App stats
  userStats: {
    xp: 3450,
    streak: 14,
    completedActions: [] // accepted recommendations
  },
  
  // Base constants for calculations (in kg CO2e)
  // Re-calibrated for India's high grid emission factor (0.78 kg/kWh)
  baselines: {
    transport: 22.4, // transport daily average footprint (kg)
    food: 8.4,
    utilities: 32.8, // Utilities base (AC, fridge, appliances)
    digital: 11.2,
    baseAnnual: 6200 // kg CO2e per year baseline for urban Indian
  },
  
  theme: 'dark'
};

// --- Recommendation Matrix Data (INR localized) ---
const recommendations = [
  {
    id: 'rec_thermostat',
    title: 'Set AC Temperature to 24\u00B0C',
    description: 'Setting your AC to 24\u00B0C (BEE recommended) reduces energy use by 6% per degree raised.',
    category: 'utilities',
    carbonSaved: 3.5, // kg per day (high grid carbon saved)
    moneySaved: 120.00, // INR per day
    waterSaved: 8.7, // liters saved dynamically (due to thermal cooling water save)
    effort: 'Low',
    difficulty: 'Low',
    roi: 9.8
  },
  {
    id: 'rec_cold_wash',
    title: 'Shift Laundry to Cold Water',
    description: 'Avoid warm water cycles. Ambient wash saves 90% washing electricity.',
    category: 'utilities',
    carbonSaved: 7.2, // kg per week
    moneySaved: 180.00,
    waterSaved: 0,
    effort: 'Low',
    difficulty: 'Low',
    roi: 8.4
  },
  {
    id: 'rec_plant_monday',
    title: 'Switch to Millet & Plant-Based Monday',
    description: 'Swap rice/wheat for climate-resilient regional millets (Ragi/Jowar) once a week.',
    category: 'food',
    carbonSaved: 14.5,
    moneySaved: 450.00,
    waterSaved: 1200, // millets consume 10x less water than rice
    effort: 'Medium',
    difficulty: 'Low',
    roi: 7.2
  },
  {
    id: 'rec_led_bulbs',
    title: 'Install BEE 5-Star BLDC Ceiling Fans',
    description: 'Replace induction ceiling fans. BLDC fans consume 28W vs 75W older models.',
    category: 'utilities',
    carbonSaved: 22.0, // kg per month
    moneySaved: 350.00,
    waterSaved: 55,
    effort: 'Low',
    difficulty: 'Medium',
    roi: 6.1
  },
  {
    id: 'rec_digital_compress',
    title: 'Delete Inactive WhatsApp & Cloud Backups',
    description: 'Clearing duplicate files and databases reduces data center cooling draw.',
    category: 'digital',
    carbonSaved: 4.2,
    moneySaved: 199.00,
    waterSaved: 0,
    effort: 'Medium',
    difficulty: 'Low',
    roi: 5.4
  },
  {
    id: 'rec_solar_panels',
    title: 'Install Surya Ghar Rooftop Solar',
    description: 'Adopt solar panels with up to 78,000 INR subsidy under PM Surya Ghar Yojana.',
    category: 'utilities',
    carbonSaved: 450.0, // monthly average
    moneySaved: 4500.00,
    waterSaved: 1125, // saves thermal cooling water
    effort: 'Medium',
    difficulty: 'High',
    roi: 2.5
  }
];

// --- Multi-Agent Simulated Log Messages (Indian Context) ---
const agentNames = {
  detective: 'Carbon Detective',
  analyst: 'Lifestyle Analyst',
  coach: 'PrithviMitra AI Coach',
  optimizer: 'Savings Optimizer',
  habit: 'Habit Builder',
  system: 'SYSTEM ORCHESTRATOR'
};

const initialLogs = [
  { time: '22:40:02', agent: 'system', text: 'Initializing PrithviMitra multi-agent pipeline...' },
  { time: '22:40:15', agent: 'detective', text: 'UPI API Linked: Tracking consumer emissions from digital spending logs.' },
  { time: '22:40:22', agent: 'analyst', text: 'Pattern recognized: Extreme peak demand spikes detected during afternoon AC loads.' },
  { time: '22:41:05', agent: 'optimizer', text: 'Grid audit: Coal-dominated generation creates 0.78kg/kWh emission factor.' },
  { time: '22:42:01', agent: 'coach', text: 'Bharat Persona configured: Urban Eco-Pragmatist. Customizing millets and BLDC fan suggestions.' }
];

const autonomousLogs = [
  { agent: 'detective', text: 'Smart meter alerts: High voltage fluctuation. Checking home inverter cycles...' },
  { agent: 'optimizer', text: 'Calculated: Swapping commute to Delhi Metro/local train saves 120 INR/trip.' },
  { agent: 'analyst', text: 'User checked off the "Set AC to 24\u00B0C" recommendation. Re-weighting utility graphs.' },
  { agent: 'habit', text: 'Setting reminder: Evening 8 PM grid demand conservation Nudge.' },
  { agent: 'coach', text: 'Surya Ghar Solar generation peak detected: Suggest running washing machine now to feed clean surplus.' }
];

// --- App Initialization ---
document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  initTheme();
  initTwinControls();
  initDailyCheckboxes();
  initRecommendations();
  initSimulator();
  initConsole();
  
  // Calculate initial state metrics
  updateAllCalculations();
});

// --- Tab Switching ---
function initTabs() {
  const tabs = document.querySelectorAll('.nav-btn');
  const panels = document.querySelectorAll('.tab-panel');
  
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));
      
      tab.classList.add('active');
      const targetPanel = document.getElementById(`panel-${tab.dataset.tab}`);
      if (targetPanel) {
        targetPanel.classList.add('active');
      }
    });
  });
}

// --- Theme Toggler ---
function initTheme() {
  const themeBtn = document.getElementById('theme-toggle');
  themeBtn.addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
    document.body.classList.toggle('dark-mode');
    state.theme = document.body.classList.contains('light-mode') ? 'light' : 'dark';
    
    const isLight = state.theme === 'light';
    themeBtn.innerHTML = isLight
      ? `<svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`
      : `<svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" class="sun-icon"><circle cx="12" cy="12" r="5"></circle><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"></path></svg>`;
  });
}

// --- Digital Twin Controls ---
function initTwinControls() {
  const sliders = [
    { id: 'slide-commute', stateKey: 'commuteKm', suffix: ' km' },
    { id: 'slide-meat', stateKey: 'meatMeals', suffix: ' meals' },
    { id: 'slide-thermostat', stateKey: 'thermostatTemp', suffix: ' \u00B0C' }
  ];
  
  sliders.forEach(s => {
    const input = document.getElementById(s.id);
    const output = document.getElementById(s.id.replace('slide', 'val'));
    
    if (input && output) {
      input.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        state.lifestyle[s.stateKey] = val;
        output.textContent = val + s.suffix;
        
        updateAllCalculations();
      });
    }
  });
}

// --- Today's Green Actions Checklist Binding ---
function initDailyCheckboxes() {
  const checkboxes = [
    { id: 'check-action-metro', key: 'metro', xp: 50 },
    { id: 'check-action-bottle', key: 'bottle', xp: 20 },
    { id: 'check-action-ac', key: 'ac', xp: 40 },
    { id: 'check-action-walk', key: 'walk', xp: 30 }
  ];
  
  checkboxes.forEach(c => {
    const checkbox = document.getElementById(c.id);
    if (checkbox) {
      checkbox.addEventListener('change', (e) => {
        state.dailyActions[c.key] = e.target.checked;
        
        if (e.target.checked) {
          state.userStats.xp += c.xp;
          pushConsoleLog('coach', `Daily Action check off: Added ${c.xp} XP to Mitra Profile.`);
        } else {
          state.userStats.xp = Math.max(0, state.userStats.xp - c.xp);
        }
        
        document.getElementById('points-counter').textContent = `${state.userStats.xp.toLocaleString()} XP`;
        updateAllCalculations();
      });
    }
  });
}

// --- Recommendation Lists ---
function initRecommendations() {
  renderRecommendations();
}

function renderRecommendations() {
  const container = document.getElementById('rec-list-container');
  if (!container) return;
  
  container.innerHTML = '';
  
  const sortedRecs = [...recommendations].sort((a, b) => b.roi - a.roi);
  
  sortedRecs.forEach(rec => {
    const isCompleted = state.userStats.completedActions.includes(rec.id);
    const item = document.createElement('div');
    item.className = `rec-item ${isCompleted ? 'completed' : ''}`;
    item.innerHTML = `
      <div class="rec-title-desc">
        <h4>${rec.title}</h4>
        <p>${rec.description}</p>
      </div>
      <div class="rec-metric">
        <span class="rec-lbl">Carbon Saved</span>
        <span class="rec-val text-green">${rec.carbonSaved} kg</span>
      </div>
      <div class="rec-metric">
        <span class="rec-lbl">Est. Savings</span>
        <span class="rec-val text-cyan">\u20B9${rec.moneySaved.toFixed(0)}</span>
      </div>
      <div class="rec-metric">
        <span class="rec-lbl">Effort</span>
        <span class="rec-val">${rec.effort}</span>
      </div>
      <div>
        <button class="btn-complete" data-id="${rec.id}" ${isCompleted ? 'disabled' : ''}>
          ${isCompleted ? 'Completed' : 'Accept Nudge'}
        </button>
      </div>
    `;
    
    const btn = item.querySelector('.btn-complete');
    if (btn && !isCompleted) {
      btn.addEventListener('click', () => {
        completeAction(rec.id);
      });
    }
    
    container.appendChild(item);
  });
}

function completeAction(actionId) {
  if (state.userStats.completedActions.includes(actionId)) return;
  
  state.userStats.completedActions.push(actionId);
  
  state.userStats.xp += 250;
  state.userStats.streak += 1;
  
  document.getElementById('points-counter').textContent = `${state.userStats.xp.toLocaleString()} XP`;
  document.getElementById('streak-counter').textContent = `${state.userStats.streak} Day Streak`;
  
  const matchedRec = recommendations.find(r => r.id === actionId);
  if (matchedRec) {
    pushConsoleLog('coach', `Success! Action Accepted: "${matchedRec.title}". Committing habits.`);
    pushConsoleLog('optimizer', `Audit: Cost footprint reduced by \u20B9${matchedRec.moneySaved.toFixed(0)}.`);
  }
  
  updateAllCalculations();
  renderRecommendations();
  
  if (actionId === 'rec_plant_monday') {
    const badge = document.getElementById('badge-plant-guru');
    if (badge) {
      badge.classList.remove('locked');
      badge.classList.add('active');
      const icon = badge.querySelector('.badge-icon');
      icon.innerHTML = `<svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none"><path d="M12 2a10 10 0 0 1 10 10v10H12A10 10 0 0 1 2 12V2h10z"></path></svg>`;
    }
  }
}

// --- Future simulator controls ---
function initSimulator() {
  const scenarios = ['status-quo', 'moderate', 'aggressive'];
  scenarios.forEach(scen => {
    const btn = document.getElementById(`btn-${scen}`);
    if (btn) {
      btn.addEventListener('click', () => {
        scenarios.forEach(s => document.getElementById(`btn-${s}`).classList.remove('active'));
        btn.classList.add('active');
        state.projection.scenario = scen;
        
        applyScenarioPreset(scen);
        updateAllCalculations();
      });
    }
  });
  
  const projSliders = [
    { id: 'slide-solar-adoption', stateKey: 'solarShare' },
    { id: 'slide-transit-share', stateKey: 'transitShare' },
    { id: 'slide-plant-diet', stateKey: 'plantDietShare' }
  ];
  
  projSliders.forEach(s => {
    const input = document.getElementById(s.id);
    const output = document.getElementById(s.id.replace('slide', 'val'));
    
    if (input && output) {
      input.addEventListener('input', (e) => {
        const val = parseInt(e.target.value);
        state.projection[s.stateKey] = val;
        output.textContent = val + '%';
        
        scenarios.forEach(s => document.getElementById(`btn-${s}`).classList.remove('active'));
        state.projection.scenario = 'custom';
        
        updateAllCalculations();
      });
    }
  });
}

function applyScenarioPreset(scenario) {
  const p = state.projection;
  if (scenario === 'status-quo') {
    p.solarShare = 5;
    p.transitShare = 10;
    p.plantDietShare = 10;
  } else if (scenario === 'moderate') {
    p.solarShare = 40;
    p.transitShare = 30;
    p.plantDietShare = 50;
  } else if (scenario === 'aggressive') {
    p.solarShare = 90;
    p.transitShare = 85;
    p.plantDietShare = 90;
  }
  
  document.getElementById('slide-solar-adoption').value = p.solarShare;
  document.getElementById('val-solar-adoption').textContent = p.solarShare + '%';
  
  document.getElementById('slide-transit-share').value = p.transitShare;
  document.getElementById('val-transit-share').textContent = p.transitShare + '%';
  
  document.getElementById('slide-plant-diet').value = p.plantDietShare;
  document.getElementById('val-plant-diet').textContent = p.plantDietShare + '%';
}

// --- Multi-Agent Console logic ---
function initConsole() {
  const logFeed = document.getElementById('agent-console-log');
  const queryInput = document.getElementById('console-query-input');
  const sendBtn = document.getElementById('console-send-btn');
  const clearBtn = document.getElementById('btn-clear-console');
  
  initialLogs.forEach(log => {
    addLogToDOM(log.time, log.agent, log.text);
  });
  
  if (logFeed) logFeed.scrollTop = logFeed.scrollHeight;
  
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (logFeed) logFeed.innerHTML = '';
      pushConsoleLog('system', 'Log cleared. Connection online.');
    });
  }
  
  if (sendBtn && queryInput) {
    const handleSend = () => {
      const val = queryInput.value.trim();
      if (!val) return;
      
      const now = new Date().toTimeString().split(' ')[0];
      addLogToDOM(now, 'user', val);
      queryInput.value = '';
      
      processAgentResponse(val.toLowerCase());
    };
    
    sendBtn.addEventListener('click', handleSend);
    queryInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleSend();
    });
  }
  
  setInterval(() => {
    const idx = Math.floor(Math.random() * autonomousLogs.length);
    const selected = autonomousLogs[idx];
    pushConsoleLog(selected.agent, selected.text);
  }, 22000);
}

function pushConsoleLog(agent, text) {
  const now = new Date().toTimeString().split(' ')[0];
  addLogToDOM(now, agent, text);
}

function addLogToDOM(time, agent, text) {
  const logFeed = document.getElementById('agent-console-log');
  if (!logFeed) return;
  
  const line = document.createElement('div');
  line.className = 'log-entry';
  
  const isUser = agent === 'user';
  const agentClass = isUser ? 'log-user' : `agent-${agent}`;
  const agentLabel = isUser ? 'You' : (agentNames[agent] || agent.toUpperCase());
  
  line.innerHTML = `
    <span class="log-time">[${time}]</span>
    <span class="log-agent ${agentClass}">${agentLabel}:</span>
    <span class="log-msg">${escapeHTML(text)}</span>
  `;
  
  logFeed.appendChild(line);
  logFeed.scrollTop = logFeed.scrollHeight;
}

function processAgentResponse(query) {
  setTimeout(() => {
    if (query.includes('commute') || query.includes('car') || query.includes('metro') || query.includes('train')) {
      pushConsoleLog('detective', 'Parsed query. Analyzing Indian urban transport grids...');
      setTimeout(() => {
        pushConsoleLog('analyst', 'Grid overlap: Petrol commuting in traffic multiplies idle emissions. Switching to Metro is high impact.');
        setTimeout(() => {
          pushConsoleLog('optimizer', 'Recommendation: Swap 3 commute days to local Metro/Train. Saves \u20B9250/trip and avoids 4.5kg carbon.');
          setTimeout(() => {
            pushConsoleLog('coach', 'Delhi NCR Metro Commuter League challenge updated in your Community tab.');
          }, 800);
        }, 800);
      }, 800);
    } else if (query.includes('save') || query.includes('money') || query.includes('cost') || query.includes('bill')) {
      pushConsoleLog('optimizer', 'Scanning for low cost, positive return options in India...');
      setTimeout(() => {
        pushConsoleLog('detective', 'AC cooling alert: Running AC at 18\u00B0C triggers 35% higher load. Grid carbon is coal-heavy.');
        setTimeout(() => {
          pushConsoleLog('coach', 'Accept nudge to set AC to 24\u00B0C. Saves \u20B9120/day on domestic electricity bills.');
          setTimeout(() => {
            pushConsoleLog('habit', 'Setup cue: Automatic bedtime thermostat trigger scheduled.');
          }, 800);
        }, 800);
      }, 800);
    } else if (query.includes('solar') || query.includes('sun')) {
      pushConsoleLog('detective', 'Query parsed: Solar options. Fetching government policies...');
      setTimeout(() => {
        pushConsoleLog('optimizer', 'PM Surya Ghar Scheme: Subsidies apply up to 3kW capacity, saving up to \u20B978,000 in installation.');
        setTimeout(() => {
          pushConsoleLog('coach', 'Check the Rooftop Solar installation action in your recommendation matrix.');
        }, 800);
      }, 800);
    } else {
      pushConsoleLog('detective', 'Blackboard session initialized. Fetching Indian geographical footprint averages...');
      setTimeout(() => {
        pushConsoleLog('coach', 'How can the agents help? Ask about solar subsidies, metro routes, AC savings, or millet diets.');
      }, 1000);
    }
  }, 1000);
}

function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
}

// --- Dynamic Mathematical Calculations Engine ---
function updateAllCalculations() {
  const l = state.lifestyle;
  
  // 1. Calculate Core Dashboard Metrics
  // Metric Transport Score: 0.28 kg per km baseline for typical vehicle in India
  let transportScore = l.commuteKm * 0.28;
  // Food Score: meat meals
  let foodScore = l.meatMeals * 2.1;
  
  // Utilities: AC temperature delta below 24\u00B0C
  // Coal grid intensity makes utility cooling penalties higher (2.2kg per degree)
  let utilitiesScore = state.baselines.utilities;
  if (l.thermostatTemp < 24) {
    utilitiesScore += Math.abs(l.thermostatTemp - 24) * 2.2;
  }
  
  let digitalScore = state.baselines.digital;
  
  // Deduct completed recommendations (Accepted Nudges)
  state.userStats.completedActions.forEach(actionId => {
    const rec = recommendations.find(r => r.id === actionId);
    if (rec) {
      if (rec.category === 'utilities') {
        if (actionId === 'rec_solar_panels') {
          utilitiesScore = Math.max(0, utilitiesScore - 20.0);
        } else {
          utilitiesScore = Math.max(0, utilitiesScore - (rec.carbonSaved * 7 / 30));
        }
      }
      if (rec.category === 'food') foodScore = Math.max(0, foodScore - rec.carbonSaved);
      if (rec.category === 'digital') digitalScore = Math.max(0, digitalScore - rec.carbonSaved);
    }
  });
  
  // Deduct checkable daily actions (Checkboxes)
  let dailyCarbonSaved = 0;
  let dailyMoneySaved = 0;
  let dailyWaterSaved = 0;
  
  if (state.dailyActions.metro) { dailyCarbonSaved += 2.4; dailyMoneySaved += 120; }
  if (state.dailyActions.bottle) { dailyCarbonSaved += 0.3; dailyWaterSaved += 10; }
  if (state.dailyActions.ac) { dailyCarbonSaved += 1.1; dailyMoneySaved += 90; }
  if (state.dailyActions.walk) { dailyCarbonSaved += 0.8; dailyMoneySaved += 30; }
  
  // Subtract daily checks from scores
  transportScore = Math.max(0, transportScore - (state.dailyActions.metro ? 2.4 : 0) - (state.dailyActions.walk ? 0.8 : 0));
  utilitiesScore = Math.max(0, utilitiesScore - (state.dailyActions.ac ? 1.1 : 0));
  
  // Total Monthly Footprint Score (represented as daily * 30 or static monthly average)
  const totalFootprint = transportScore + foodScore + utilitiesScore + digitalScore;
  
  // Update dashboard values in DOM
  document.getElementById('kpi-val-transport').textContent = `${transportScore.toFixed(1)} kg`;
  document.getElementById('kpi-val-food').textContent = `${foodScore.toFixed(1)} kg`;
  document.getElementById('kpi-val-utilities').textContent = `${utilitiesScore.toFixed(1)} kg`;
  document.getElementById('kpi-val-digital').textContent = `${digitalScore.toFixed(1)} kg`;
  
  const sidebarScoreElement = document.getElementById('sidebar-carbon-score');
  if (sidebarScoreElement) {
    sidebarScoreElement.textContent = `${totalFootprint.toFixed(1)} kg`;
  }
  
  // Eco-Score & Sustainability Rank Comparison (City/State/India averages)
  const ecoScore = Math.min(100, Math.max(10, Math.round(100 - (totalFootprint / 2.2))));
  const sidebarPercentileElement = document.getElementById('sidebar-percentile');
  if (sidebarPercentileElement) {
    sidebarPercentileElement.textContent = `${Math.min(99, Math.round(ecoScore * 1.04))}%`;
  }
  
  // Render Sustainability rank against averages (Indian context)
  const rankComp = document.getElementById('sustainability-rank-compare');
  if (rankComp) {
    if (ecoScore > 85) {
      rankComp.textContent = 'Top 8%';
      rankComp.className = 'box-val text-green';
    } else if (ecoScore > 70) {
      rankComp.textContent = 'Top 18%';
      rankComp.className = 'box-val text-green';
    } else {
      rankComp.textContent = 'Average (42%)';
      rankComp.className = 'box-val text-yellow';
    }
  }
  
  // Financial cost in Indian Rupees (INR)
  const baseCost = 6500.00; // Base housing, rent, basic bills
  let variableCost = (l.commuteKm * 8.50) + (l.meatMeals * 250.00);
  if (l.thermostatTemp < 24) {
    variableCost += Math.abs(l.thermostatTemp - 24) * 220.00;
  }
  let totalCost = baseCost + variableCost - dailyMoneySaved;
  
  state.userStats.completedActions.forEach(actionId => {
    const rec = recommendations.find(r => r.id === actionId);
    if (rec) {
      if (actionId === 'rec_solar_panels') {
        totalCost = Math.max(0, totalCost - 3500.00); // Solar Rooftop saves huge slab costs
      } else {
        totalCost = Math.max(0, totalCost - rec.moneySaved);
      }
    }
  });
  
  document.getElementById('total-financial-cost').innerHTML = `&#8377;${Math.round(totalCost).toLocaleString('en-IN')}`;
  
  // 2. Adjust digital twin aura state & labels dynamically
  updateTwinAuraState(totalFootprint);
  
  // 3. Update Climate Missions Progress Level
  updateClimateMissions(totalFootprint, dailyCarbonSaved);
  
  // 4. Re-calculate Future simulator outputs
  updateSimulatorProjections(dailyWaterSaved);
}

function updateTwinAuraState(totalFootprint) {
  const aura = document.getElementById('twin-aura');
  const label = document.getElementById('sidebar-twin-label');
  const statusTitle = document.getElementById('twin-status-title');
  const statusDesc = document.getElementById('twin-status-desc');
  
  if (!aura || !label) return;
  
  if (totalFootprint < 75) {
    aura.setAttribute('fill', 'url(#grad-good)');
    label.className = 'status-badge state-good';
    label.textContent = 'Green Yogi';
    if (statusTitle) statusTitle.textContent = 'Aura: Emerald Shanti';
    if (statusDesc) statusDesc.textContent = 'High usage of metro transit and optimal AC settings keep your twin clean.';
  } else if (totalFootprint < 115) {
    aura.setAttribute('fill', 'url(#grad-avg)');
    label.className = 'status-badge state-avg';
    label.textContent = 'Moderate';
    if (statusTitle) statusTitle.textContent = 'Aura: Amber Spark';
    if (statusDesc) statusDesc.textContent = 'AC temperatures below 24\u00B0C and high weekly commutes are creating warning halos.';
  } else {
    aura.setAttribute('fill', 'url(#grad-bad)');
    label.className = 'status-badge state-bad';
    label.textContent = 'Warning';
    if (statusTitle) statusTitle.textContent = 'Aura: Crimson Haze';
    if (statusDesc) statusDesc.textContent = 'Heavy petrol vehicle commute and low AC cooling values trigger high grid emissions.';
  }
}

function updateClimateMissions(totalFootprint, dailyCarbonSaved) {
  // Monthly reduction calculation: baseline - current user footprint
  const baseMonthlyFootprint = 180.0; // standard un-optimized Indian footprint (kg CO2e)
  const recommendationsSavings = state.userStats.completedActions.reduce((acc, actionId) => {
    const rec = recommendations.find(r => r.id === actionId);
    return acc + (rec ? rec.carbonSaved : 0);
  }, 0);
  
  // Calculate total monthly reduction
  const monthlyReduction = recommendationsSavings + (dailyCarbonSaved * 30);
  
  const missionLabel = document.getElementById('mission-total-saved');
  if (missionLabel) {
    missionLabel.textContent = `Monthly Reduction: ${monthlyReduction.toFixed(1)} kg CO₂`;
  }
  
  // Determine Citizen Level Rank
  const rankText = document.getElementById('citizen-rank-text');
  
  // Reset active classes on level boxes
  const levels = [
    { id: 'level-bronze', limit: 5, label: 'Bronze Citizen', class: 'bronze' },
    { id: 'level-silver', limit: 20, label: 'Silver Citizen', class: 'silver' },
    { id: 'level-gold', limit: 50, label: 'Gold Citizen', class: 'gold' },
    { id: 'level-champion', limit: 100, label: 'Climate Champion', class: 'champion' }
  ];
  
  let currentRank = levels[0];
  
  levels.forEach(lvl => {
    const box = document.getElementById(lvl.id);
    if (box) {
      box.classList.remove('active');
      const statusText = box.querySelector('.level-status');
      
      if (monthlyReduction >= lvl.limit) {
        box.classList.add('active');
        if (statusText) statusText.textContent = 'Achieved!';
        currentRank = lvl;
      } else {
        if (statusText) statusText.textContent = 'Locked';
      }
    }
  });
  
  if (rankText) {
    rankText.textContent = currentRank.label;
    rankText.className = `rank-badge ${currentRank.class}`;
  }
}

function updateSimulatorProjections(dailyWaterSaved) {
  const p = state.projection;
  const baseAnnual = state.baselines.baseAnnual;
  
  let scale1y = 0.95;
  let scale5y = 0.85;
  let scale10y = 0.70;
  
  let label = 'Moderate Action';
  let badgeClass = 'status-badge state-avg';
  
  if (p.scenario === 'status-quo') {
    scale1y = 0.98;
    scale5y = 0.95;
    scale10y = 0.92;
    label = 'Status Quo';
    badgeClass = 'status-badge state-bad';
  } else if (p.scenario === 'aggressive') {
    scale1y = 0.55;
    scale5y = 0.28;
    scale10y = 0.08;
    label = 'Aggressive Action';
    badgeClass = 'status-badge state-good';
  } else if (p.scenario === 'moderate') {
    scale1y = 0.78;
    scale5y = 0.52;
    scale10y = 0.30;
    label = 'Moderate Target';
    badgeClass = 'status-badge state-avg';
  } else if (p.scenario === 'custom') {
    const reductionFactor = (p.solarShare * 0.25 + p.transitShare * 0.35 + p.plantDietShare * 0.20) / 100;
    
    scale1y = Math.max(0.05, 1 - (reductionFactor * 0.45));
    scale5y = Math.max(0.05, 1 - (reductionFactor * 0.78));
    scale10y = Math.max(0.02, 1 - (reductionFactor * 0.96));
    label = 'Custom Optimization';
    badgeClass = 'status-badge state-good';
  }
  
  const indicator = document.getElementById('forecast-scenario-indicator');
  if (indicator) {
    indicator.textContent = label;
    indicator.className = badgeClass;
  }
  
  const carbonBaselineTotal10Years = baseAnnual * 10;
  
  let projectedTotal10Years = 0;
  for (let i = 1; i <= 10; i++) {
    const fraction = 1 - ((1 - scale10y) * (i / 10));
    projectedTotal10Years += baseAnnual * fraction;
  }
  
  const totalCarbonAvoided = Math.max(0, Math.round(carbonBaselineTotal10Years - projectedTotal10Years));
  const treeEquivalents = Math.round(totalCarbonAvoided / 22);
  const cashSaved = Math.round(totalCarbonAvoided * 15); // ₹15 saved per kg carbon avoided approx.
  
  // Calculate cumulative Water Saved (in Liters)
  // Base average water saving multiplier: millets & solar panels offsets
  // Millets diet saves 1200L/meal, copper bottle saves 10L/check, Solar saves 2.5L/kWh
  const annualWaterBase = (p.plantDietShare * 1200 * 52) + (p.solarShare * 2.5 * 300) + (dailyWaterSaved * 30 * 12);
  const cumulativeWaterSaved = Math.round(annualWaterBase * 10); // 10 years cumulative
  
  document.getElementById('sim-val-carbon').textContent = `${totalCarbonAvoided.toLocaleString()} kg`;
  document.getElementById('sim-val-trees').textContent = `${treeEquivalents.toLocaleString()} Trees`;
  document.getElementById('sim-val-water').textContent = `${cumulativeWaterSaved.toLocaleString()} L`;
  document.getElementById('sim-val-money').innerHTML = `&#8377;${cashSaved.toLocaleString('en-IN')}`;
  
  document.getElementById('bar-1y-proj').style.height = `${Math.round(scale1y * 95)}%`;
  document.getElementById('bar-5y-proj').style.height = `${Math.round(scale5y * 95)}%`;
  document.getElementById('bar-10y-proj').style.height = `${Math.round(scale10y * 95)}%`;
}
