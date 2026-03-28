const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

/**
 * Fetch with a default timeout of 10 seconds
 */
async function fetchWithTimeout(resource: RequestInfo | URL, options: any = {}) {
    const { timeout = 10000 } = options;
    
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
  
    try {
        const response = await fetch(resource, {
            ...options,
            signal: controller.signal  
        });
        clearTimeout(id);
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        
        return response;
    } catch (error) {
        clearTimeout(id);
        if (error instanceof Error && error.name === 'AbortError') {
            console.error('Request timed out:', resource);
        }
        throw error;
    }
}

// Helper to get auth header
const getAuthHeader = (): Record<string, string> => {
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
};

export interface Student {
    id: number;
    name: string;
    phone: string;
    service_name: string;
    price_per_hour: number;
    class_duration_min: number;
    classes_per_month: number;
    amount: number;
    payment_method: string;
    surcharge_percentage: number;
    deadline_day: number;
    due_day: number;
    status: 'paid' | 'pending';
    schedules?: ClassSchedule[];
    // Phase 4
    planType?: 'MONTHLY' | 'PACK' | 'PER_CLASS';
    credits?: number;
    sub_category?: string | null;
    billing_alias?: string | null;
}

export interface ClassSchedule {
    id: number;
    studentId: number;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
}

export interface Payment {
    id: number;
    studentId: number;
    amount: number;
    paidAt: string;
    month: number;
    year: number;
    student?: {
        id: number;
        name: string;
        service_name: string;
    };
}



export interface UnifiedSchedule extends ClassSchedule {
    student: {
        name: string;
        service_name: string;
    };
}

export interface Expense {
    id: number;
    description: string;
    amount: number;
    category: string;
    date: string;
    month: number;
    year: number;
}

export interface User {
    id: number;
    email: string;
    name: string;
    bizName?: string;
    bizAlias?: string;
    businessCategory?: string;
    phoneNumber?: string;
    taxId?: string;
    billingAddress?: string;
    reminderTemplate?: string;
    defaultPrice?: number;
    defaultService?: string;
    defaultSurcharge?: number;
    currency?: string;
    receiptFooter?: string;
    isPro: boolean;
    plan: string;
    subscriptionExpiry?: string | null;
    userServices?: UserService[];
    paymentAccounts?: BusinessPaymentAccount[];
    ratingToken?: string;
    ratingTokenExpires?: string;
    calendarToken?: string;
    mpAccessToken?: string;
    mpPublicKey?: string;
    notificationsEnabled?: boolean;
    isPublicProfileVisible?: boolean;
}


export interface Subscription {
    id: number;
    userId: number;
    plan: string;
    status: string;
    startDate: string;
    expiryDate: string | null;
    mercadoPagoOrderId?: string;
    updatedAt: string;
}

export interface ReceiptData {
    id: number;
    receiptNumber: string;
    studentName: string;
    studentPhone: string;
    amount: number;
    paidAt: string;
    month: number;
    year: number;
    service: string;
}

export interface BusinessPaymentAccount {
    id: number;
    name: string;
    alias: string;
    isDefault: boolean;
}

export interface UserService {
    id: number;
    name: string;
    defaultPrice: number;
}

export interface PaymentStats {
    year: number;
    stats: Array<{
        month: number;
        total: number;
        count: number;
    }>;
}

export interface Attendance {
    id: number;
    studentId: number;
    status: 'PRESENT' | 'ABSENT' | 'CANCELLED';
    date: string;
}

export interface StudentNote {
    id: number;
    studentId: number;
    content: string;
    createdAt: string;
}

export interface WeeklySchedule {
    day: number;
    dayName: string;
    classes: ClassSchedule[];
}

export const api = {
    // ============ STUDENTS ============

    // GET /api/students
    async getStudents(): Promise<Student[]> {
        const res = await fetchWithTimeout(`${API_URL}/students`, {
            headers: { ...getAuthHeader() }
        });
        return res.json();
    },

    // POST /api/students
    async createStudent(data: Omit<Student, 'id' | 'status'>): Promise<Student> {
        const res = await fetchWithTimeout(`${API_URL}/students`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
            body: JSON.stringify(data)
        });
        return res.json();
    },

    // PUT /api/students/:id
    async updateStudent(id: number, data: Partial<Student>): Promise<Student> {
        const res = await fetchWithTimeout(`${API_URL}/students/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
            body: JSON.stringify(data)
        });
        return res.json();
    },

    // PATCH /api/students/:id/toggle
    async togglePayment(id: number): Promise<{ message: string }> {
        const res = await fetchWithTimeout(`${API_URL}/students/${id}/toggle`, {
            method: 'PATCH',
            headers: { ...getAuthHeader() }
        });
        return res.json();
    },

    // DELETE /api/students/:id
    async deleteStudent(id: number): Promise<{ message: string }> {
        const res = await fetchWithTimeout(`${API_URL}/students/${id}`, {
            method: 'DELETE',
            headers: { ...getAuthHeader() }
        });
        return res.json();
    },

    // PUT /api/students/update-prices
    async updatePrices(data: { percentage: number; service: string }): Promise<{ message: string }> {
        const res = await fetchWithTimeout(`${API_URL}/students/update-prices`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
            body: JSON.stringify(data)
        });
        return res.json();
    },

    // ============ PAYMENTS ============

    // GET /api/payments
    async getPayments(filters?: { year?: number; month?: number; studentId?: number }): Promise<Payment[]> {
        const params = new URLSearchParams();
        if (filters?.year) params.append('year', filters.year.toString());
        if (filters?.month) params.append('month', filters.month.toString());
        if (filters?.studentId) params.append('studentId', filters.studentId.toString());

        const res = await fetchWithTimeout(`${API_URL}/payments?${params}`, {
            headers: { ...getAuthHeader() }
        });
        return res.json();
    },

    // GET /api/payments/stats
    async getPaymentStats(year?: number): Promise<PaymentStats> {
        const params = year ? `?year=${year}` : '';
        const res = await fetchWithTimeout(`${API_URL}/payments/stats${params}`, {
            headers: { ...getAuthHeader() }
        });
        return res.json();
    },

    // POST /api/payments
    async createPayment(data: { studentId: number; amount: number; month: number; year: number }): Promise<Payment> {
        const res = await fetchWithTimeout(`${API_URL}/payments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
            body: JSON.stringify(data)
        });
        return res.json();
    },

    // DELETE /api/payments/:id
    async deletePayment(id: number): Promise<{ message: string }> {
        const res = await fetchWithTimeout(`${API_URL}/payments/${id}`, {
            method: 'DELETE',
            headers: { ...getAuthHeader() }
        });
        return res.json();
    },

    // ============ NOTES ============

    // GET /api/notes/student/:studentId
    async getNotes(studentId: number): Promise<StudentNote[]> {
        const res = await fetchWithTimeout(`${API_URL}/notes/student/${studentId}`, {
            headers: { ...getAuthHeader() }
        });
        return res.json();
    },

    // POST /api/notes
    async createNote(data: { studentId: number; content: string }): Promise<StudentNote> {
        const res = await fetchWithTimeout(`${API_URL}/notes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
            body: JSON.stringify(data)
        });
        return res.json();
    },

    // DELETE /api/notes/:id
    async deleteNote(id: number): Promise<{ message: string }> {
        const res = await fetchWithTimeout(`${API_URL}/notes/${id}`, {
            method: 'DELETE',
            headers: { ...getAuthHeader() }
        });
        return res.json();
    },

    // ============ CALENDAR ============

    // GET /api/calendar
    async getSchedules(): Promise<ClassSchedule[]> {
        const res = await fetchWithTimeout(`${API_URL}/calendar`, {
            headers: { ...getAuthHeader() }
        });
        return res.json();
    },

    // GET /api/calendar/weekly
    async getWeeklySchedule(): Promise<WeeklySchedule[]> {
        const res = await fetchWithTimeout(`${API_URL}/calendar/weekly`, {
            headers: { ...getAuthHeader() }
        });
        return res.json();
    },

    // GET /api/calendar/student/:studentId
    async getStudentSchedules(studentId: number): Promise<ClassSchedule[]> {
        const res = await fetchWithTimeout(`${API_URL}/calendar/student/${studentId}`, {
            headers: { ...getAuthHeader() }
        });
        return res.json();
    },

    // POST /api/calendar
    async createSchedule(data: { studentId: number; dayOfWeek: number; startTime: string; endTime: string }): Promise<ClassSchedule> {
        const res = await fetchWithTimeout(`${API_URL}/calendar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
            body: JSON.stringify(data)
        });
        return res.json();
    },

    // DELETE /api/calendar/:id
    async deleteSchedule(id: number): Promise<{ message: string }> {
        const res = await fetchWithTimeout(`${API_URL}/calendar/${id}`, {
            method: 'DELETE',
            headers: { ...getAuthHeader() }
        });
        return res.json();
    },

    // ============ SPECIAL ACTIONS ============

    // POST /api/students/reset-month
    async resetMonth(): Promise<{ message: string; count: number }> {
        const res = await fetchWithTimeout(`${API_URL}/students/reset-month`, {
            method: 'POST',
            headers: { ...getAuthHeader() }
        });
        return res.json();
    },

    // GET /api/students/pending-contacts
    async getPendingContacts(): Promise<Partial<Student>[]> {
        const res = await fetchWithTimeout(`${API_URL}/students/pending-contacts`, {
            headers: { ...getAuthHeader() }
        });
        return res.json();
    },

    // GET /api/calendar
    async getAllSchedules(): Promise<UnifiedSchedule[]> {
        const res = await fetchWithTimeout(`${API_URL}/calendar`, {
            headers: { ...getAuthHeader() }
        });
        return res.json();
    },

    // ============ EXPENSES ============

    // GET /api/expenses/current
    async getCurrentExpenses(): Promise<Expense[]> {
        const res = await fetchWithTimeout(`${API_URL}/expenses/current`, {
            headers: { ...getAuthHeader() }
        });
        return res.json();
    },

    // POST /api/expenses
    async createExpense(data: { description: string; amount: number; category: string; date?: string }): Promise<Expense> {
        const res = await fetchWithTimeout(`${API_URL}/expenses`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
            body: JSON.stringify(data)
        });
        return res.json();
    },

    // DELETE /api/expenses/:id
    async deleteExpense(id: number): Promise<{ message: string }> {
        const res = await fetchWithTimeout(`${API_URL}/expenses/${id}`, {
            method: 'DELETE',
            headers: { ...getAuthHeader() }
        });
        return res.json();
    },

    // ============ AUTH / PROFILE ============

    // GET /api/auth/me
    async getProfile(): Promise<User> {
        const res = await fetchWithTimeout(`${API_URL}/auth/me`, {
            headers: { ...getAuthHeader() }
        });
        return res.json();
    },

    // PUT /api/auth/profile
    async updateProfile(data: Partial<User>): Promise<User> {
        const res = await fetchWithTimeout(`${API_URL}/auth/profile`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
            body: JSON.stringify(data)
        });
        return res.json();
    },

    // POST /api/auth/change-password
    async changePassword(data: { currentPassword: string; newPassword: string }): Promise<{ message: string }> {
        const res = await fetchWithTimeout(`${API_URL}/auth/change-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
            body: JSON.stringify(data)
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || 'Error al cambiar contraseña');
        }
        return res.json();
    },

    // POST /api/auth/forgot-password
    async forgotPassword(email: string): Promise<{ message: string }> {
        const res = await fetchWithTimeout(`${API_URL}/auth/forgot-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        return res.json();
    },

    // POST /api/auth/reset-password
    async resetPassword(data: { token: string; password: string }): Promise<{ message: string }> {
        const res = await fetchWithTimeout(`${API_URL}/auth/reset-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return res.json();
    },

    // ============ ATTENDANCE ============

    async markAttendance(data: { studentId: number; status: string; date?: string }): Promise<Attendance> {
        const res = await fetchWithTimeout(`${API_URL}/attendance`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
            body: JSON.stringify(data)
        });
        return res.json();
    },

    // GET /api/attendance/student/:id
    async getAttendanceHistory(studentId: number): Promise<Attendance[]> {
        const res = await fetchWithTimeout(`${API_URL}/attendance/student/${studentId}`, {
            headers: { ...getAuthHeader() }
        });
        return res.json();
    },

    // ============ RATINGS ============

    async generateRatingLink(): Promise<{ token: string, expires: string, link: string }> {
        const res = await fetchWithTimeout(`${API_URL}/ratings/generate-link`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        return res.json();
    },

    async toggleRatingComment(id: number): Promise<{ message: string }> {
        const res = await fetchWithTimeout(`${API_URL}/ratings/${id}/toggle-comment`, {
            method: 'PATCH',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        return res.json();
    },

    async getMyRatings(): Promise<any[]> { // Adjust Promise type as needed
        const res = await fetchWithTimeout(`${API_URL}/ratings/me`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        return res.json();
    },

    async getPublicTeacher(token: string): Promise<any> { // Adjust Promise type as needed
        const res = await fetchWithTimeout(`${API_URL}/ratings/public/teacher/${token}`);
        return res.json();
    },

    async submitRating(token: string, data: { value: number, comment: string, studentName?: string }): Promise<{ message: string }> {
        const res = await fetchWithTimeout(`${API_URL}/ratings/public/submit/${token}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return res.json();
    },

    // ============ SERVICES ============

    async getServices(): Promise<UserService[]> {
        const res = await fetchWithTimeout(`${API_URL}/services`, {
            headers: { ...getAuthHeader() }
        });
        return res.json();
    },

    async createService(data: { name: string; defaultPrice: number }): Promise<UserService> {
        const res = await fetchWithTimeout(`${API_URL}/services`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
            body: JSON.stringify(data)
        });
        return res.json();
    },

    async updateService(id: number, data: { name?: string; defaultPrice?: number; updateStudents?: boolean }): Promise<UserService> {
        const res = await fetchWithTimeout(`${API_URL}/services/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
            body: JSON.stringify(data)
        });
        return res.json();
    },

    async deleteService(id: number): Promise<{ success: boolean }> {
        const res = await fetchWithTimeout(`${API_URL}/services/${id}`, {
            method: 'DELETE',
            headers: { ...getAuthHeader() }
        });
        return res.json();
    },

    // ============ PAYMENT ACCOUNTS ============

    async getPaymentAccounts(): Promise<BusinessPaymentAccount[]> {
        const res = await fetchWithTimeout(`${API_URL}/payment-accounts`, {
            headers: { ...getAuthHeader() }
        });
        return res.json();
    },

    async createPaymentAccount(data: { name: string; alias: string; isDefault?: boolean }): Promise<BusinessPaymentAccount> {
        const res = await fetchWithTimeout(`${API_URL}/payment-accounts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
            body: JSON.stringify(data)
        });
        return res.json();
    },

    async updatePaymentAccount(id: number, data: Partial<BusinessPaymentAccount>): Promise<BusinessPaymentAccount> {
        const res = await fetchWithTimeout(`${API_URL}/payment-accounts/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
            body: JSON.stringify(data)
        });
        return res.json();
    },

    async deletePaymentAccount(id: number): Promise<{ message: string }> {
        const res = await fetchWithTimeout(`${API_URL}/payment-accounts/${id}`, {
            method: 'DELETE',
            headers: { ...getAuthHeader() }
        });
        return res.json();
    },

    // ============ SUBSCRIPTIONS ============
    
    async getSubscriptionHistory(): Promise<Subscription[]> {
        const res = await fetchWithTimeout(`${API_URL}/subscription/current`, {
            headers: { ...getAuthHeader() }
        });
        const data = await res.json();
        // Return as array if backend only returns current, or adjust once history endpoint is ready
        return data.subscription ? [data.subscription] : [];
    },

    async cancelSubscription(): Promise<{ message: string }> {
        const res = await fetchWithTimeout(`${API_URL}/subscription/cancel`, {
            method: 'POST',
            headers: { ...getAuthHeader() }
        });
        return res.json();
    },

    async createCheckoutSession(planId: string): Promise<{ checkoutUrl: string; sandboxCheckoutUrl: string; preferenceId: string }> {
        const res = await fetchWithTimeout(`${API_URL}/subscription/checkout`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
            body: JSON.stringify({ planId })
        });
        return res.json();
    },

    // ============ RECEIPTS ============

    async getReceipts(): Promise<ReceiptData[]> {
        const res = await fetchWithTimeout(`${API_URL}/receipts`, {
            headers: { ...getAuthHeader() }
        });
        return res.json();
    },

    async downloadReceiptPDF(id: number): Promise<void> {
        const res = await fetchWithTimeout(`${API_URL}/receipts/${id}`, {
            headers: { ...getAuthHeader() }
        });
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `recibo-${id}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    },

    async sendReceiptWhatsApp(id: number): Promise<any> {
        const res = await fetchWithTimeout(`${API_URL}/receipts/${id}/send-whatsapp`, {
            method: 'POST',
            headers: { ...getAuthHeader() }
        });
        return res.json();
    },

    // ============ TOP TEACHERS ============
    async getTopTeachers(): Promise<any[]> {
        const res = await fetchWithTimeout(`${API_URL}/ratings/top-teachers`);
        return res.json();
    },

    // ============ STUDENT PAYMENTS ============
    async createStudentPaymentLink(data: { studentId: number, amount: number, title?: string }): Promise<{ checkoutUrl: string }> {
        const res = await fetchWithTimeout(`${API_URL}/payments/create-link`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
            body: JSON.stringify(data)
        });
        return res.json();
    },

    // ============ SUPPORT ============
    async sendSupportMessage(data: { name: string, email: string, subject: string, message: string }): Promise<{ status: string, message: string }> {
        const res = await fetchWithTimeout(`${API_URL}/support`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return res.json();
    }
};



