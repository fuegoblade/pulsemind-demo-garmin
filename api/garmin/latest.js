// /api/garmin/latest.js — mock now; ready for real Garmin mapping later
export default async function handler(req, res) {
  try {
    const sample = [
      {"date":"2025-08-25","hr_rest":52,"rmssd":58,"sleep_hours":7.2,"load":320},
      {"date":"2025-08-26","hr_rest":51,"rmssd":61,"sleep_hours":7.6,"load":290},
      {"date":"2025-08-27","hr_rest":53,"rmssd":55,"sleep_hours":6.9,"load":410},
      {"date":"2025-08-28","hr_rest":50,"rmssd":62,"sleep_hours":7.8,"load":180},
      {"date":"2025-08-29","hr_rest":52,"rmssd":57,"sleep_hours":7.1,"load":260},
      {"date":"2025-08-30","hr_rest":54,"rmssd":52,"sleep_hours":6.4,"load":520},
      {"date":"2025-08-31","hr_rest":51,"rmssd":60,"sleep_hours":7.5,"load":230}
    ];
    res.status(200).json(sample);
  } catch (e) {
    res.status(500).json({ error: 'internal_error', detail: String(e) });
  }
}
