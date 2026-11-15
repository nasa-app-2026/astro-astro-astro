export type ExpansionPhase = 'intro' | 'collect' | 'build' | 'complete' | 'failed';

export function isExpansionGameplayActive(phase: ExpansionPhase): boolean {
    return phase === 'collect' || phase === 'build';
}
