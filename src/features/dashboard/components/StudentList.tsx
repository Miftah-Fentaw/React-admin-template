import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Pencil, Trash2, ArrowRight } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/Feedback'
import { TableRoot, THead, TBody, Tr, Th, Td } from '@/components/ui/Table'
import { useToast } from '@/components/feedback/ToastProvider'
import { queryKeys } from '@/lib/query-keys'
import { formatDate } from '@/lib/format'
import { dashboardService } from '../dashboard.service'

export function StudentList() {
  const [search, setSearch] = useState('')
  const toast = useToast()

  const students = useQuery({
    queryKey: queryKeys.dashboard.students,
    queryFn: dashboardService.getStudents,
  })

  const filtered = (students.data ?? []).filter((s) =>
    search.trim() === '' ||
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.parentName.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="student-list">
      <div className="student-list__toolbar">
        <input
          type="search"
          placeholder="Search by student / parent name…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="student-list__search"
          aria-label="Search students"
        />
        <Link to="/users">
          <Button variant="ghost" size="sm">
            See All
            <ArrowRight size={13} aria-hidden="true" />
          </Button>
        </Link>
      </div>

      {students.isPending ? (
        <div className="student-list__skeletons">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} style={{ height: 36 }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState compact title="No students found" description="Try adjusting your search." />
      ) : (
        <TableRoot caption="Student list">
          <THead>
            <Tr>
              <Th>Name</Th>
              <Th>Parent</Th>
              <Th>Contract End</Th>
              <Th style={{ textAlign: 'right' }}>Actions</Th>
            </Tr>
          </THead>
          <TBody>
            {filtered.slice(0, 6).map((student) => (
              <Tr key={student.id}>
                <Td>{student.name}</Td>
                <Td className="text-muted">{student.parentName}</Td>
                <Td>{formatDate(student.contractEnd)}</Td>
                <Td style={{ textAlign: 'right' }}>
                  <span className="student-list__actions">
                    <button
                      type="button"
                      className="student-list__action-btn"
                      aria-label={`Edit ${student.name}`}
                      onClick={() => toast.success('Edit', `Editing ${student.name} (placeholder).`)}
                    >
                      <Pencil size={14} aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      className="student-list__action-btn student-list__action-btn--danger"
                      aria-label={`Delete ${student.name}`}
                      onClick={() => toast.error('Delete', `Delete ${student.name} (placeholder).`)}
                    >
                      <Trash2 size={14} aria-hidden="true" />
                    </button>
                  </span>
                </Td>
              </Tr>
            ))}
          </TBody>
        </TableRoot>
      )}
    </div>
  )
}
