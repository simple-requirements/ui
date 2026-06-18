import { useEffect, useMemo, useState } from 'react'
import {
  QueryClient,
  QueryClientProvider,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import 'primeicons/primeicons.css'
import { z } from 'zod'
import './App.css'

const categoryTypeSchema = z.enum(['FR', 'NFR'])
const projectSchema = z.object({
  id: z.string(),
  name: z.string(),
  requirementCount: z.number().int().nonnegative(),
})
const categorySchema = z.object({
  id: z.string(),
  key: z.string(),
  name: z.string(),
  type: categoryTypeSchema,
})
const requirementSchema = z.object({
  id: z.string(),
  visibleKey: z.string(),
  projectId: z.string(),
  categoryKey: z.string().optional(),
  categoryName: z.string().optional(),
  type: categoryTypeSchema.optional(),
  status: z.string().optional(),
  priority: z.string().optional(),
  owner: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  rationale: z.string().nullable().optional(),
  source: z.string().nullable().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
})

const projectsSchema = z.array(projectSchema)
const categoriesSchema = z.array(categorySchema)
const requirementsSchema = z.array(requirementSchema)

type CategoryType = z.infer<typeof categoryTypeSchema>
type Project = z.infer<typeof projectSchema>
type Category = z.infer<typeof categorySchema>
type Requirement = z.infer<typeof requirementSchema>
type WorkspaceModule = 'requirements' | 'categories'
type ApiErrorKind =
  | 'validation'
  | 'accessDenied'
  | 'notFound'
  | 'conflict'
  | 'network'
  | 'unexpected'
  | 'aborted'

export class ApiError extends Error {
  constructor(
    public readonly kind: ApiErrorKind,
    message: string,
    public readonly fieldErrors: Record<string, string> = {},
  ) {
    super(message)
  }
}

export const projectKeys = {
  all: ['projects'] as const,
  detail: (projectId: string) => ['projects', projectId] as const,
}

export const categoryKeys = {
  all: ['categories'] as const,
}

export const requirementKeys = {
  list: (projectId: string) => ['requirements', 'list', projectId] as const,
  detail: (requirementId: string) => ['requirements', 'detail', requirementId] as const,
  byVisibleKey: (visibleKey: string) =>
    ['requirements', 'visible-key', visibleKey] as const,
}

export function normalizeVisibleKey(value: string) {
  return value.trim().toUpperCase()
}

function getBackendBaseUrl() {
  const configuredUrl = import.meta.env.VITE_API_BASE_URL as string | undefined

  if (!configuredUrl) {
    throw new ApiError(
      'unexpected',
      'Backend URL is not configured. Set VITE_API_BASE_URL.',
    )
  }

  try {
    return new URL(configuredUrl).toString().replace(/\/$/, '')
  } catch {
    throw new ApiError(
      'unexpected',
      'Backend URL is malformed. Check VITE_API_BASE_URL.',
    )
  }
}

function parseJsonSafely(text: string): unknown {
  try {
    return JSON.parse(text) as unknown
  } catch {
    return undefined
  }
}

export function mapHttpError(status: number, body: unknown): ApiError {
  const responseBody = body as
    | { message?: string; title?: string; errors?: Record<string, string> }
    | undefined
  const message =
    responseBody?.message ??
    responseBody?.title ??
    `Backend request failed with HTTP ${String(status)}.`

  if (status === 400) {
    return new ApiError('validation', message, responseBody?.errors ?? {})
  }

  if (status === 403) {
    return new ApiError('accessDenied', 'Access denied.')
  }

  if (status === 404) {
    return new ApiError('notFound', 'The requested record was not found.')
  }

  if (status === 409) {
    return new ApiError('conflict', message)
  }

  return new ApiError('unexpected', message)
}

async function request<T>(
  path: string,
  schema: z.ZodType<T>,
  init: RequestInit = {},
): Promise<T> {
  let response: Response

  try {
    const headers = new Headers(init.headers)
    headers.set('content-type', 'application/json')

    response = await fetch(`${getBackendBaseUrl()}${path}`, {
      ...init,
      headers,
    })
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new ApiError('aborted', 'Request was cancelled.')
    }

    throw new ApiError('network', 'Unable to reach the backend.')
  }

  const text = await response.text()
  const body = text ? parseJsonSafely(text) : undefined

  if (!response.ok) {
    throw mapHttpError(response.status, body)
  }

  const parsed = schema.safeParse(body)

  if (!parsed.success) {
    throw new ApiError('unexpected', 'Backend response did not match the expected contract.')
  }

  return parsed.data
}

const api = {
  listProjects: (signal?: AbortSignal) =>
    request('/projects', projectsSchema, { signal }),
  createProject: (name: string) =>
    request('/projects', projectSchema, {
      method: 'POST',
      body: JSON.stringify({ name }),
    }),
  listCategories: (signal?: AbortSignal) =>
    request('/categories', categoriesSchema, { signal }),
  createCategory: (input: { key: string; name: string; type: CategoryType }) =>
    request('/categories', categorySchema, {
      method: 'POST',
      body: JSON.stringify(input),
    }),
  listRequirements: (projectId: string, signal?: AbortSignal) =>
    request(
      `/requirements?projectId=${encodeURIComponent(projectId)}`,
      requirementsSchema,
      { signal },
    ),
  getRequirement: (requirementId: string, signal?: AbortSignal) =>
    request(
      `/requirements/${encodeURIComponent(requirementId)}`,
      requirementSchema,
      { signal },
    ),
  getRequirementByVisibleKey: (visibleKey: string, signal?: AbortSignal) =>
    request(
      `/requirements/key/${encodeURIComponent(visibleKey)}`,
      requirementSchema,
      { signal },
    ),
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: 15_000,
    },
  },
})

function AppInner() {
  const projectsQuery = useQuery({
    queryKey: projectKeys.all,
    queryFn: ({ signal }) => api.listProjects(signal),
  })
  const [activeProjectId, setActiveProjectId] = useState<string | null>(() => {
    const routeMatch = /\/workspace\/projects\/([^/]+)/.exec(location.pathname)
    return routeMatch?.[1] ?? sessionStorage.getItem('activeProjectId')
  })
  const [activeModule, setActiveModule] = useState<WorkspaceModule>(() =>
    location.pathname.includes('/categories') ? 'categories' : 'requirements',
  )
  const [selectedRequirementId, setSelectedRequirementId] = useState<string | null>(
    null,
  )
  const [isNewProjectFormOpen, setIsNewProjectFormOpen] = useState(false)
  const [requirementTabIds, setRequirementTabIds] = useState<string[]>(() => {
    const rawTabIds = sessionStorage.getItem('requirementTabIds')
    const parsedTabIds = z.array(z.string()).safeParse(
      rawTabIds ? parseJsonSafely(rawTabIds) : [],
    )

    return parsedTabIds.success ? parsedTabIds.data : []
  })
  const [activeApplicationTab, setActiveApplicationTab] = useState('workspace')
  const projects = projectsQuery.data ?? []
  const activeProject = projects.find((project) => project.id === activeProjectId)

  useEffect(() => {
    if (
      projectsQuery.isSuccess &&
      projects.length > 0 &&
      (!activeProjectId || !projects.some((project) => project.id === activeProjectId))
    ) {
      setActiveProjectId(projects[0].id)
    }
  }, [activeProjectId, projects, projectsQuery.isSuccess])

  useEffect(() => {
    if (!activeProjectId) {
      return
    }

    sessionStorage.setItem('activeProjectId', activeProjectId)
    history.replaceState(
      null,
      '',
      `/workspace/projects/${activeProjectId}/${activeModule}`,
    )
  }, [activeModule, activeProjectId])

  useEffect(() => {
    sessionStorage.setItem('requirementTabIds', JSON.stringify(requirementTabIds))
  }, [requirementTabIds])

  const openRequirementTab = (requirementId: string) => {
    setRequirementTabIds((currentTabIds) =>
      currentTabIds.includes(requirementId)
        ? currentTabIds
        : [...currentTabIds, requirementId],
    )
    setActiveApplicationTab(requirementId)
  }

  const closeRequirementTab = (requirementId: string) => {
    setRequirementTabIds((currentTabIds) =>
      currentTabIds.filter((tabId) => tabId !== requirementId),
    )

    if (activeApplicationTab === requirementId) {
      setActiveApplicationTab('workspace')
    }
  }

  if (projectsQuery.isLoading) {
    return (
      <div className="startup" role="status" aria-live="polite">
        Loading project workspace…
      </div>
    )
  }

  return (
    <div className="app-shell">
      <ApplicationTabBar
        activeTabId={activeApplicationTab}
        closeRequirementTab={closeRequirementTab}
        requirementTabIds={requirementTabIds}
        setActiveTabId={setActiveApplicationTab}
      />

      {activeApplicationTab === 'workspace' ? (
        <main className="workspace">
          <ProjectSidebar
            activeProjectId={activeProjectId}
            onNewProject={() => setIsNewProjectFormOpen(true)}
            onSelectProject={(projectId) => {
              setActiveProjectId(projectId)
              setSelectedRequirementId(null)
            }}
            projects={projects}
          />

          <section className="content">
            {projectsQuery.isError ? (
              <ErrorBox
                error={projectsQuery.error}
                onRetry={() => void projectsQuery.refetch()}
              />
            ) : (
              <>
                {isNewProjectFormOpen ? (
                  <NewProjectForm
                    onCreated={(projectId) => {
                      setActiveProjectId(projectId)
                      setActiveModule('requirements')
                      setIsNewProjectFormOpen(false)
                    }}
                  />
                ) : null}

                <ModuleNavigation
                  activeModule={activeModule}
                  setActiveModule={setActiveModule}
                />

                {!activeProject ? (
                  <EmptyProjectState
                    projects={projects}
                    selectProject={setActiveProjectId}
                  />
                ) : activeModule === 'requirements' ? (
                  <RequirementsModule
                    openRequirementTab={openRequirementTab}
                    project={activeProject}
                    selectedRequirementId={selectedRequirementId}
                    setSelectedRequirementId={setSelectedRequirementId}
                  />
                ) : (
                  <CategoriesModule />
                )}
              </>
            )}
          </section>
        </main>
      ) : (
        <RequirementTab requirementId={activeApplicationTab} />
      )}
    </div>
  )
}

function ApplicationTabBar({
  activeTabId,
  closeRequirementTab,
  requirementTabIds,
  setActiveTabId,
}: {
  activeTabId: string
  closeRequirementTab: (requirementId: string) => void
  requirementTabIds: string[]
  setActiveTabId: (tabId: string) => void
}) {
  return (
    <div className="tabs" role="tablist" aria-label="Application tabs">
      <button
        aria-selected={activeTabId === 'workspace'}
        onClick={() => setActiveTabId('workspace')}
        role="tab"
        type="button"
      >
        Workspace
      </button>
      {requirementTabIds.map((requirementId) => (
        <RequirementTabButton
          active={activeTabId === requirementId}
          closeRequirementTab={closeRequirementTab}
          key={requirementId}
          requirementId={requirementId}
          setActiveTabId={setActiveTabId}
        />
      ))}
    </div>
  )
}

function RequirementTabButton({
  active,
  closeRequirementTab,
  requirementId,
  setActiveTabId,
}: {
  active: boolean
  closeRequirementTab: (requirementId: string) => void
  requirementId: string
  setActiveTabId: (tabId: string) => void
}) {
  const requirementQuery = useQuery({
    queryKey: requirementKeys.detail(requirementId),
    queryFn: ({ signal }) => api.getRequirement(requirementId, signal),
  })

  return (
    <span className="tab">
      <button
        aria-selected={active}
        onClick={() => setActiveTabId(requirementId)}
        role="tab"
        type="button"
      >
        {requirementQuery.data?.visibleKey ?? 'Requirement…'}
      </button>
      <button
        aria-label="Close requirement tab"
        onClick={() => closeRequirementTab(requirementId)}
        type="button"
      >
        ×
      </button>
    </span>
  )
}

function ProjectSidebar({
  activeProjectId,
  onNewProject,
  onSelectProject,
  projects,
}: {
  activeProjectId: string | null
  onNewProject: () => void
  onSelectProject: (projectId: string) => void
  projects: Project[]
}) {
  return (
    <aside className="sidebar" aria-label="Projects">
      <h2>Projects</h2>
      <button className="new-link" onClick={onNewProject} type="button">
        New Project
      </button>
      {projects.map((project) => (
        <button
          className={`project ${project.id === activeProjectId ? 'active' : ''}`}
          key={project.id}
          onClick={() => onSelectProject(project.id)}
          type="button"
        >
          <i className="pi pi-folder" aria-hidden="true" />
          <span title={project.name}>{project.name}</span>
          <strong>{project.requirementCount}</strong>
        </button>
      ))}
    </aside>
  )
}

function ModuleNavigation({
  activeModule,
  setActiveModule,
}: {
  activeModule: WorkspaceModule
  setActiveModule: (module: WorkspaceModule) => void
}) {
  return (
    <nav className="modules" aria-label="Workspace modules">
      <button
        className={activeModule === 'requirements' ? 'active' : ''}
        onClick={() => setActiveModule('requirements')}
        type="button"
      >
        Requirements
      </button>
      <button
        className={activeModule === 'categories' ? 'active' : ''}
        onClick={() => setActiveModule('categories')}
        type="button"
      >
        Categories
      </button>
    </nav>
  )
}

function RequirementsModule({
  openRequirementTab,
  project,
  selectedRequirementId,
  setSelectedRequirementId,
}: {
  openRequirementTab: (requirementId: string) => void
  project: Project
  selectedRequirementId: string | null
  setSelectedRequirementId: (requirementId: string | null) => void
}) {
  const requirementsQuery = useQuery({
    queryKey: requirementKeys.list(project.id),
    queryFn: ({ signal }) => api.listRequirements(project.id, signal),
  })

  useEffect(() => {
    setSelectedRequirementId(null)
  }, [project.id, setSelectedRequirementId])

  return (
    <>
      <RequirementActionBar
        openRequirementTab={openRequirementTab}
        projectId={project.id}
        selectedRequirementId={selectedRequirementId}
        setSelectedRequirementId={setSelectedRequirementId}
      />
      <div className="split">
        <section className="pane">
          <h1>{project.name} requirements</h1>
          {requirementsQuery.isLoading ? (
            <Status text="Loading requirements…" />
          ) : requirementsQuery.isError ? (
            <ErrorBox
              error={requirementsQuery.error}
              onRetry={() => void requirementsQuery.refetch()}
            />
          ) : requirementsQuery.data.length === 0 ? (
            <p>No requirements exist for this project.</p>
          ) : (
            <RequirementTable
              openRequirementTab={openRequirementTab}
              requirements={requirementsQuery.data}
              selectedRequirementId={selectedRequirementId}
              setSelectedRequirementId={setSelectedRequirementId}
            />
          )}
        </section>
        <section className="pane detail">
          <RequirementDetail
            projectId={project.id}
            requirementId={selectedRequirementId}
          />
        </section>
      </div>
    </>
  )
}

function RequirementTable({
  openRequirementTab,
  requirements,
  selectedRequirementId,
  setSelectedRequirementId,
}: {
  openRequirementTab: (requirementId: string) => void
  requirements: Requirement[]
  selectedRequirementId: string | null
  setSelectedRequirementId: (requirementId: string) => void
}) {
  return (
    <table>
      <thead>
        <tr>
          <th>Key</th>
          <th>Category</th>
          <th>Type</th>
          <th>Status</th>
          <th>Priority</th>
          <th>Owner</th>
        </tr>
      </thead>
      <tbody>
        {requirements.map((requirement) => (
          <tr
            aria-selected={selectedRequirementId === requirement.id}
            className={selectedRequirementId === requirement.id ? 'selected' : ''}
            key={requirement.id}
            onClick={() => setSelectedRequirementId(requirement.id)}
            onDoubleClick={() => openRequirementTab(requirement.id)}
          >
            <td>{requirement.visibleKey}</td>
            <td>{requirement.categoryKey ?? requirement.categoryName ?? '—'}</td>
            <td>{requirement.type ?? '—'}</td>
            <td>{requirement.status ?? '—'}</td>
            <td>{requirement.priority ?? '—'}</td>
            <td>{requirement.owner ?? 'Unassigned'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function RequirementActionBar({
  openRequirementTab,
  projectId,
  selectedRequirementId,
  setSelectedRequirementId,
}: {
  openRequirementTab: (requirementId: string) => void
  projectId: string
  selectedRequirementId: string | null
  setSelectedRequirementId: (requirementId: string) => void
}) {
  const [lookupKey, setLookupKey] = useState('')
  const [lookupResult, setLookupResult] = useState<string | null>(null)
  const lookupMutation = useMutation({
    mutationFn: (visibleKey: string) =>
      api.getRequirementByVisibleKey(normalizeVisibleKey(visibleKey)),
    onSuccess: (requirement) => {
      if (requirement.projectId !== projectId) {
        setLookupResult(
          `Found ${requirement.visibleKey} in another project: ${requirement.projectId}. Switch projects explicitly to open it.`,
        )
        return
      }

      setLookupResult(`Found ${requirement.visibleKey}.`)
      setSelectedRequirementId(requirement.id)
    },
    onError: (error) => {
      const apiError = error as ApiError
      setLookupResult(
        apiError.kind === 'notFound'
          ? 'No requirement exists for that exact key.'
          : apiError.message,
      )
    },
  })

  return (
    <div className="actions">
      <form
        onSubmit={(event) => {
          event.preventDefault()
          lookupMutation.mutate(lookupKey)
        }}
      >
        <label>
          Exact key
          <input
            onChange={(event) => setLookupKey(event.target.value)}
            pattern="[A-Za-z0-9_-]+"
            value={lookupKey}
          />
        </label>
        <button disabled={lookupMutation.isPending} type="submit">
          Lookup
        </button>
      </form>

      {lookupResult ? <p role="status">{lookupResult}</p> : null}

      <button
        disabled
        title="Requirement creation is not implemented in this package"
        type="button"
      >
        New requirement
      </button>

      {selectedRequirementId ? (
        <>
          <button onClick={() => openRequirementTab(selectedRequirementId)} type="button">
            Open in tab
          </button>
          <button
            onClick={() => void navigator.clipboard.writeText(selectedRequirementId)}
            type="button"
          >
            Copy visible key
          </button>
        </>
      ) : null}
    </div>
  )
}

function RequirementDetail({
  projectId,
  requirementId,
}: {
  projectId?: string
  requirementId: string | null
}) {
  const queryKey = requirementId
    ? requirementKeys.detail(requirementId)
    : ['requirements', 'detail', 'none']
  const requirementQuery = useQuery({
    enabled: Boolean(requirementId),
    queryKey,
    queryFn: ({ signal }) => api.getRequirement(requirementId ?? '', signal),
  })

  if (!requirementId) {
    return <p>Select a requirement to view details.</p>
  }

  if (requirementQuery.isLoading) {
    return <Status text="Loading requirement detail…" />
  }

  if (requirementQuery.isError) {
    return (
      <ErrorBox
        error={requirementQuery.error}
        onRetry={() => void requirementQuery.refetch()}
      />
    )
  }

  const requirement = requirementQuery.data

  if (projectId && requirement.projectId !== projectId) {
    return (
      <ErrorBox
        error={
          new ApiError('unexpected', 'Requirement belongs to a different project.')
        }
      />
    )
  }

  return <RequirementDetailFields requirement={requirement} />
}

function RequirementDetailFields({ requirement }: { requirement: Requirement }) {
  const fields = useMemo(
    () => ({
      Status: requirement.status,
      Category: requirement.categoryKey ?? requirement.categoryName,
      Type: requirement.type,
      Priority: requirement.priority,
      Owner: requirement.owner,
      Description: requirement.description,
      Rationale: requirement.rationale,
      Source: requirement.source,
      Project: requirement.projectId,
      Created: requirement.createdAt,
      Updated: requirement.updatedAt,
    }),
    [requirement],
  )

  return (
    <article>
      <h2>{requirement.visibleKey}</h2>
      <dl>
        {Object.entries(fields).map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value ?? 'Not provided'}</dd>
          </div>
        ))}
      </dl>
    </article>
  )
}

function RequirementTab({ requirementId }: { requirementId: string }) {
  return (
    <main className="content solo">
      <div className="actions">
        <button
          onClick={() => void navigator.clipboard.writeText(requirementId)}
          type="button"
        >
          Copy visible key
        </button>
      </div>
      <RequirementDetail requirementId={requirementId} />
    </main>
  )
}

function CategoriesModule() {
  const queryClient = useQueryClient()
  const categoriesQuery = useQuery({
    queryKey: categoryKeys.all,
    queryFn: ({ signal }) => api.listCategories(signal),
  })
  const [form, setForm] = useState({
    key: '',
    name: '',
    type: 'FR' as CategoryType,
  })
  const createCategoryMutation = useMutation({
    mutationFn: () => api.createCategory(form),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: categoryKeys.all })
      setForm({ key: '', name: '', type: 'FR' })
    },
  })

  return (
    <section>
      <h1>Categories</h1>
      <form
        className="card"
        onSubmit={(event) => {
          event.preventDefault()
          createCategoryMutation.mutate()
        }}
      >
        <input
          aria-label="Category key"
          onChange={(event) => setForm({ ...form, key: event.target.value })}
          placeholder="KEY"
          value={form.key}
        />
        <input
          aria-label="Category name"
          onChange={(event) => setForm({ ...form, name: event.target.value })}
          placeholder="Name"
          value={form.name}
        />
        <select
          aria-label="Category type"
          onChange={(event) =>
            setForm({ ...form, type: event.target.value as CategoryType })
          }
          value={form.type}
        >
          <option>FR</option>
          <option>NFR</option>
        </select>
        <button disabled={createCategoryMutation.isPending} type="submit">
          New category
        </button>
        {createCategoryMutation.isError ? (
          <ErrorBox error={createCategoryMutation.error} />
        ) : null}
      </form>

      {categoriesQuery.isLoading ? (
        <Status text="Loading categories…" />
      ) : categoriesQuery.isError ? (
        <ErrorBox
          error={categoriesQuery.error}
          onRetry={() => void categoriesQuery.refetch()}
        />
      ) : (
        <CategoryTable categories={categoriesQuery.data} />
      )}
    </section>
  )
}

function CategoryTable({ categories }: { categories: Category[] }) {
  return (
    <table>
      <thead>
        <tr>
          <th>Key</th>
          <th>Name</th>
          <th>Type</th>
        </tr>
      </thead>
      <tbody>
        {categories.map((category) => (
          <tr key={category.id}>
            <td>{category.key}</td>
            <td>{category.name}</td>
            <td>{category.type}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function EmptyProjectState({
  projects,
  selectProject,
}: {
  projects: Project[]
  selectProject: (projectId: string) => void
}) {
  return (
    <div className="empty">
      <h1>{projects.length > 0 ? 'Project not found' : 'No projects yet'}</h1>
      {projects[0] ? (
        <button onClick={() => selectProject(projects[0].id)} type="button">
          Select {projects[0].name}
        </button>
      ) : null}
      <NewProjectForm onCreated={selectProject} />
    </div>
  )
}

function NewProjectForm({ onCreated }: { onCreated: (projectId: string) => void }) {
  const queryClient = useQueryClient()
  const [name, setName] = useState('')
  const createProjectMutation = useMutation({
    mutationFn: () => api.createProject(name),
    onSuccess: (project) => {
      void queryClient.invalidateQueries({ queryKey: projectKeys.all })
      sessionStorage.setItem('activeProjectId', project.id)
      onCreated(project.id)
    },
  })
  const fieldErrors =
    createProjectMutation.error instanceof ApiError
      ? createProjectMutation.error.fieldErrors
      : {}

  return (
    <form
      className="card"
      onSubmit={(event) => {
        event.preventDefault()
        createProjectMutation.mutate()
      }}
    >
      <label>
        Project name
        <input
          aria-invalid={Boolean(fieldErrors.name)}
          aria-describedby={fieldErrors.name ? 'project-name-error' : undefined}
          onChange={(event) => setName(event.target.value)}
          value={name}
        />
      </label>
      {fieldErrors.name ? (
        <span id="project-name-error" role="alert">
          {fieldErrors.name}
        </span>
      ) : null}
      <button disabled={createProjectMutation.isPending} type="submit">
        Create project
      </button>
      {createProjectMutation.isError ? (
        <ErrorBox error={createProjectMutation.error} />
      ) : null}
    </form>
  )
}

function ErrorBox({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  const apiError = error instanceof ApiError
    ? error
    : new ApiError('unexpected', 'An unexpected error occurred.')

  return (
    <div className={`error ${apiError.kind}`} role="alert">
      <strong>
        {apiError.kind === 'accessDenied' ? 'Access denied' : 'Something went wrong'}
      </strong>
      <p>{apiError.message}</p>
      {onRetry ? (
        <button onClick={onRetry} type="button">
          Retry
        </button>
      ) : null}
    </div>
  )
}

function Status({ text }: { text: string }) {
  return (
    <p role="status" aria-live="polite">
      {text}
    </p>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppInner />
    </QueryClientProvider>
  )
}
