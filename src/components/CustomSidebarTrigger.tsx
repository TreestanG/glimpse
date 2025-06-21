import { useSidebar } from "@/components/ui/sidebar"
import { Menu } from "lucide-react"

export function CustomTrigger() {
  const { toggleSidebar } = useSidebar()

  return <button onClick={toggleSidebar} className="hover:cursor-pointer hover:rotate-180 transition-all duration-300"><Menu className="w-6 h-6" /></button>
}