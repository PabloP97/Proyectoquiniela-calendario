import { Calendar } from "./ui/calendar";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";

interface CalendarViewProps {
  selectedDate: Date | undefined;
  onDateSelect: (date: Date | undefined) => void;
  diasFinalizados?: Set<string>;
}

export function CalendarView({ selectedDate, onDateSelect, diasFinalizados }: CalendarViewProps) {
  const today = new Date();

  // TODO: SP_SELECT - Los días finalizados se cargan desde App.tsx al inicializar
  // EXEC SP_GetDiasFinalizados @usuario_id = ?
  
  // Función para deshabilitar días
  const isDayDisabled = (date: Date) => {
    // Deshabilitar domingos (day 0 = domingo)
    if (date.getDay() === 0) {
      return true;
    }
    
    // Deshabilitar días futuros
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    if (dateOnly > todayOnly) {
      return true;
    }
    
    return false;
  };
  
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Calendario</CardTitle>

      </CardHeader>
      <CardContent>
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={onDateSelect}
          disabled={isDayDisabled}
          className="rounded-md border w-fit max-w-md mx-auto scale-110 block"
        />
      </CardContent>
    </Card>
  );
}