import { Project, ExtractedData, CalculationResult, ExteriorWallData } from './types';

const PROJECTS_KEY = 'jikkou_projects';
const EXTRACTED_KEY = 'jikkou_extracted';
const RESULTS_KEY = 'jikkou_results';
const WALL_KEY = 'jikkou_wall_data';

function getFromStorage<T>(key: string): T[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function setToStorage<T>(key: string, data: T[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(data));
}

// Projects
export function getProjects(): Project[] {
  return getFromStorage<Project>(PROJECTS_KEY);
}

export function getProject(id: string): Project | undefined {
  return getProjects().find(p => p.id === id);
}

export function saveProject(project: Project): void {
  const projects = getProjects();
  const index = projects.findIndex(p => p.id === project.id);
  if (index >= 0) {
    projects[index] = project;
  } else {
    projects.push(project);
  }
  setToStorage(PROJECTS_KEY, projects);
}

export function deleteProject(id: string): void {
  setToStorage(PROJECTS_KEY, getProjects().filter(p => p.id !== id));
  setToStorage(
    EXTRACTED_KEY,
    getFromStorage<ExtractedData>(EXTRACTED_KEY).filter(
      (e: ExtractedData) => e.projectId !== id
    )
  );
  setToStorage(
    RESULTS_KEY,
    getFromStorage<CalculationResult>(RESULTS_KEY).filter(
      (r: CalculationResult) => r.projectId !== id
    )
  );
}

// Extracted Data
export function getExtractedData(projectId: string): ExtractedData | undefined {
  return getFromStorage<ExtractedData>(EXTRACTED_KEY).find(
    (e: ExtractedData) => e.projectId === projectId
  );
}

export function saveExtractedData(data: ExtractedData): void {
  const all = getFromStorage<ExtractedData>(EXTRACTED_KEY);
  const index = all.findIndex((e: ExtractedData) => e.projectId === data.projectId);
  if (index >= 0) {
    all[index] = data;
  } else {
    all.push(data);
  }
  setToStorage(EXTRACTED_KEY, all);
}

// Calculation Results
export function getCalculationResult(projectId: string): CalculationResult | undefined {
  return getFromStorage<CalculationResult>(RESULTS_KEY).find(
    (r: CalculationResult) => r.projectId === projectId
  );
}

export function saveCalculationResult(result: CalculationResult): void {
  const all = getFromStorage<CalculationResult>(RESULTS_KEY);
  const index = all.findIndex((r: CalculationResult) => r.projectId === result.projectId);
  if (index >= 0) {
    all[index] = result;
  } else {
    all.push(result);
  }
  setToStorage(RESULTS_KEY, all);
}

// Exterior Wall Data
export function getExteriorWallData(projectId: string): ExteriorWallData | undefined {
  return getFromStorage<ExteriorWallData>(WALL_KEY).find(
    (w: ExteriorWallData) => w.projectId === projectId
  );
}

export function saveExteriorWallData(data: ExteriorWallData): void {
  const all = getFromStorage<ExteriorWallData>(WALL_KEY);
  const index = all.findIndex((w: ExteriorWallData) => w.projectId === data.projectId);
  if (index >= 0) {
    all[index] = data;
  } else {
    all.push(data);
  }
  setToStorage(WALL_KEY, all);
}
