// Inventory management component extracted from working AdminPanel
import React from 'react';
import type { InventoryItem } from '../../types/story';

interface InventoryManagementProps {
  inventory: InventoryItem[];
  onEdit: (item: InventoryItem) => void;
  onDelete: (item: InventoryItem) => void;
  onAdd: () => void;
}

export function InventoryManagement({ inventory, onEdit, onDelete, onAdd }: InventoryManagementProps) {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h4 className="font-medium text-gray-900">Inventory ({inventory.length} items)</h4>
        <button
          onClick={onAdd}
          className="px-3 py-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200 text-sm"
        >
          Add Item
        </button>
      </div>
      <div className="space-y-3">
        {inventory.map((item, index) => (
          <div key={index} className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h5 className="font-medium">{item.name} (x{item.quantity})</h5>
                <p className="text-sm text-gray-600">{item.description}</p>
                <div className="text-xs text-gray-500 mt-1">
                  Type: <span className="font-medium">{item.type}</span>
                  {item.properties && Object.keys(item.properties).length > 0 && (
                    <details className="inline ml-2">
                      <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                        Properties ↓
                      </summary>
                      <div className="mt-1 ml-4 space-y-1">
                        {Object.entries(item.properties).map(([key, value]) => (
                          <div key={key} className="text-xs">
                            <span className="font-medium capitalize">{key}:</span> {JSON.stringify(value)}
                          </div>
                        ))}
                      </div>
                    </details>
                  )}
                </div>
              </div>
              <div className="flex space-x-2 ml-4">
                <button
                  onClick={() => onEdit(item)}
                  className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(item)}
                  className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
        {inventory.length === 0 && (
          <div className="text-gray-500 italic">No items in inventory</div>
        )}
      </div>
    </div>
  );
}