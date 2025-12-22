import './StatusSelect.css';

interface StatusSelectProps {
  value: 'available' | 'reserved' | 'sold';
  onChange: (status: 'available' | 'reserved' | 'sold') => void;
}

export default function StatusSelect({ value, onChange }: StatusSelectProps) {
  return (
    <select
      className="status-select"
      value={value}
      onChange={(e) => onChange(e.target.value as 'available' | 'reserved' | 'sold')}
    >
      <option value="available">Доступен</option>
      <option value="reserved">Забронирован</option>
      <option value="sold">В архиве</option>
    </select>
  );
}

