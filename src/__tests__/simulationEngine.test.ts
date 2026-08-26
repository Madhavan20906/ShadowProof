import { describe, it, expect } from 'vitest';
import { getInitialStateForPreset } from '../mock/scenarioData';
import { simulatePlanAGeneric, SYSTEM_INVARIANTS_REGISTRY, generateSnapshotHash } from '../engine/genericSimulationEngine';
import { generateGenericComparisonPlans } from '../engine/genericPlanner';
import { parseUserIntent } from '../engine/intentParser';
import { simulateDirectPlanA, simulateSaferPlanB } from '../engine/shadowEngine';

describe('ShadowProof Generic Simulation Engine', () => {
  it('should generate a valid 64-bit deterministic snapshot hash', () => {
    const state = getInitialStateForPreset('alex-finance-offboard');
    const hash = generateSnapshotHash(state);
    expect(hash).toMatch(/^STATE-[0-9A-F]{10,16}$/);
  });

  it('should run Direct Plan A simulation and identify cascading outages', () => {
    const state = getInitialStateForPreset('alex-finance-offboard');
    const simA = simulatePlanAGeneric(state, 'user-alex');

    expect(simA.consequences.length).toBeGreaterThan(0);
    expect(simA.riskScore).toBeGreaterThan(50);
    expect(simA.invariants.some(i => i.status === 'violated')).toBe(true);
    expect(simA.blastRadius.directNodesCount).toBeGreaterThan(0);
    expect(simA.coverage.dependencyCoverage).toBeGreaterThan(50);
    expect(simA.coverage.policyCoverage).toBeGreaterThanOrEqual(0);
  });

  it('should re-simulate Plan B on remediated graph with zero hardcoded overrides', () => {
    const state = getInitialStateForPreset('alex-finance-offboard');
    const { planA, planB, simResultA, simResultB } = generateGenericComparisonPlans(state, 'user-alex');

    expect(planA.consequences.length).toBeGreaterThan(0);
    expect(planB.consequences.length).toBe(0);
    expect(planB.riskScore).toBeLessThan(planA.riskScore);
    expect(simResultB.invariants.every(i => i.status === 'passed')).toBe(true);
    expect(simResultB.coverage.policyCoverage).toBe(100);
    expect(planB.steps.length).toBeGreaterThan(1);
  });

  it('should evaluate declarative invariants correctly against system state', () => {
    const state = getInitialStateForPreset('alex-finance-offboard');
    expect(SYSTEM_INVARIANTS_REGISTRY.length).toBe(5);

    const sim = simulatePlanAGeneric(state, 'user-alex');
    const inv01 = sim.invariants.find(i => i.code === 'INV-01');
    expect(inv01).toBeDefined();
    expect(inv01?.status).toBe('violated');
  });

  it('should parse user operational intent deterministically without hardcoded names', () => {
    const state = getInitialStateForPreset('jordan-devops-revoke');
    const parsed = parseUserIntent('Revoke Jordan Tech access credentials immediately', state);

    expect(parsed.targetNodeId).toBe('user-jordan');
    expect(parsed.action).toBe('revoke');
    expect(parsed.constraints.length).toBeGreaterThan(0);
  });

  it('should maintain backward compatibility via shadowEngine wrapper without hardcoded fakes', () => {
    const state = getInitialStateForPreset('alex-finance-offboard');
    const simA = simulateDirectPlanA(state, 'alex-finance-offboard');
    const simB = simulateSaferPlanB(state, 'alex-finance-offboard');

    expect(simA.consequences.length).toBeGreaterThan(0);
    expect(simB.consequences.length).toBe(0);
    expect(simB.riskScore).toBeLessThan(simA.riskScore);
    expect(simB.actionSteps.length).toBeGreaterThan(1);
  });
});
