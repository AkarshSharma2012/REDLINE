export const reviewedGravity = r => r.evidence_id === 'U25-01-L' ? '1/6 g NASA nominal simulated acceleration (0.16 g project normalization)' : null;

export const reviewedForm = r => r.evidence_id === 'U25-01-L' ? 'sheet (inferred, not source-stated)' : null;
export const reviewedEndpoint = r => r.evidence_id === 'U25-01-L' ? '13.5 mol% O2 (plot-derived five-second extinction; 0.8 mm PMMA at 56.5 kPa absolute)' : null;
