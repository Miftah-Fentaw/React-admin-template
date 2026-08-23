import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { CreateUserPayload, UpdateUserPayload } from '@/models/schemas'
import { queryKeys } from '@/lib/query-keys'
import { userService } from '../users.service'
import type { UsersQuery } from '@/models/User'

/** Server state for the paginated, filterable users table. */
export function useUsers(query: UsersQuery) {
  return useQuery({
    queryKey: queryKeys.users.list(query),
    queryFn: () => userService.list(query),
    placeholderData: (previous) => previous,
  })
}

export function useUser(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.users.detail(id ?? ''),
    queryFn: () => userService.get(id as string),
    enabled: Boolean(id),
  })
}

export function useCreateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateUserPayload) => userService.create(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.users.all })
      void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.overview })
    },
  })
}

export function useUpdateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateUserPayload }) =>
      userService.update(id, input),
    onSuccess: (user) => {
      queryClient.setQueryData(queryKeys.users.detail(user.id), user)
      void queryClient.invalidateQueries({ queryKey: queryKeys.users.all })
    },
  })
}

export function useDeleteUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => userService.remove(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.users.all })
      void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.overview })
    },
  })
}
