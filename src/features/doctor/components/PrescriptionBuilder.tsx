import React from 'react';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Pill, Plus, Trash2 } from 'lucide-react';

export interface PrescriptionItemInput {
  id: string;
  medication_name: string;
  dosage: string;
  frequency: string;
  instructions: string;
}

interface PrescriptionBuilderProps {
  items: PrescriptionItemInput[];
  onChange: (items: PrescriptionItemInput[]) => void;
}

export const PrescriptionBuilder: React.FC<PrescriptionBuilderProps> = ({ items, onChange }) => {
  const handleAddItem = () => {
    const newItem: PrescriptionItemInput = {
      id: Math.random().toString(36).substring(2, 9),
      medication_name: '',
      dosage: '',
      frequency: '',
      instructions: '',
    };
    onChange([...items, newItem]);
  };

  const handleRemoveItem = (id: string) => {
    onChange(items.filter((item) => item.id !== id));
  };

  const handleUpdateItem = (id: string, field: keyof PrescriptionItemInput, value: string) => {
    onChange(
      items.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  return (
    <div className="space-y-3 pt-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
          <Pill className="w-4 h-4 text-purple-400" />
          Electronic Prescription Items ({items.length})
        </label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddItem}
          icon={<Plus className="w-3.5 h-3.5" />}
        >
          Add Rx Item
        </Button>
      </div>

      {items.length === 0 ? (
        <p className="text-xs text-slate-500 italic p-3 bg-slate-900/60 rounded-lg border border-slate-800">
          No prescription medications added to this encounter. Click 'Add Rx Item' above to prescribe.
        </p>
      ) : (
        <div className="space-y-3">
          {items.map((item, index) => (
            <div
              key={item.id}
              className="p-3.5 bg-slate-800/60 rounded-xl border border-slate-700/80 space-y-3 relative group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-300">Medication #{index + 1}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveItem(item.id)}
                  className="text-slate-400 hover:text-rose-400 p-1 rounded hover:bg-slate-700/50 transition"
                  title="Remove medication"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <Input
                  label="Medication Name"
                  placeholder="e.g. Paracetamol"
                  required
                  value={item.medication_name}
                  onChange={(e) => handleUpdateItem(item.id, 'medication_name', e.target.value)}
                />
                <Input
                  label="Dosage"
                  placeholder="e.g. 500mg"
                  required
                  value={item.dosage}
                  onChange={(e) => handleUpdateItem(item.id, 'dosage', e.target.value)}
                />
                <Input
                  label="Frequency"
                  placeholder="e.g. 3x daily after meals"
                  required
                  value={item.frequency}
                  onChange={(e) => handleUpdateItem(item.id, 'frequency', e.target.value)}
                />
              </div>

              <Input
                label="Special Instructions"
                placeholder="e.g. Take for 5 days. Drink plenty of water."
                value={item.instructions}
                onChange={(e) => handleUpdateItem(item.id, 'instructions', e.target.value)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
