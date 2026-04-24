"use client"
import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

export default function DesktopSidebarWrapper({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  
  return (
    <>
      <aside 
        className={`bg-white shadow-md flex-col hidden xl:flex shrink-0 transition-all duration-300 relative z-20 ${
          isCollapsed ? 'w-0 overflow-hidden' : 'w-64'
        }`}
      >
        <div className="w-64 flex flex-col h-full">
          {children}
        </div>
      </aside>

      <div className="hidden xl:flex items-center z-30 transition-all duration-300 absolute" style={{ left: isCollapsed ? '0px' : '256px', top: '50%', transform: 'translateY(-50%)' }}>
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`flex items-center justify-center bg-white border border-gray-200 shadow-md text-gray-500 hover:text-blue-600 hover:bg-gray-50 transition-colors
            ${isCollapsed ? 'w-6 h-16 rounded-r-lg border-l-0 -ml-[1px]' : 'w-5 h-16 rounded-l-lg border-r-0 -ml-5'}
          `}
          title={isCollapsed ? "Mở rộng menu" : "Thu gọn menu"}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </>
  )
}
