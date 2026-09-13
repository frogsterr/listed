import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/admin'
import AddClassForm from '@/components/AddClassForm'

export default async function Page() {
  if (!(await isAdmin())) redirect('/admin')
  return <AddClassForm />
}
