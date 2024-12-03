export interface ApiResponse<T> {
  message: string;
  data: T;
}

export interface Translation {
  key_id: number;
  key: string;
  tag: string;
  english: string;
  status: 'Draft' | 'Published' | 'Archive';
  last_updated_by: string;
  last_updated_by_role: string;
  last_updated_at: string;
}

export interface Project {
  project_id: number;
  project_name: string;
  role_id: number;
  role_name: string;
}

export interface Language {
  language_code: string;
  language_name: string;
}

export interface GetAllKeysResponse {
  translations: Translation[];
  projects: Project[];
  project_id: string;
  languages: Language[];
  notification_count: number;
  notice_message: string;
  under_maintenance: boolean;
  profile_url: string;
  force_logout: boolean;
  new_feature: boolean;
  new_feature_message: string;
}
