export const playerInfos = {
    inventorySpace: 100,
    health: 100,
    movementPerTurn: 5,
    resources: {
        stone: 0,
        iron: 0,
        copper: 0,
        zinc: 0,
        tin: 0,
        gold: 0,
        silver: 0,
    },
    tools: {
        pickaxe: {
            stone: 0,
            bronze: 0,
            iron: 0,
            
        },
        axe: {
            stone: 0,
            bronze: 0,
            iron: 0,
            
        },
        shovel: {
            stone: 0,
            bronze: 0,
            iron: 0,
            
        },
    },
    craftingMaterials: {
        metalRod: 4, // get the rod back when a tool is broken
    },
    craftingRecipes: {
        pickaxe: {
            stonePickaxe: {
                metalRod: 1,
                stone: 3,
            },
            bronzePickaxe: {
                metalRod: 1,
                bronze: 3,
            },
            ironPickaxe: {
                metalRod: 1,
                iron: 3,
            },
        },
        axe: { stoneAxe : {
            metalRod: 1,
            stone: 3,
            },
            bronzeAxe: {
            metalRod: 1,
            bronze: 3,
            },
            ironAxe: {
            metalRod: 1,
            iron: 3,
            },
        },
        shovel: { stoneShovel : {
            metalRod: 1,
            stone: 1,
            },
            bronzeShovel: {
            metalRod: 1,
            bronze: 1,
            },
            ironShovel: {
            metalRod: 1,
            iron: 1,
            },
        },
        cellBlock: {
            stoneCellBlock: {
                stone: 9,
            },
            bronzeCellBlock: {
                bronze: 9,
            },
            ironCellBlock: {
                iron: 9,
            },
            bronzeCellChest: {
                bronze: 12,
            },
            ironCellChest: {
                iron: 12,
            },
        }
    }
};

