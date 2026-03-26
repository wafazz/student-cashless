export interface User {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    role: 'admin' | 'parent' | 'operator' | 'cashier' | 'school';
    school_id: number | null;
    status: 'active' | 'inactive';
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface School {
    id: number;
    name: string;
    address: string | null;
    phone: string | null;
    logo: string | null;
    status: 'active' | 'inactive';
    subscription_fee: number;
    subscription_status: 'active' | 'inactive' | 'trial';
    subscription_start: string | null;
    subscription_end: string | null;
    created_at: string;
    updated_at: string;
    canteens?: Canteen[];
    classes?: SchoolClass[];
    students_count?: number;
}

export interface Student {
    id: number;
    parent_id: number;
    school_id: number;
    class_id: number | null;
    name: string;
    ic_number: string | null;
    class_name: string | null;
    school_class?: SchoolClass;
    wallet_uuid: string;
    wallet_balance: number;
    daily_limit_canteen: number | null;
    daily_limit_koperasi: number | null;
    daily_spent_canteen: number;
    daily_spent_koperasi: number;
    photo: string | null;
    status: 'active' | 'inactive';
    created_at: string;
    updated_at: string;
    school?: School;
    parent?: User;
    transactions?: Transaction[];
}

export interface Canteen {
    id: number;
    school_id: number;
    operator_id: number;
    name: string;
    type: 'canteen' | 'koperasi';
    status: 'active' | 'inactive';
    contract_fee: number;
    contract_status: 'active' | 'expired' | 'terminated';
    contract_start: string | null;
    contract_end: string | null;
    contract_notes: string | null;
    created_at: string;
    updated_at: string;
    school?: School;
    operator?: User;
    menu_items?: MenuItem[];
}

export interface MenuItem {
    id: number;
    canteen_id: number;
    name: string;
    price: number;
    category: string | null;
    is_available: boolean;
    created_at: string;
    updated_at: string;
}

export interface Transaction {
    id: number;
    student_id: number;
    canteen_id: number | null;
    operator_id: number | null;
    type: 'topup' | 'purchase' | 'refund';
    amount: number;
    balance_before: number;
    balance_after: number;
    description: string | null;
    reference_id: string | null;
    created_at: string;
    student?: Student;
    canteen?: Canteen;
    operator?: User;
}

export interface Topup {
    id: number;
    parent_id: number;
    student_id: number;
    amount: number;
    service_fee: number;
    payment_method: 'fpx' | 'manual';
    gateway: string | null;
    gateway_ref: string | null;
    status: 'pending' | 'success' | 'failed';
    created_at: string;
    updated_at: string;
    student?: Student;
}

export interface Invoice {
    id: number;
    school_id: number;
    invoice_number: string;
    amount: number;
    period_start: string;
    period_end: string;
    due_date: string;
    status: 'unpaid' | 'paid' | 'overdue';
    paid_at: string | null;
    notes: string | null;
    created_at: string;
    school?: School;
}

export interface SchoolRegistration {
    id: number;
    school_name: string;
    address: string | null;
    school_phone: string | null;
    contact_name: string;
    contact_email: string;
    contact_phone: string | null;
    estimated_students: number | null;
    notes: string | null;
    status: 'pending' | 'approved' | 'rejected';
    admin_notes: string | null;
    created_at: string;
}

export interface SchoolClass {
    id: number;
    school_id: number;
    name: string;
    level: string | null;
    status: 'active' | 'inactive';
    created_at: string;
    updated_at: string;
    students_count?: number;
}

export interface SchoolFee {
    id: number;
    school_id: number;
    class_id: number | null;
    name: string;
    amount: number;
    academic_year: string;
    due_date: string;
    description: string | null;
    status: 'active' | 'inactive';
    created_at: string;
    updated_at: string;
    school_class?: SchoolClass;
    paid_count?: number;
    unpaid_count?: number;
}

export interface SchoolFeeStudent {
    id: number;
    school_fee_id: number;
    student_id: number;
    school_id: number;
    amount_paid: number;
    status: 'unpaid' | 'paid';
    paid_at: string | null;
    payment_method: string | null;
    reference_id: string | null;
    created_at: string;
    fee?: SchoolFee;
    student?: Student;
}

export interface PibgFee {
    id: number;
    school_id: number;
    name: string;
    amount: number;
    academic_year: string;
    due_date: string;
    description: string | null;
    status: 'active' | 'inactive';
    created_at: string;
    updated_at: string;
    school?: School;
    paid_count?: number;
    unpaid_count?: number;
    parents_count?: number;
}

export interface PibgFeeParent {
    id: number;
    pibg_fee_id: number;
    parent_id: number;
    school_id: number;
    amount_paid: number;
    status: 'unpaid' | 'paid';
    paid_at: string | null;
    payment_method: string | null;
    reference_id: string | null;
    created_at: string;
    fee?: PibgFee;
    parent?: User;
    school?: School;
}

export interface PageProps {
    auth: {
        user: User | null;
    };
    flash: {
        success: string | null;
        error: string | null;
    };
    unreadNotifications: number;
    pibgOutstanding: number;
}
