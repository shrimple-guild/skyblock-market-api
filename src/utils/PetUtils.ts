const petLevels: Record<string, number | undefined> = {
    "GOLDEN_DRAGON": 200,
    "JADE_DRAGON": 200
}

function maxPetLevel(id: string) {
    return petLevels[id] ?? 100
} 

export const PetUtils = {
    maxPetLevel
}