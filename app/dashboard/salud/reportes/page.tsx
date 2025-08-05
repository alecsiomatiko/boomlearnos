"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, FileText, CalendarIcon, FilterX } from "lucide-react"
import { demoFinancialData, type Transaction } from "@/lib/salud-data"
import { toast } from "sonner"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import type { DateRange } from "react-day-picker"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

export default function ReportesPage() {
  const allCategories = [...new Set(demoFinancialData.flatMap((m) => m.transactions.map((t) => t.category)))]

  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [types, setTypes] = useState<string[]>(["income", "expense"])
  const [categories, setCategories] = useState<string[]>(allCategories)
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])

  const applyFilters = () => {
    let transactions = demoFinancialData.flatMap((m) => m.transactions)

    if (dateRange?.from && dateRange?.to) {
      transactions = transactions.filter((t) => {
        const transactionDate = new Date(t.date)
        return transactionDate >= dateRange.from! && transactionDate <= dateRange.to!
      })
    }

    transactions = transactions.filter((t) => types.includes(t.type))
    transactions = transactions.filter((t) => categories.includes(t.category))

    setFilteredTransactions(transactions)
    toast.info(`${transactions.length} transacciones encontradas con los filtros aplicados.`)
  }

  const clearFilters = () => {
    setDateRange(undefined)
    setTypes(["income", "expense"])
    setCategories(allCategories)
    setFilteredTransactions([])
    toast.info("Filtros limpiados.")
  }

  const handleDownloadCSV = () => {
    const dataToDownload =
      filteredTransactions.length > 0 ? filteredTransactions : demoFinancialData.flatMap((m) => m.transactions)
    if (dataToDownload.length === 0) {
      toast.error("No hay datos para descargar con los filtros actuales.")
      return
    }

    const headers = ["ID", "Fecha", "Descripción", "Monto", "Tipo", "Categoría"]
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [
        headers.join(","),
        ...dataToDownload.map((t) => [t.id, t.date, `"${t.description}"`, t.amount, t.type, t.category].join(",")),
      ].join("\n")

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", "reporte_financiero_filtrado.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success("Reporte CSV descargado exitosamente.")
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight text-white">Generación de Reportes</h1>
      <Card className="bg-gray-800/50 border-gray-700 text-white">
        <CardHeader>
          <CardTitle>Filtros Avanzados</CardTitle>
          <CardDescription className="text-gray-400">
            Selecciona los criterios para generar un reporte personalizado.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Date Range Filter */}
            <div className="space-y-2">
              <Label>Rango de Fechas</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal bg-gray-800 border-gray-600 hover:bg-gray-700",
                      !dateRange && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "LLL dd, y", { locale: es })} -{" "}
                          {format(dateRange.to, "LLL dd, y", { locale: es })}
                        </>
                      ) : (
                        format(dateRange.from, "LLL dd, y", { locale: es })
                      )
                    ) : (
                      <span>Elige un rango</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-gray-900 border-gray-700" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                    className="text-white"
                  />
                </PopoverContent>
              </Popover>
            </div>
            {/* Type Filter */}
            <div className="space-y-2">
              <Label>Tipo de Transacción</Label>
              <div className="flex items-center space-x-4 pt-2">
                {["income", "expense"].map((type) => (
                  <div key={type} className="flex items-center space-x-2">
                    <Checkbox
                      id={`type-${type}`}
                      checked={types.includes(type)}
                      onCheckedChange={(checked) => {
                        return checked ? setTypes([...types, type]) : setTypes(types.filter((t) => t !== type))
                      }}
                      className="border-gray-500 data-[state=checked]:bg-kalabasboom-red"
                    />
                    <Label htmlFor={`type-${type}`} className="capitalize text-white">
                      {type === "income" ? "Ingreso" : "Gasto"}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            {/* Category Filter */}
            <div className="space-y-2">
              <Label>Categorías</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal bg-gray-800 border-gray-600 hover:bg-gray-700"
                  >
                    {categories.length === allCategories.length
                      ? "Todas las categorías"
                      : `${categories.length} seleccionada(s)`}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-2 bg-gray-900 border-gray-700 w-64">
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {allCategories.map((category) => (
                      <div key={category} className="flex items-center space-x-2">
                        <Checkbox
                          id={`cat-${category}`}
                          checked={categories.includes(category)}
                          onCheckedChange={(checked) => {
                            return checked
                              ? setCategories([...categories, category])
                              : setCategories(categories.filter((c) => c !== category))
                          }}
                          className="border-gray-500 data-[state=checked]:bg-kalabasboom-red"
                        />
                        <Label htmlFor={`cat-${category}`} className="text-white font-normal">
                          {category}
                        </Label>
                      </div>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button onClick={applyFilters} className="bg-kalabasboom-red hover:bg-kalabasboom-red/90">
              Aplicar Filtros
            </Button>
            <Button onClick={clearFilters} variant="ghost" className="hover:bg-gray-700">
              <FilterX className="mr-2 h-4 w-4" />
              Limpiar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-800/50 border-gray-700 text-white">
        <CardHeader>
          <CardTitle>Exportar Datos</CardTitle>
          <CardDescription className="text-gray-400">
            Descarga tus datos filtrados en diferentes formatos.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-4">
          <Button onClick={handleDownloadCSV} className="w-full md:w-auto">
            <Download className="mr-2 h-4 w-4" />
            Descargar CSV
          </Button>
          <Button disabled className="w-full md:w-auto">
            <FileText className="mr-2 h-4 w-4" />
            Descargar PDF (Próximamente)
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
