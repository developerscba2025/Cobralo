import React from 'react';
import ProfileTab from './ProfileTab';
import SecurityTab from './SecurityTab';
import AcademyTab from './AcademyTab';
import ServicesTab from './ServicesTab';
import AutomationTab from './AutomationTab';
import RatingsTab from './RatingsTab';
import SubscriptionTab from './SubscriptionTab';
import SupportTab from './SupportTab';
import LegalTab from './LegalTab';
import PaymentAccountsTab from './PaymentAccountsTab';
import type { User } from '../../services/api';

interface SettingsContentProps {
    activeTab: string;
    user: Partial<User>;
    setUser: (u: Partial<User>) => void;
    handleSave: () => void;
    saving: boolean;
    tab: any;
    passwordData: any;
    setPasswordData: (d: any) => void;
    handleChangePassword: (e: React.FormEvent) => void;
    changingPassword: boolean;
    showCurrentPassword: boolean;
    setShowCurrentPassword: (v: boolean) => void;
    showNewPassword: boolean;
    setShowNewPassword: (v: boolean) => void;
    showConfirmPassword: boolean;
    setShowConfirmPassword: (v: boolean) => void;
    userServices: any[];
    newService: any;
    setNewService: (s: any) => void;
    handleAddService: () => void;
    handleDeleteService: (id: number) => void;
    isPro: boolean;
    pendingAdjustment: any;
    setActiveTab: (tab: any) => void;
    studentCount: number;
    scheduleCount: number;
    hasRecentPayments: boolean;
    subscriptionPlans: any[];
    priceLastUpdate: string | null;
    loadingCheckout: string | null;
    handleUpgrade: (planId: string) => void;
    handleGenerateLink: () => void;
    handleToggleRatingVisibility: (id: number) => void;
    ratings: any[];
    ratingToken: string | null;
    ratingExpires: string | null;
}

const SettingsContent: React.FC<SettingsContentProps> = (props) => {
    const { activeTab } = props;

    switch (activeTab) {
        case 'profile':
            return <ProfileTab user={props.user} setUser={props.setUser} handleSave={props.handleSave} saving={props.saving} tab={props.tab} />;
        case 'security':
            return (
                <SecurityTab
                    passwordData={props.passwordData}
                    setPasswordData={props.setPasswordData}
                    handleChangePassword={props.handleChangePassword}
                    changingPassword={props.changingPassword}
                    showCurrentPassword={props.showCurrentPassword}
                    setShowCurrentPassword={props.setShowCurrentPassword}
                    showNewPassword={props.showNewPassword}
                    setShowNewPassword={props.setShowNewPassword}
                    showConfirmPassword={props.showConfirmPassword}
                    setShowConfirmPassword={props.setShowConfirmPassword}
                />
            );
        case 'academy':
            return (
                <AcademyTab
                    user={props.user}
                    setUser={props.setUser}
                    handleSave={props.handleSave}
                    saving={props.saving}
                    isPro={props.isPro}
                    pendingAdjustment={props.pendingAdjustment}
                    setActiveTab={props.setActiveTab}
                    studentCount={props.studentCount}
                    scheduleCount={props.scheduleCount}
                    hasRecentPayments={props.hasRecentPayments}
                />
            );
        case 'services':
            return (
                <ServicesTab
                    user={props.user}
                    userServices={props.userServices}
                    newService={props.newService}
                    setNewService={props.setNewService}
                    handleAddService={props.handleAddService}
                    handleDeleteService={props.handleDeleteService}
                    handleSave={props.handleSave}
                    saving={props.saving}
                />
            );
        case 'automation':
            return <AutomationTab user={props.user} setUser={props.setUser} handleSave={props.handleSave} saving={props.saving} isPro={props.isPro} />;
        case 'payment-accounts':
            return <PaymentAccountsTab />;
        case 'ratings':
            return (
                <RatingsTab
                    ratings={props.ratings}
                    ratingToken={props.ratingToken}
                    ratingExpires={props.ratingExpires}
                    handleGenerateLink={props.handleGenerateLink}
                    handleToggleRatingVisibility={props.handleToggleRatingVisibility}
                    isPro={props.isPro}
                />
            );
        case 'subscription':
            return (
                <SubscriptionTab
                    user={props.user}
                    isPro={props.isPro}
                    subscriptionPlans={props.subscriptionPlans}
                    priceLastUpdate={props.priceLastUpdate}
                    pendingAdjustment={props.pendingAdjustment}
                    loadingCheckout={props.loadingCheckout}
                    handleUpgrade={props.handleUpgrade}
                />
            );
        case 'support':
            return <SupportTab />;
        case 'legal':
            return <LegalTab />;
        default:
            return null;
    }
};

export default SettingsContent;
