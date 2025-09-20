// /api/garmin/latest.js — mock data + computed readiness & risk
export default async function handler(req, res) {
  try {
    // 1) Demo data (zde později nahradíme mapováním z Garminu)
    const data = [
      {"date":"2025-08-25","hr_rest":52,"rmssd":58,"sleep_hours":7.2,"load":320},
      {"date":"2025-08-26","hr_rest":51,"rmssd":61,"sleep_hours":7.6,"load":290},
      {"date":"2025-08-27","hr_rest":53,"rmssd":55,"sleep_hours":6.9,"load":410},
      {"date":"2025-08-28","hr_rest":50,"rmssd":62,"sleep_hours":7.8,"load":180},
      {"date":"2025-08-29","hr_rest":52,"rmssd":57,"sleep_hours":7.1,"load":260},
      {"date":"2025-08-30","hr_rest":54,"rmssd":52,"sleep_hours":6.4,"load":520},
      {"date":"2025-08-31","hr_rest":51,"rmssd":60,"sleep_hours":7.5,"load":230}
    ];

    // 2) Volitelné “scénáře” přes query parametry (na demo: /api/garmin/latest?flu=1&sleepDebt=1)
    const flags = {
      flu: req.query.flu === '1' || req.query.flu === 'true',
      sleepDebt: req.query.sleepDebt === '1' || req.query.sleepDebt === 'true'
    };

    const result = evaluate(data, flags);

    // 3) Výstup pro UI: summary + detaily + původní data
    res.status(200).json({
      ok: true,
      summary: { readiness: result.readiness, risk: result.risk },
      details: result.details,
      data
    });
  } catch (e) {
    res.status(500).json({ ok: false, error: 'internal_error', detail: String(e) });
  }
}

/** ----- Mini-algoritmus: readiness & risk ----- **/
function evaluate(data, flags = {}) {
  const n = data.length;
  const avg = arr => arr.reduce((a,b)=>a+b,0) / (arr.length || 1);

  const hrvs   = data.map(d => +d.rmssd);
  const sleeps = data.map(d => +d.sleep_hours);
  const loads  = data.map(d => +d.load);

  const hrvAvg    = avg(hrvs);
  const sleepAvg  = avg(sleeps);
  const loadAvg   = avg(loads);
  const loadSum   = loads.reduce((a,b)=>a+b,0);

  // normalizace (hrv: 30–100 ms, sleep: 5–9 h, load/den: 150–600)
  const norm = (x,min,max) => Math.max(0, Math.min(1, (x - min) / (max - min)));

  let readiness =
    100 * (
      0.45 * norm(hrvAvg,   30, 100) +
      0.35 * norm(sleepAvg, 5,  9 ) +
      0.20 * (1 - norm(loadSum / n, 150, 600))
    );

  // “scénáře” (jen pro demo ovládání přes query)
  if (flags.flu)       readiness -= 20;   // nachlazení/chřipka
  if (flags.sleepDebt) readiness -= 10;   // spánkový deficit

  readiness = Math.round(Math.max(0, Math.min(100, readiness)));

  // Overload risk: poměr akutní:chronické zátěže + HRV drift
  const k = Math.min(7, n);
  const acute   = avg(loads.slice(-k));
  const chronic = avg(loads);
  const ratio   = chronic > 0 ? acute / chronic : 0;
  const hrvDrift = (hrvs[hrvs.length-1] ?? hrvAvg) - hrvAvg;

  let risk = 'Low';
  if (ratio > 1.3 || hrvDrift < -5)  risk = 'Moderate';
  if (ratio > 1.6 || hrvDrift < -10) risk = 'High';

  return {
    readiness,
    risk,
    details: { hrvAvg, sleepAvg, loadAvg, ratio: round2(ratio), hrvDrift: round2(hrvDrift) }
  };
}

function round2(x){ return Math.round(x * 100) / 100; }
