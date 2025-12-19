// API Base URL - uses environment variable or defaults to localhost
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

// Helper function for API calls
async function apiCall<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_URL}${endpoint}`, {
        headers: {
            'Content-Type': 'application/json',
            ...options?.headers,
        },
        ...options,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Network error' }));
        throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
}

// ===== USER API =====

export async function fetchUsers() {
    return apiCall<any[]>('/api/users');
}

export async function fetchUserById(id: string) {
    return apiCall<any>(`/api/users/${id}`);
}

export async function createUser(userData: any) {
    return apiCall<any>('/api/users', {
        method: 'POST',
        body: JSON.stringify(userData),
    });
}

export async function updateUser(id: string, userData: any) {
    return apiCall<any>(`/api/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify(userData),
    });
}

export async function deleteUser(id: string) {
    return apiCall<any>(`/api/users/${id}`, {
        method: 'DELETE',
    });
}

// ===== COURSE API =====

export async function fetchCourses() {
    return apiCall<any[]>('/api/courses');
}

export async function fetchCourseById(id: string) {
    return apiCall<any>(`/api/courses/${id}`);
}

export async function createCourse(courseData: any) {
    return apiCall<any>('/api/courses', {
        method: 'POST',
        body: JSON.stringify(courseData),
    });
}

export async function updateCourse(id: string, courseData: any) {
    return apiCall<any>(`/api/courses/${id}`, {
        method: 'PUT',
        body: JSON.stringify(courseData),
    });
}

export async function deleteCourse(id: string) {
    return apiCall<any>(`/api/courses/${id}`, {
        method: 'DELETE',
    });
}

// ===== BADGE API =====

export async function fetchBadges() {
    return apiCall<any[]>('/api/badges');
}

export async function fetchBadgeById(id: string) {
    return apiCall<any>(`/api/badges/${id}`);
}

// ===== HEALTH CHECK =====

export async function checkHealth() {
    return apiCall<{ status: string; message: string }>('/api/health');
}
