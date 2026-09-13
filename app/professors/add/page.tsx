import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/admin'
import AddProfessorForm from '@/components/AddProfessorForm'

export default async function Page() {
  if (!(await isAdmin())) redirect('/admin')
  return <AddProfessorForm />
}
