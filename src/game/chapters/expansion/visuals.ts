export type ExpansionResource = 'energy' | 'oxygen' | 'suitIntegrity' | 'radiationDose';
export type ExpansionResourceState = 'normal' | 'warning' | 'danger';

export function getExpansionResourceState(
    resource: ExpansionResource,
    value: number
): ExpansionResourceState {
    if (resource === 'oxygen' && value < 25) {
        return 'danger';
    }
    if (resource === 'suitIntegrity' && value < 60) {
        return 'warning';
    }
    if (resource === 'radiationDose' && value >= 45) {
        return 'danger';
    }
    return 'normal';
}
