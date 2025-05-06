import { Button } from "@/components/ui/button"
import TransactionForm from "@/forms/transactions/TransactionForm"
import CategoriesOfPastTransactionsPieChart from "@/myComponents/categoriesOfPastTransactionsPieChart"
import PastTranscations from "@/myComponents/pastTranscations"

export default function Home() {
  return (
    <div className="bg-slate-800 min-h-screen p-8">
      <TransactionForm />
      <PastTranscations />
      <CategoriesOfPastTransactionsPieChart />
    </div>
  )
}
