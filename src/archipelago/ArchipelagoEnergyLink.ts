import {Archipelago} from "./Archipelago";

export function energyLinkStorageName() {
    return `EnergyLink${Archipelago.client.players.self.team}`
}

export async function depositEnergy(depositAmount: number) {
    await Archipelago.client.storage.prepare(energyLinkStorageName(), 0)
        .add(Math.ceil(depositAmount * 1000))
        .commit(true);
}

export async function withdrawEnergy(withdrawalAmount: number) {
    const initialEnergy = Archipelago.client.storage.store[energyLinkStorageName()] as number;
    const energyRemaining = await Archipelago.client.storage.prepare<number>(energyLinkStorageName(), 0)
        .add(-Math.ceil(withdrawalAmount * 1000))
        .max(0)
        .commit(true);

    const delta = (initialEnergy - energyRemaining) / 1000;
    return delta;
}

export function savedEnergy() {
    return Archipelago.client.storage.store[energyLinkStorageName()] as number / 1000;
}