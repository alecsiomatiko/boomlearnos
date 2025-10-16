"use client"


import * as React from "react"
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react"
import { DayPicker, useNavigation } from "react-day-picker"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function CustomCaption({ displayMonth, goToMonth, nextMonth, previousMonth, onNextClick, onPrevClick }) {
  const months = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];
  const years = Array.from({ length: 12 }, (_, i) => new Date().getFullYear() - 6 + i);
  const currentMonth = displayMonth.getMonth();
  const currentYear = displayMonth.getFullYear();
  return (
    <div className="flex flex-row items-center justify-between w-full px-2 mb-2 gap-2">
      <button
        type="button"
        aria-label="Mes anterior"
        onClick={onPrevClick}
        className="flex items-center justify-center h-8 w-8 rounded-full hover:bg-gray-100 transition"
      >
        <ChevronLeft className="h-5 w-5 text-gray-700" />
      </button>
      <Popover>
        <PopoverTrigger asChild>
          <button
            className="flex items-center gap-2 px-5 py-2 rounded-2xl border border-gray-200 bg-white shadow hover:bg-gray-50 text-lg font-bold text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400"
            aria-label="Seleccionar mes y año"
          >
            <span className="tracking-wide">{months[currentMonth]}</span>
            <span className="mx-1">{currentYear}</span>
            <ChevronDown className="h-5 w-5 ml-1 text-gray-500" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="flex gap-3 p-4 bg-white rounded-2xl shadow-xl border border-gray-200 w-auto min-w-[240px]" align="center">
          <select
            className="rounded-xl border border-gray-200 px-3 py-2 text-base font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-400"
            value={currentMonth}
            onChange={e => goToMonth(new Date(currentYear, Number(e.target.value), 1))}
          >
            {months.map((m, idx) => (
              <option key={m} value={idx}>{m}</option>
            ))}
          </select>
          <select
            className="rounded-xl border border-gray-200 px-3 py-2 text-base font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-400"
            value={currentYear}
            onChange={e => goToMonth(new Date(Number(e.target.value), currentMonth, 1))}
          >
            {years.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </PopoverContent>
      </Popover>
      <button
        type="button"
        aria-label="Mes siguiente"
        onClick={onNextClick}
        className="flex items-center justify-center h-8 w-8 rounded-full hover:bg-gray-100 transition"
      >
        <ChevronRight className="h-5 w-5 text-gray-700" />
      </button>
    </div>
  );
}

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-6 bg-white rounded-2xl shadow-xl", className)}
      classNames={{
        months: "flex flex-col items-center justify-center w-full gap-0", // 1 mes por fila, centrado
        month: "w-full flex flex-col items-center justify-center gap-0", // mes centrado
        caption: "flex flex-col items-center justify-center w-full mb-2", // header centrado
        caption_label: "hidden", // oculto, usamos CustomCaption
        nav: "flex flex-row items-center justify-between w-full px-4 mb-2", // flechas separadas
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-8 w-8 bg-white p-0 opacity-70 hover:opacity-100 border-gray-300"
        ),
        nav_button_previous: "",
        nav_button_next: "",
        table: "w-full border-collapse mt-0", // tabla ocupa todo el ancho
        head_row: "flex flex-row w-full justify-between mb-1 px-2", // días de la semana bien distribuidos
        head_cell:
          "text-gray-500 font-semibold text-base text-center w-1/7 flex-1", // cada día ocupa igual espacio
        row: "flex flex-row w-full justify-between px-2 mb-1", // cada semana ocupa todo el ancho
        cell: "h-9 w-9 text-center text-base p-0 relative rounded-xl transition-all duration-150 flex items-center justify-center cursor-pointer mx-auto",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-semibold aria-selected:opacity-100"
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-red-500 text-white hover:bg-red-600 focus:bg-red-600 focus:text-white",
        day_today: "bg-accent text-accent-foreground border-2 border-red-400",
        day_outside:
          "day-outside text-gray-300 aria-selected:bg-accent/50 aria-selected:text-gray-400",
        day_disabled: "text-gray-300 opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        Caption: (props) => (
          <CustomCaption
            displayMonth={props.displayMonth}
            goToMonth={props.goToMonth}
            nextMonth={props.nextMonth}
            previousMonth={props.previousMonth}
            onNextClick={props.onNextClick}
            onPrevClick={props.onPrevClick}
          />
        ),
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
