import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { CreateProjectPayload, UpdateProjectPayload } from '@/models/schemas'
import type { ProjectsQuery } from '@/models/Project'
import { queryKeys } from '@/lib/query-keys'
import { projectService } from '../projects.service'

/** Server state for the paginated, filterable projects table. */
export function useProjects(query: ProjectsQuery) {
  return useQuery({
    queryKey: queryKeys.projects.list(query),
    queryFn: () => projectService.list(query),
    placeholderData: (previous) => previous,
  })
}

export function useProject(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.projects.detail(id ?? ''),
    queryFn: () => projectService.get(id as string),
    enabled: Boolean(id),
  })
}

export function useCreateProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateProjectPayload) => projectService.create(input),
    onSuccess: (project) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.projects.all })
      queryClient.setQueryData(queryKeys.projects.detail(project.id), project)
    },
  })
}

export function useUpdateProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateProjectPayload }) =>
      projectService.update(id, input),
    onSuccess: (project) => {
      queryClient.setQueryData(queryKeys.projects.detail(project.id), project)
      void queryClient.invalidateQueries({ queryKey: queryKeys.projects.all })
    },
  })
}

export function useDeleteProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => projectService.remove(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.projects.all })
    },
  })
}
