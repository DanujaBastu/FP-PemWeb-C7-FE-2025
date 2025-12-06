# Map Selection Dropdown - Update Documentation

## Overview
Map ID field telah diubah dari input text biasa menjadi dropdown dengan 3 kolom yang menampilkan pilihan map secara visual.

## Changes Made

### 1. New Constants File
**File:** `src/constants/maps.ts`
- Menyimpan semua data map yang tersedia
- Mudah untuk di-maintain dan update

```typescript
export interface MapOption {
  id: string;
  name: string;
  difficulty: string;
  size: string;
}

export const AVAILABLE_MAPS: MapOption[] = [
  { id: "map_001", name: "Forest Maze", difficulty: "Easy", size: "Small" },
  { id: "map_002", name: "Castle Labyrinth", difficulty: "Medium", size: "Medium" },
  { id: "map_003", name: "Underground Cavern", difficulty: "Hard", size: "Large" },
  { id: "map_004", name: "Desert Dunes", difficulty: "Easy", size: "Medium" },
  { id: "map_005", name: "Ice Palace", difficulty: "Hard", size: "Large" },
  { id: "map_006", name: "City Streets", difficulty: "Medium", size: "Medium" },
];
```

### 2. Updated Components
Kedua file di-update dengan fitur dropdown:
- `src/pages/maze-chase/CreateMazeChase.tsx`
- `src/pages/maze-chase/EditMazeChase.tsx`

#### Features:
1. **Dropdown Button** - Menampilkan map yang dipilih dengan chevron icon
2. **3-Column Grid** - Menampilkan map options dalam grid 3 kolom
3. **Visual Feedback** - 
   - Pilihan saat ini highlight dengan border biru dan background biru muda
   - Hover effect pada map yang belum dipilih
4. **Map Information** - Setiap map menampilkan:
   - Nama map
   - Difficulty level (Easy, Medium, Hard)
   - Size (Small, Medium, Large)

## UI Layout

### Dropdown Button
```
┌─────────────────────────────────────────┐
│ Forest Maze                        ▼    │
└─────────────────────────────────────────┘
```

### 3-Column Grid (Open State)
```
┌─────────────────┬─────────────────┬─────────────────┐
│ Forest Maze     │ Castle Labyrint │ Underground ... │
│ Easy            │ Medium          │ Hard            │
│ Small           │ Medium          │ Large           │
└─────────────────┴─────────────────┴─────────────────┘
┌─────────────────┬─────────────────┬─────────────────┐
│ Desert Dunes    │ Ice Palace      │ City Streets    │
│ Easy            │ Hard            │ Medium          │
│ Medium          │ Large           │ Medium          │
└─────────────────┴─────────────────┴─────────────────┘
```

## Available Maps

| Map ID | Name | Difficulty | Size |
|--------|------|-----------|------|
| map_001 | Forest Maze | Easy | Small |
| map_002 | Castle Labyrinth | Medium | Medium |
| map_003 | Underground Cavern | Hard | Large |
| map_004 | Desert Dunes | Easy | Medium |
| map_005 | Ice Palace | Hard | Large |
| map_006 | City Streets | Medium | Medium |

## Implementation Details

### State Management
```typescript
const [mapId, setMapId] = useState("");
const [showMapDropdown, setShowMapDropdown] = useState(false);
```

### Selection Handler
```typescript
onClick={() => {
  setMapId(map.id);
  setShowMapDropdown(false);
  clearFormError("mapId"); // Clear validation error
}}
```

### Styling
- Button inactive: `bg-[#F3F3F5]` dengan border abu-abu
- Button hover: `hover:bg-gray-100`
- Selected map: `border-blue-500 bg-blue-50`
- Unselected map: `border-gray-200 bg-gray-50 hover:border-gray-300`
- Dropdown container: `shadow-lg` dengan `max-h-64 overflow-y-auto`

## Error Handling
- Form validation tetap berfungsi
- Error message ditampilkan di bawah dropdown jika map belum dipilih
- Error dipuaskan secara otomatis saat user memilih map

## Future Enhancements
1. Fetch maps dari backend API
2. Add map preview/thumbnail
3. Add search functionality untuk filter maps
4. Add map statistics (required level, etc.)
5. Add map creation feature untuk admin
