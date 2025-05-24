import mongoose, { Schema, Document } from 'mongoose';

export interface IPlayer extends Document {
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
    mapsBound: {
        [mapId: string]: {
            baseMapId: mongoose.Types.ObjectId;
            playerId: mongoose.Types.ObjectId;
            modifiedLayout: {
                cells: Array<{
                    x: number;
                    y: number;
                    type: 'wall' | 'floor' | 'exit' | 'unbreakable';
                    resources: {
                        stone: number;
                        iron: number;
                        copper: number;
                        zinc: number;
                        tin: number;
                        gold: number;
                        silver: number;
                    };
                }>;
            };
            modifications: Array<{
                x: number;
                y: number;
                originalType: string;
                newType: string;
                modifiedAt: Date;
            }>;
            connections: {
                north?: { mapId: string; baseMapId: mongoose.Types.ObjectId };
                south?: { mapId: string; baseMapId: mongoose.Types.ObjectId };
                east?: { mapId: string; baseMapId: mongoose.Types.ObjectId };
                west?: { mapId: string; baseMapId: mongoose.Types.ObjectId };
            };
            createdAt: Date;
            lastModifiedAt: Date;
        };
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
    },
    mapsBound: {
        type: Map,
        of: {
            baseMapId: { type: Schema.Types.ObjectId, ref: 'BaseMap', required: true },
            playerId: { type: Schema.Types.ObjectId, ref: 'Player', required: true },
            modifiedLayout: {
                cells: [{
                    x: { type: Number, required: true },
                    y: { type: Number, required: true },
                    type: { type: String, required: true, enum: ['wall', 'floor', 'exit', 'unbreakable'] },
                    resources: {
                        stone: { type: Number, default: 0 },
                        iron: { type: Number, default: 0 },
                        copper: { type: Number, default: 0 },
                        zinc: { type: Number, default: 0 },
                        tin: { type: Number, default: 0 },
                        gold: { type: Number, default: 0 },
                        silver: { type: Number, default: 0 }
                    }
                }]
            },
            modifications: [{
                x: { type: Number, required: true },
                y: { type: Number, required: true },
                originalType: { type: String, required: true },
                newType: { type: String, required: true },
                modifiedAt: { type: Date, default: Date.now }
            }],
            connections: {
                north: { mapId: String, baseMapId: { type: Schema.Types.ObjectId, ref: 'BaseMap' } },
                south: { mapId: String, baseMapId: { type: Schema.Types.ObjectId, ref: 'BaseMap' } },
                east: { mapId: String, baseMapId: { type: Schema.Types.ObjectId, ref: 'BaseMap' } },
                west: { mapId: String, baseMapId: { type: Schema.Types.ObjectId, ref: 'BaseMap' } }
            },
            createdAt: { type: Date, default: Date.now },
            lastModifiedAt: { type: Date, default: Date.now }
        }
    }
});

export default mongoose.model<IPlayer>('Player', PlayerSchema); 