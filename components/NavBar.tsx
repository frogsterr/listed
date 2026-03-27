import Link from 'next/link'

export default function NavBar() {
  return (
    <nav className="bg-primary text-white px-6 py-3 flex items-center justify-between sticky top-0 z-50">
      <Link href="/" className="font-bold text-lg tracking-tight">
        LISTED
      </Link>
      <div className="flex gap-6 text-sm opacity-90">
        <Link href="/classes" className="hover:opacity-100 transition-opacity">
          Classes
        </Link>
        <Link href="/professors" className="hover:opacity-100 transition-opacity">
          Professors
        </Link>
        <Link href="/schedule" className="hover:opacity-100 transition-opacity">
          Schedule
        </Link>
      </div>
    </nav>
  )
}
