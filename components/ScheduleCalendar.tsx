'use client'

import { useRouter } from 'next/navigation'
import { DAYS } from '@/lib/constants'
import { formatTime } from '@/lib/utils'
import type { Class } from '@/lib/types'

const HOUR_START = 8
const HOUR_END = 21
const TOTAL_HOURS = HOUR_END - HOUR_START
const SLOT_HEIGHT = 60

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

function minutesToTop(minutes: number): number {
  const offsetMinutes = minutes - HOUR_START * 60
  return (offsetMinutes / 60) * SLOT_HEIGHT
}

function minutesToHeight(startMinutes: number, endMinutes: number): number {
  return ((endMinutes - startMinutes) / 60) * SLOT_HEIGHT
}

const COLORS = [
  'bg-primary/80',
  'bg-orange-400',
  'bg-amber-500',
  'bg-orange-600',
  'bg-yellow-500',
]

export default function ScheduleCalendar({ classes }: { classes: Class[] }) {
  const router = useRouter()

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[600px]">
        <div className="grid grid-cols-[48px_1fr_1fr_1fr_1fr_1fr] border-b border-cream-border">
          <div />
          {DAYS.map(day => (
            <div key={day} className="text-center text-xs font-bold text-gray-500 py-2 uppercase tracking-wide">
              {day}
            </div>
          ))}
        </div>

        <div className="relative grid grid-cols-[48px_1fr_1fr_1fr_1fr_1fr]">
          <div className="flex flex-col">
            {Array.from({ length: TOTAL_HOURS }, (_, i) => (
              <div
                key={i}
                style={{ height: SLOT_HEIGHT }}
                className="text-[10px] text-gray-400 text-right pr-2 pt-0.5"
              >
                {formatTime(`${HOUR_START + i}:00`)}
              </div>
            ))}
          </div>

          {DAYS.map((day, dayIdx) => {
            const dayClasses = classes.filter(c => c.meeting_days?.includes(day))
            return (
              <div
                key={day}
                className="relative border-l border-cream-border"
                style={{ height: TOTAL_HOURS * SLOT_HEIGHT }}
              >
                {Array.from({ length: TOTAL_HOURS }, (_, i) => (
                  <div
                    key={i}
                    style={{ top: i * SLOT_HEIGHT }}
                    className="absolute w-full border-t border-cream-border/60"
                  />
                ))}

                {dayClasses.map((cls, idx) => {
                  if (!cls.start_time || !cls.end_time) return null
                  const startMin = timeToMinutes(cls.start_time)
                  const endMin = timeToMinutes(cls.end_time)
                  const top = minutesToTop(startMin)
                  const height = minutesToHeight(startMin, endMin)

                  return (
                    <button
                      key={cls.id}
                      onClick={() => router.push(`/classes/${cls.id}`)}
                      style={{ top, height, left: 2, right: 2 }}
                      className={`absolute ${COLORS[idx % COLORS.length]} text-white text-[10px] rounded-md px-1.5 py-1 overflow-hidden text-left hover:opacity-90 transition-opacity`}
                    >
                      <div className="font-semibold leading-tight truncate">{cls.title}</div>
                      <div className="opacity-80 text-[9px] mt-0.5">
                        {formatTime(cls.start_time)}–{formatTime(cls.end_time)}
                      </div>
                    </button>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
