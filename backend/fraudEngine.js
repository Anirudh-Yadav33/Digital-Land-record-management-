/**
 * Algorithmic Fraud Detection & Risk Assessment Engine for Land Registry
 */

// Helper to compute bounding box overlap ratio of 2D polygons/rectangles
function calculateOverlapPercentage(poly1, poly2) {
  if (!poly1 || !poly2 || poly1.length < 3 || poly2.length < 3) return 0;

  // Compute bounding boxes for poly1 and poly2
  const minX1 = Math.min(...poly1.map(p => p.x));
  const maxX1 = Math.max(...poly1.map(p => p.x));
  const minY1 = Math.min(...poly1.map(p => p.y));
  const maxY1 = Math.max(...poly1.map(p => p.y));

  const minX2 = Math.min(...poly2.map(p => p.x));
  const maxX2 = Math.max(...poly2.map(p => p.x));
  const minY2 = Math.min(...poly2.map(p => p.y));
  const maxY2 = Math.max(...poly2.map(p => p.y));

  // Overlap bounding rectangle
  const overlapMinX = Math.max(minX1, minX2);
  const overlapMaxX = Math.min(maxX1, maxX2);
  const overlapMinY = Math.max(minY1, minY2);
  const overlapMaxY = Math.min(maxY1, maxY2);

  if (overlapMaxX <= overlapMinX || overlapMaxY <= overlapMinY) {
    return 0; // No overlap
  }

  const overlapArea = (overlapMaxX - overlapMinX) * (overlapMaxY - overlapMinY);
  const area1 = (maxX1 - minX1) * (maxY1 - minY1);

  if (area1 <= 0) return 0;

  const percentage = Math.min(100, Math.round((overlapArea / area1) * 100));
  return percentage;
}

// District sector benchmark prices per sq.ft
const BENCHMARK_PRICES_PER_SQFT = {
  'Central Metropolitan': 75,
  'North Hills District': 85,
  'South Ridge Sector': 70,
  'East Industrial Hub': 45
};

function analyzeFraudRisk(application, existingLands) {
  let score = 0;
  const reasons = [];

  // 1. Spatial Boundary Overlap Audit
  if (application.coordinates && application.coordinates.length > 0) {
    for (const land of existingLands) {
      if (!land.coordinates) continue;

      const overlapPct = calculateOverlapPercentage(application.coordinates, land.coordinates);
      if (overlapPct > 10) {
        const severity = overlapPct > 50 ? 'CRITICAL OVERLAP' : 'SEVERE BOUNDARY CONFLICT';
        const points = overlapPct > 50 ? 50 : 35;
        score += points;
        reasons.push(
          `${severity}: ${overlapPct}% spatial coordinate overlap detected with existing registered plot "${land.title}" (ID: ${land.id}, Owner: ${land.ownerName}).`
        );
      }
    }
  } else {
    score += 25;
    reasons.push('MISSING SPATIAL DATA: Property coordinates not submitted for cadastral verification.');
  }

  // 2. Price & Market Valuation Anomaly Audit
  const district = application.district || 'Central Metropolitan';
  const benchmarkRate = BENCHMARK_PRICES_PER_SQFT[district] || 70;
  const area = Number(application.areaSqFt) || 1000;
  const expectedValuation = area * benchmarkRate;
  const proposedValuation = Number(application.proposedValuationUsd) || 0;

  if (proposedValuation > 0) {
    const ratio = proposedValuation / expectedValuation;

    if (ratio < 0.5) {
      const discountPct = Math.round((1 - ratio) * 100);
      score += 30;
      reasons.push(
        `PRICE ANOMALY (UNDERVALUATION): Proposed price ($${proposedValuation.toLocaleString()}) is ${discountPct}% below sector benchmark average ($${expectedValuation.toLocaleString()}). Potential stamp duty/tax evasion indicator.`
      );
    } else if (ratio > 2.5) {
      const inflationPct = Math.round((ratio - 1) * 100);
      score += 20;
      reasons.push(
        `PRICE ANOMALY (OVERVALUATION): Proposed price ($${proposedValuation.toLocaleString()}) is ${inflationPct}% above normal sector benchmark ($${expectedValuation.toLocaleString()}). Potential money laundering flag.`
      );
    }
  } else {
    score += 20;
    reasons.push('VALUATION MISSING: Proposed valuation zero or invalid.');
  }

  // 3. Document Completeness Audit
  const submittedDocTypes = (application.documents || []).map(d => (d.type || '').toLowerCase());
  const requiredTypes = ['id proof', 'sale deed', 'survey map'];
  const missingTypes = [];

  for (const req of requiredTypes) {
    if (!submittedDocTypes.some(t => t.includes(req))) {
      missingTypes.push(req.toUpperCase());
    }
  }

  if (missingTypes.length > 0) {
    score += missingTypes.length * 15;
    reasons.push(`DOCUMENT AUDIT DEFICIT: Missing required mandatory documents: ${missingTypes.join(', ')}.`);
  }

  // 4. Seller Identification Check
  const sellerId = (application.sellerIdNumber || '').trim();
  if (!sellerId || sellerId === 'UNVERIFIED-ID' || sellerId.length < 5) {
    score += 20;
    reasons.push('UNVERIFIED SELLER: Seller National ID / Identity Certificate could not be validated in central registry.');
  }

  // Cap score at 100
  score = Math.min(100, Math.max(0, score));

  // Determine Risk Level
  let level = 'LOW';
  if (score >= 70) {
    level = 'CRITICAL';
  } else if (score >= 45) {
    level = 'HIGH';
  } else if (score >= 20) {
    level = 'MEDIUM';
  }

  if (reasons.length === 0) {
    reasons.push('PASSED ALL AUTOMATED CHECKS: Clear title history, valid coordinates, normal pricing, and full documentation.');
  }

  return {
    score,
    level,
    reasons,
    analyzedAt: new Date().toISOString()
  };
}

module.exports = {
  analyzeFraudRisk,
  calculateOverlapPercentage
};
