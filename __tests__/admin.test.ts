import { beforeEach, describe, expect, it, vi } from 'vitest'

const { getUser, signInWithPassword, signOut, service, createClient, revalidatePath } = vi.hoisted(() => ({
  getUser: vi.fn(), signInWithPassword: vi.fn(), signOut: vi.fn(), service: vi.fn(), createClient: vi.fn(), revalidatePath: vi.fn(),
}))
vi.mock('@/lib/supabase/server', () => ({ createClient }))
vi.mock('@/lib/supabase/service', () => ({ createServiceClient: service }))
vi.mock('next/cache', () => ({ revalidatePath }))
import { isAdmin } from '@/lib/admin'
import { loginAdmin } from '@/actions/admin'
import { addClass, deleteClass } from '@/actions/classes'
import { addProfessor, deleteProfessor } from '@/actions/professors'
import { deleteReview } from '@/actions/reviews'

beforeEach(() => {
  vi.resetAllMocks()
  vi.stubEnv('ADMIN_USER_ID', 'admin-id')
  createClient.mockResolvedValue({ auth: { getUser, signInWithPassword, signOut } })
  getUser.mockResolvedValue({ data: { user: null }, error: null })
})

describe('server-side admin authorization', () => {
  it('fails closed when the admin is not configured', async () => {
    vi.stubEnv('ADMIN_USER_ID', '')
    expect(await isAdmin()).toBe(false)
    expect(createClient).not.toHaveBeenCalled()
  })
  it('rejects a signed-in non-admin and user-controlled admin metadata', async () => {
    getUser.mockResolvedValue({ data: { user: { id: 'other', user_metadata: { admin: true } } }, error: null })
    expect(await isAdmin()).toBe(false)
  })
  it('rejects auth errors even if a user object is present', async () => {
    getUser.mockResolvedValue({ data: { user: { id: 'admin-id' } }, error: new Error('expired') })
    expect(await isAdmin()).toBe(false)
  })
  it('accepts only the server-verified configured user', async () => {
    getUser.mockResolvedValue({ data: { user: { id: 'admin-id' } }, error: null })
    expect(await isAdmin()).toBe(true)
  })
  it.each([false, true])('blocks all privileged actions before touching the service client (signed in: %s)', async signedIn => {
    if (signedIn) getUser.mockResolvedValue({ data: { user: { id: 'other' } }, error: null })
    const result = await Promise.all([
      addClass({ title: 'Unauthorized', semester: 'Fall 2026', meeting_days: [] }),
      addProfessor('Unauthorized'), deleteClass('id'), deleteProfessor('id'), deleteReview('id'),
    ])
    result.forEach(r => expect(r.error).toBe('Admin access required.'))
    expect(service).not.toHaveBeenCalled()
  })
  it('allows the admin deletion and invalidates all dependent pages', async () => {
    getUser.mockResolvedValue({ data: { user: { id: 'admin-id' } }, error: null })
    const eq = vi.fn().mockResolvedValue({ error: null })
    service.mockReturnValue({ from: vi.fn().mockReturnValue({ delete: () => ({ eq }) }) })
    expect(await deleteClass('class-id')).toEqual({ error: null })
    expect(eq).toHaveBeenCalledWith('id', 'class-id')
    expect(revalidatePath).toHaveBeenCalledWith('/', 'layout')
  })
  it('signs out successful logins for non-admin accounts', async () => {
    signInWithPassword.mockResolvedValue({ data: { user: { id: 'other' }, session: {} }, error: null })
    expect((await loginAdmin('other@example.com', 'password')).error).toBeTruthy()
    expect(signOut).toHaveBeenCalled()
  })
})
