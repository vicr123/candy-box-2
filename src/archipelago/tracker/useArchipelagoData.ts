import {useCallback, useEffect, useMemo, useState} from "react";
import {Archipelago, ArchipelagoEntrance} from "../Archipelago";
import {Item} from "archipelago.js";

export function useArchipelagoData() {
    const [syncWithArchipelago, setSyncWithArchipelago] = useState(true);
    const [allArchipelagoLocations, setAllArchipelagoLocations] = useState<number[]>([]);
    const [archipelagoCheckedLocations, setArchipelagoCheckedLocations] = useState<number[]>([]);
    const [archipelagoMissingLocations, setArchipelagoMissingLocations] = useState<number[]>([]);
    const [archipelagoClaimedItems, setArchipelagoClaimedItems] = useState<Item[]>([])
    const [archipelagoEntranceRandomisation, setArchipelagoEntranceRandomisation] = useState<[ArchipelagoEntrance, ArchipelagoEntrance][]>([])
    const [archipelagoProgressiveWeaponsOn, setArchipelagoProgressiveWeaponsOn] = useState(false);
    const [archipelagoStartingWeapon, setArchipelagoStartingWeapon] = useState<number>(0)

    const updateArchipelagoData = useCallback(() => {
        setAllArchipelagoLocations(Archipelago.client.room.allLocations)
        setArchipelagoCheckedLocations(Archipelago.client.room.checkedLocations)
        setArchipelagoMissingLocations(Archipelago.client.room.missingLocations)
        setArchipelagoClaimedItems(Archipelago.client.items.received)
        setArchipelagoEntranceRandomisation(Archipelago.slotData?.entranceInformation ?? [])
        setArchipelagoProgressiveWeaponsOn(Archipelago.slotData?.defaults?.weapon === -1)
        setArchipelagoStartingWeapon(Archipelago.slotData?.defaults?.weapon)
    }, []);

    useEffect(() => {
        Archipelago.events.on("connectionStatusChanged", updateArchipelagoData);
        Archipelago.client.room.on("locationsChecked", updateArchipelagoData)
        Archipelago.client.socket.on("receivedItems", updateArchipelagoData)
        Archipelago.client.items.on("itemsReceived", updateArchipelagoData)

        return () => {
            Archipelago.events.off("connectionStatusChanged", updateArchipelagoData);
            Archipelago.client.room.off("locationsChecked", updateArchipelagoData)
            Archipelago.client.socket.off("receivedItems", updateArchipelagoData)
            Archipelago.client.items.off("itemsReceived", updateArchipelagoData)
        }
    }, []);

    useEffect(() => {
        updateArchipelagoData()
    }, [])

    const allLocations = useMemo(() => {
        return syncWithArchipelago ? allArchipelagoLocations : [];
    }, [syncWithArchipelago, allArchipelagoLocations]);

    const missingLocations = useMemo(() => {
        return syncWithArchipelago ? archipelagoMissingLocations : [];
    }, [syncWithArchipelago, archipelagoMissingLocations])

    const checkedLocations = useMemo(() => {
        return allLocations.filter(location => !missingLocations.includes(location));
    }, [allLocations, missingLocations])

    const claimedItems = useMemo(() => {
        return syncWithArchipelago ? archipelagoClaimedItems : [];
    }, [syncWithArchipelago, archipelagoClaimedItems]);

    const entranceRandomisationData = useMemo(() => {
        return syncWithArchipelago ? archipelagoEntranceRandomisation ?? [] : [];
    }, [syncWithArchipelago, archipelagoEntranceRandomisation]);

    const progressiveWeaponsOn = useMemo(() => {
        return syncWithArchipelago ? archipelagoProgressiveWeaponsOn : false;
    }, [syncWithArchipelago, archipelagoProgressiveWeaponsOn]);

    const startingWeapon = useMemo(() => {
        return syncWithArchipelago ? archipelagoStartingWeapon : false;
    }, [syncWithArchipelago, archipelagoStartingWeapon]);

    const locationName = useCallback((location: number) => {
        return Archipelago.client.package.findPackage("Candy Box 2").reverseLocationTable[location];
    }, []);

    const claimedItemCount = useCallback((itemId: number | string) => {
        if (typeof itemId == "number") {
            return archipelagoClaimedItems.filter(item => item.id === itemId).length;
        } else {
            return archipelagoClaimedItems.filter(item => item.name === itemId).length;
        }
    }, [archipelagoClaimedItems])

    return {
        allLocations,
        checkedLocations,
        missingLocations,

        locationName,
        claimedItems,
        claimedItemCount,
        entranceRandomisationData,
        progressiveWeaponsOn,
        startingWeapon
    }
}

export type ArchipelagoData = ReturnType<typeof useArchipelagoData>;