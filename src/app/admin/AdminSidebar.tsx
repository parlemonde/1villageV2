'use client';

import React from 'react';

import styles from './AdminSidebar.module.css';
import { AdminNavigation } from './Navigation';

export const AdminSidebar = () => {
    return (
        <div>
            <div className={styles.sidebarTitle}>
                <strong>Portail Admin</strong>
            </div>

            <div className={styles.sidebar}>
                <AdminNavigation />
            </div>
        </div>
    );
};
