import { Menu } from 'lucide-react';
import { useSidebar } from '@/components/ui/sidebar';

export function CustomTrigger() {
  const { toggleSidebar } = useSidebar();

  return (
    <button
      className="transition-all duration-300 hover:rotate-180 hover:cursor-pointer"
      onClick={toggleSidebar}
    >
      <Menu className="h-6 w-6" />
    </button>
  );
}
