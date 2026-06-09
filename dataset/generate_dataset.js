// Legacy entrypoint kept for compatibility.
// The v1 synthetic dataset was retired from the active training flow because it
// contained low-quality commercial claims/placeholders. Use the curated v2
// generator instead.
require('./generate_dataset_v2.js');
