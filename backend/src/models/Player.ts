import mongoose, { Schema, Document } from 'mongoose';

interface IPlayer extends Document {
    inventorySpace: number;
    health: number;
    movementPerTurn: number;
    resources: {
        stone: number;
        iron: number;
        copper: number;
        zinc: number;
        tin: number;
        gold: number;
        silver: number;
    };
    tools: {
        pickaxe: {
            stone: number;
            bronze: number;
            iron: number;
        };
        axe: {
            stone: number;
            bronze: number;
            iron: number;
        };
        shovel: {
            stone: number;
            bronze: number;
            iron: number;
        };
    };
    craftingMaterials: {
        metalRod: number;
    };
}

const PlayerSchema: Schema = new Schema({
    inventorySpace: { type: Number, default: 100 },
    health: { type: Number, default: 100 },
    movementPerTurn: { type: Number, default: 5 },
    resources: {
        stone: { type: Number, default: 0 },
        iron: { type: Number, default: 0 },
        copper: { type: Number, default: 0 },
        zinc: { type: Number, default: 0 },
        tin: { type: Number, default: 0 },
        gold: { type: Number, default: 0 },
        silver: { type: Number, default: 0 }
    },
    tools: {
        pickaxe: {
            stone: { type: Number, default: 0 },
            bronze: { type: Number, default: 0 },
            iron: { type: Number, default: 0 }
        },
        axe: {
            stone: { type: Number, default: 0 },
            bronze: { type: Number, default: 0 },
            iron: { type: Number, default: 0 }
        },
        shovel: {
            stone: { type: Number, default: 0 },
            bronze: { type: Number, default: 0 },
            iron: { type: Number, default: 0 }
        }
    },
    craftingMaterials: {
        metalRod: { type: Number, default: 4 }
    }
});

export default mongoose.model<IPlayer>('Player', PlayerSchema); 