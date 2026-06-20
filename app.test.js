import { describe, it, expect, beforeEach } from 'vitest';
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

const htmlCode = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf8');
const jsCode = fs.readFileSync(path.resolve(__dirname, 'app.js'), 'utf8');

describe('PrithviMitra AI Core Calculations & State Tests', () => {
  let dom;
  let window;
  let document;

  beforeEach(() => {
    // Set up JSDOM environment
    dom = new JSDOM(htmlCode, { runScripts: 'dangerously' });
    window = dom.window;
    document = window.document;

    // Run the JS code in JSDOM context
    const scriptEl = document.createElement('script');
    scriptEl.textContent = jsCode;
    document.body.appendChild(scriptEl);
  });

  it('should initialize with correct default stats and state values', () => {
    const transportVal = document.getElementById('kpi-val-transport').textContent;
    const foodVal = document.getElementById('kpi-val-food').textContent;
    const utilitiesVal = document.getElementById('kpi-val-utilities').textContent;
    const digitalVal = document.getElementById('kpi-val-digital').textContent;

    // commuteKm = 80 => transport = 80 * 0.28 = 22.4 kg
    expect(transportVal).toBe('22.4 kg');
    // meatMeals = 4 => food = 4 * 2.1 = 8.4 kg
    expect(foodVal).toBe('8.4 kg');
    // AC Temp = 22 => utilities = base (32.8) + (24-22) * 2.2 = 32.8 + 4.4 = 37.2 kg
    expect(utilitiesVal).toBe('37.2 kg');
    expect(digitalVal).toBe('11.2 kg');
  });

  it('should calculate AC compressor energy savings delta correctly when temperature changes', () => {
    const thermostatInput = document.getElementById('slide-thermostat');
    
    // Simulate user dragging thermostat to 25°C
    thermostatInput.value = '25';
    // Trigger input event
    const event = new window.Event('input');
    thermostatInput.dispatchEvent(event);

    const utilitiesVal = document.getElementById('kpi-val-utilities').textContent;
    // Since 25 >= 24, utility penalty is 0, so it should equal baseline 32.8
    expect(utilitiesVal).toBe('32.8 kg');

    // Simulate user dragging thermostat to 20°C
    thermostatInput.value = '20';
    thermostatInput.dispatchEvent(event);
    const utilitiesVal2 = document.getElementById('kpi-val-utilities').textContent;
    // Since 20 < 24, utility penalty is (24 - 20) * 2.2 = 8.8, total = 32.8 + 8.8 = 41.6
    expect(utilitiesVal2).toBe('41.6 kg');
  });

  it('should recalculate transport score when commute slider changes', () => {
    const commuteInput = document.getElementById('slide-commute');
    commuteInput.value = '150';
    const event = new window.Event('input');
    commuteInput.dispatchEvent(event);

    const transportVal = document.getElementById('kpi-val-transport').textContent;
    // 150 km * 0.28 = 42.0 kg
    expect(transportVal).toBe('42.0 kg');
  });

  it('should update points XP, logs, and total footprint when checking a daily action', () => {
    const initialXPText = document.getElementById('points-counter').textContent;
    expect(initialXPText).toBe('3,450 XP');

    // Select metro checkbox
    const metroCheck = document.getElementById('check-action-metro');
    metroCheck.checked = true;
    const changeEvent = new window.Event('change');
    metroCheck.dispatchEvent(changeEvent);

    const updatedXPText = document.getElementById('points-counter').textContent;
    // Metro check adds 50 XP
    expect(updatedXPText).toBe('3,500 XP');

    const transportVal = document.getElementById('kpi-val-transport').textContent;
    // 22.4 - 2.4 (metro check deduction) = 20.0 kg
    expect(transportVal).toBe('20.0 kg');
  });

  it('should update Bhavishya projection outputs correctly on scenario toggles', () => {
    const btnAggressive = document.getElementById('btn-aggressive');
    
    // Simulate clicking aggressive scenario
    const clickEvent = new window.Event('click');
    btnAggressive.dispatchEvent(clickEvent);

    const scenarioText = document.getElementById('forecast-scenario-indicator').textContent;
    expect(scenarioText).toBe('Aggressive Action');

    const carbonSaved = document.getElementById('sim-val-carbon').textContent;
    expect(carbonSaved).toContain('kg');
  });
});
