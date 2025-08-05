"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TransactionsDataTable } from "@/components/salud/transactions-data-table"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { TransactionForm } from "@/components/salud/transaction-form"
import { demoFinancialData, type Transaction } from "@/lib/salud-data"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function IngresoGastoPage() {
  const [transactions, setTransactions] = useState<Transaction[]>(() =>
    demoFinancialData.flatMap((m) => m.transactions),
  )
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isAlertOpen, setIsAlertOpen] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | undefined>(undefined)
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null)

  const handleAddClick = () => {
    setSelectedTransaction(undefined)
    setIsFormOpen(true)
  }

  const handleEditClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction)
    setIsFormOpen(true)
  }

  const handleDeleteClick = (transaction: Transaction) => {
    setTransactionToDelete(transaction)
    setIsAlertOpen(true)
  }

  const confirmDelete = () => {
    if (transactionToDelete) {
      setTransactions(transactions.filter((t) => t.id !== transactionToDelete.id))
      toast.success("Transacción eliminada exitosamente.")
    }
    setIsAlertOpen(false)
    setTransactionToDelete(null)
  }

  const handleFormSubmit = (data: Omit<Transaction, "id">) => {
    if (selectedTransaction) {
      // Update
      setTransactions(transactions.map((t) => (t.id === selectedTransaction.id ? { ...t, ...data, id: t.id } : t)))
      toast.success("Transacción actualizada exitosamente.")
    } else {
      // Create
      const newTransaction: Transaction = {
        ...data,
        id: `new-${Date.now()}`,
      }
      setTransactions([newTransaction, ...transactions])
      toast.success("Transacción agregada exitosamente.")
    }
    setIsFormOpen(false)
    setSelectedTransaction(undefined)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Ingresos y Gastos</h1>
          <p className="text-gray-400 mt-1">Gestiona y registra todas tus transacciones financieras.</p>
        </div>
        <Button onClick={handleAddClick} className="bg-kalabasboom-red hover:bg-kalabasboom-red/90">
          <PlusCircle className="mr-2 h-4 w-4" />
          Agregar Transacción
        </Button>
      </div>

      <TransactionForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        transaction={selectedTransaction}
      />

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent className="bg-gray-900 border-gray-700 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Esta acción no se puede deshacer. Esto eliminará permanentemente la transacción.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="hover:bg-gray-700">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Card className="bg-gray-800/50 border-gray-700 text-white">
        <CardHeader>
          <CardTitle>Historial de Transacciones</CardTitle>
          <CardDescription className="text-gray-400">
            Busca, ordena, edita y elimina a través de todo tu historial.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TransactionsDataTable data={transactions} onEdit={handleEditClick} onDelete={handleDeleteClick} />
        </CardContent>
      </Card>
    </div>
  )
}
