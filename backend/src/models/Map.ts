import mongoose, { Schema, Document } from 'mongoose';

// Cell Schema
const CellSchema = new Schema({
  id: { type: String },
  row: { type: Number },
  col: { type: Number },
  x: { type: Number, required: true },
  y: { type: Number, required: true },
  type: { type: String, required: true, enum: ['wall', 'floor', 'exit', 'unbreakable'] },
  isExit: { type: Boolean },
  isBreakable: { type: Boolean },
  isSelectable: { type: Boolean },
  resources: {
    stone: { type: Number, default: 0 },
    iron: { type: Number, default: 0 },
    copper: { type: Number, default: 0 },
    zinc: { type: Number, default: 0 },
    tin: { type: Number, default: 0 },
    gold: { type: Number, default: 0 },
    silver: { type: Number, default: 0 }
  },
  modifiedAt: { type: Date }
});

// Add pre-save middleware to validate resources
CellSchema.pre('save', function(next) {
  // Only wall cells can have non-zero resources
  if (this.type === 'wall' || this.type === 'unbreakable') {
    if (this.resources) {
      const hasResources = Object.values(this.resources).some(value => value > 0);
      if (!hasResources) {
        next(new Error('Wall cells must have at least one non-zero resource'));
        return;
      }
    }
  } else {
    // All other cell types (floor, exit) must have zero resources
    if (this.resources) {
      const allZero = Object.values(this.resources).every(value => value === 0);
      if (!allZero) {
        next(new Error('Non-wall cells must have all resources set to zero'));
        return;
      }
    }
  }



  next();
});

// Exit Schema
const ExitSchema = new Schema({
  targetMapId: { type: Schema.Types.ObjectId, ref: 'BaseMap', required: false },
  position: {
    x: { type: Number, required: true },
    y: { type: Number, required: true }
  }
});

// Base Map Schema
const BaseMapSchema = new Schema({
  name: { type: String, required: true },
  width: { type: Number, required: true },
  height: { type: Number, required: true },
  baseLayout: {
    cells: [CellSchema]
  },
  exits: {
    north: { type: Boolean, required: true, default: false },
    south: { type: Boolean, required: true, default: false },
    east: { type: Boolean, required: true, default: false },
    west: { type: Boolean, required: true, default: false }
  },
  createdAt: { type: Date, default: Date.now }
});

// Modified Map Schema
const ModifiedMapSchema = new Schema({
  baseMapId: { type: Schema.Types.ObjectId, ref: 'BaseMap', required: true },
  playerId: { type: Schema.Types.ObjectId, ref: 'Player', required: true },
  modifiedLayout: {
    cells: [CellSchema]
  },
  modifications: [{
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    originalType: { type: String, required: true },
    newType: { type: String, required: true },
    modifiedAt: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now },
  lastModifiedAt: { type: Date, default: Date.now }
});

// Update timestamps
BaseMapSchema.pre('save', function(next) {
  this.createdAt = new Date();
  next();
});

ModifiedMapSchema.pre('save', function(next) {
  this.lastModifiedAt = new Date();
  next();
});

// Create and export the models
export const BaseMap = mongoose.model('BaseMap', BaseMapSchema);
export const ModifiedMap = mongoose.model('ModifiedMap', ModifiedMapSchema);

// Interfaces
interface Cell {
  id?: string;
  row?: number;
  col?: number;
  x: number;
  y: number;
  type: 'wall' | 'floor' | 'exit' | 'unbreakable';
  isExit?: boolean;
  isBreakable?: boolean;
  isSelectable?: boolean;
  resources?: {
    stone: number;
    iron: number;
    copper: number;
    zinc: number;
    tin: number;
    gold: number;
    silver: number;
  };
  modifiedAt?: Date;
}

interface Exit {
  targetMapId: mongoose.Types.ObjectId;
  position: {
    x: number;
    y: number;
  };
}

// Document interfaces
interface BaseMapDocument extends Document {
  name: string;
  width: number;
  height: number;
  baseLayout: {
    cells: Cell[];
  };
  exits: {
    north: boolean;
    south: boolean;
    east: boolean;
    west: boolean;
  };
  createdAt: Date;
}

interface ModifiedMapDocument extends Document {
  baseMapId: mongoose.Types.ObjectId;
  playerId: mongoose.Types.ObjectId;
  modifiedLayout: {
    cells: Cell[];
  };
  modifications: {
    x: number;
    y: number;
    originalType: string;
    newType: string;
    modifiedAt: Date;
  }[];
  createdAt: Date;
  lastModifiedAt: Date;
}

// Data interfaces (for API responses)
interface BaseMapData {
  _id: mongoose.Types.ObjectId;
  name: string;
  width: number;
  height: number;
  baseLayout: {
    cells: Cell[];
  };
  exits: {
    north: boolean;
    south: boolean;
    east: boolean;
    west: boolean;
  };
  createdAt: Date;
}

interface ModifiedMapData {
  _id: mongoose.Types.ObjectId;
  baseMapId: mongoose.Types.ObjectId;
  playerId: mongoose.Types.ObjectId;
  modifiedLayout: {
    cells: Cell[];
  };
  modifications: {
    x: number;
    y: number;
    originalType: string;
    newType: string;
    modifiedAt: Date;
  }[];
  createdAt: Date;
  lastModifiedAt: Date;
}

export type { Cell, Exit, BaseMapDocument, ModifiedMapDocument, BaseMapData, ModifiedMapData };
