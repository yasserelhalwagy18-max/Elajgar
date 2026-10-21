'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bell, Droplet, Activity, User, Shield, LogOut, Pencil, ChevronLeft, Phone, Verified } from 'lucide-react';
import { cn, toPersianDigits } from '@/lib/utils';
import { ADMIN_PATH } from '@/lib/admin-path';
import { motion } from 'motion/react';
import { useStore } from '../../../lib/store';
import { useRouter } from 'next/navigation';
import { useMounted } from '@/hooks/use-mounted';
import { useAuthGuard } from '@/hooks/use-auth-guard';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import toast from 'react-hot-toast';

const NOTIFICATIONS_KEY = 'elajgar-notifications';

interface SubscriptionState {
    isActive: boolean;
    subscription: {
        status: string;
        startedAt: string;
        expiresAt: string;
        plan: { key: string; title: string; price: number };
    } | null;
}

interface NotificationPrefs {
  hydration: boolean;
  activity: boolean;
}

/**
 * Read the saved preferences.
 *
 * The state is seeded lazily instead of through an effect so the component
 * does not set state on every render, and so the toggle never shows "on"
 * while the browser permission is actually denied.
 */
function readNotificationPrefs(): NotificationPrefs {
    const fallback: NotificationPrefs = { hydration: false, activity: false };

    if (typeof window === 'undefined' || !('Notification' in window)) return fallback;

    // Only offer the reminders when the browser will actually deliver them.
    if (Notification.permission !== 'granted') return fallback;

    try {
        const raw = localStorage.getItem(NOTIFICATIONS_KEY);
        if (!raw) return fallback;
        const parsed = JSON.parse(raw);
        return {
            hydration: Boolean(parsed?.hydration),
            activity: Boolean(parsed?.activity),
        };
    } catch {
        // Ignore malformed storage and fall back to the defaults.
        return fallback;
    }
}

export default function ProfilePage() {
    const [notificationPrefs, setNotificationPrefs] = useState<NotificationPrefs>(readNotificationPrefs);
    const { userProfile, logout, updateUserProfile } = useStore();
    const { isAuthenticated, hasHydrated } = useAuthGuard();
    const router = useRouter();
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [showEditProfile, setShowEditProfile] = useState(false);
    const mounted = useMounted();

    // The user's own subscription, so the page can show what they have and
    // how long it is left.
    const [subscription, setSubscription] = useState<SubscriptionState | null>(null);

    // Whether the user has a password, and the form to set or change it.
    const [hasPassword, setHasPassword] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
    const [savingPassword, setSavingPassword] = useState(false);

    // Removing the password again, so an account can go back to signing in
    // with an SMS code only.
    const [showRemovePassword, setShowRemovePassword] = useState(false);
    const [removePasswordValue, setRemovePasswordValue] = useState('');
    const [removePasswordError, setRemovePasswordError] = useState<string | null>(null);
    const [removingPassword, setRemovingPassword] = useState(false);

    useEffect(() => {
        if (!isAuthenticated) return;

        const controller = new AbortController();

        fetch('/api/subscription', { signal: controller.signal, cache: 'no-store' })
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => setSubscription(data))
            .catch((error) => {
                if ((error as Error)?.name === 'AbortError') return;
            });

        // The API answers whether a password is set, so the section can say
        // "set a password" or "change it".
        fetch('/api/user', { signal: controller.signal, cache: 'no-store' })
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => setHasPassword(Boolean(data?.hasPassword)))
            .catch((error) => {
                if ((error as Error)?.name === 'AbortError') return;
            });

        return () => controller.abort();
    }, [isAuthenticated]);

    const savePassword = async (event: React.FormEvent) => {
        event.preventDefault();
        setPasswordError(null);
        setPasswordMessage(null);

        if (newPassword.length < 8) {
            setPasswordError('رمز عبور باید حداقل ۸ کاراکتر باشد');
            return;
        }

        setSavingPassword(true);
        try {
            const res = await fetch('/api/auth/set-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    password: newPassword,
                    ...(hasPassword ? { currentPassword } : {}),
                }),
            });
            const data = await res.json();

            if (res.ok) {
                setHasPassword(true);
                setCurrentPassword('');
                setNewPassword('');
                setPasswordMessage('رمز عبور ذخیره شد. از این پس می‌توانید با آن وارد شوید.');
            } else {
                setPasswordError(data.error || 'ذخیره رمز عبور ناموفق بود');
            }
        } catch {
            setPasswordError('ارتباط با سرور برقرار نشد');
        } finally {
            setSavingPassword(false);
        }
    };

    /**
     * Remove the password, so the account goes back to signing in with an
     * SMS code only.
     *
     * The current password is asked for again - the same bar as changing it.
     */
    const removePassword = async () => {
        setRemovePasswordError(null);

        if (!removePasswordValue) {
            setRemovePasswordError('رمز عبور فعلی را وارد کنید');
            return;
        }

        setRemovingPassword(true);
        try {
            const res = await fetch('/api/auth/clear-password', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentPassword: removePasswordValue }),
            });
            const data = await res.json();

            if (res.ok) {
                setHasPassword(false);
                setCurrentPassword('');
                setNewPassword('');
                setRemovePasswordValue('');
                setShowRemovePassword(false);
                setPasswordMessage('رمز عبور حذف شد. از این پس فقط با کد تایید وارد می‌شوید.');
                toast.success('رمز عبور حذف شد');
            } else {
                setRemovePasswordError(data.error || 'حذف رمز عبور ناموفق بود');
            }
        } catch {
            setRemovePasswordError('ارتباط با سرور برقرار نشد');
        } finally {
            setRemovingPassword(false);
        }
    };

    if (!mounted) return null;
    if (!hasHydrated || !isAuthenticated) return null;

    const persistPrefs = (next: NotificationPrefs) => {
        setNotificationPrefs(next);
        try {
            localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(next));
        } catch {
            // Storage can be unavailable in private mode - the toggle still
            // works for the current session.
        }
    };

    const requestNotificationPermission = async (
        key: keyof NotificationPrefs,
        currentValue: boolean
    ) => {
        if (!currentValue) {
            if (typeof window !== 'undefined' && 'Notification' in window) {
                const permission =
                    Notification.permission === 'default'
                        ? await Notification.requestPermission()
                        : Notification.permission;

                if (permission === 'granted') {
                    persistPrefs({ ...notificationPrefs, [key]: true });
                    toast.success('یادآورها فعال شد');
                } else {
                    toast.error('دسترسی اعلان‌ها داده نشده است.');
                }
            } else {
                toast.error('مرورگر شما از اعلان پشتیبانی نمی‌کند.');
            }
        } else {
            persistPrefs({ ...notificationPrefs, [key]: false });
        }
    };

    const handleLogout = async () => {
        // The cookie has to be gone before the user is sent to the login
        // screen, or the server sends them straight back into the app.
        await logout();
        router.push('/login');
    };

    const displayName = userProfile?.fullName?.trim() || 'کاربر';
    const initial = displayName.charAt(0) || 'ا';

    return (
        <div className="p-6 pb-28 min-h-screen">
            <header className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold text-on-surface">پروفایل و تنظیمات</h1>
            </header>

            <div className="flex flex-col items-center mb-8">
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-primary text-4xl font-bold mb-4 border-4 border-surface-container shadow-lg">
                    {initial}
                </div>
                <h2 className="text-xl font-bold">{displayName}</h2>
                {userProfile?.phoneNumber && (
                    <p className="text-on-surface-variant font-medium text-sm flex items-center gap-1.5 mt-1" dir="ltr">
                        <Phone className="w-3.5 h-3.5" />
                        {toPersianDigits(userProfile.phoneNumber)}
                    </p>
                )}
            </div>

            <section className="mb-8">
                <h3 className="font-bold text-lg mb-4 text-on-surface px-2">حساب کاربری</h3>
                <div className="card rounded-3xl overflow-hidden flex flex-col gap-px bg-outline-variant/20">
                    {userProfile?.role === 'ADMIN' && (
                        <Link
                            href={ADMIN_PATH}
                            className="w-full bg-surface-container p-4 flex items-center justify-between hover:bg-surface-variant/60 transition-colors"
                        >
                            <span className="flex items-center gap-4">
                                <Shield className="w-5 h-5 text-primary" />
                                <span className="font-bold text-on-surface text-sm">پنل مدیریت</span>
                            </span>
                            <ChevronLeft className="w-4 h-4 text-on-surface-variant" />
                        </Link>
                    )}
                    <button
                        type="button"
                        onClick={() => setShowEditProfile(true)}
                        className="w-full bg-surface-container p-4 flex items-center justify-between text-start hover:bg-surface-variant/60 transition-colors"
                    >
                        <span className="flex items-center gap-4">
                            <User className="w-5 h-5 text-on-surface-variant" />
                            <span className="font-bold text-on-surface text-sm">اطلاعات فردی</span>
                        </span>
                        <Pencil className="w-4 h-4 text-on-surface-variant" />
                    </button>
                    <a
                        href="/privacy"
                        className="w-full bg-surface-container p-4 flex items-center justify-between hover:bg-surface-variant/60 transition-colors"
                    >
                        <span className="flex items-center gap-4">
                            <Shield className="w-5 h-5 text-on-surface-variant" />
                            <span className="font-bold text-on-surface text-sm">حریم خصوصی</span>
                        </span>
                        <ChevronLeft className="w-4 h-4 text-on-surface-variant" />
                    </a>
                    <a
                        href="#notifications"
                        className="w-full bg-surface-container p-4 flex items-center justify-between hover:bg-surface-variant/60 transition-colors"
                    >
                        <span className="flex items-center gap-4">
                            <Bell className="w-5 h-5 text-on-surface-variant" />
                            <span className="font-bold text-on-surface text-sm">اعلان‌های سیستم</span>
                        </span>
                        <ChevronLeft className="w-4 h-4 text-on-surface-variant" />
                    </a>
                </div>
            </section>

            <section className="mb-8" id="notifications">
                <h3 className="font-bold text-lg mb-4 text-on-surface px-2">تنظیمات اعلان‌ها</h3>
                <div className="card rounded-3xl overflow-hidden flex flex-col gap-px bg-outline-variant/20">
                    <div className="bg-surface-container p-4 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                <Droplet className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="font-bold text-on-surface text-sm">یادآور نوشیدن آب</p>
                                <p className="text-xs text-on-surface-variant">هر ۲ ساعت</p>
                            </div>
                        </div>
                        <Switch
                            label="یادآور نوشیدن آب"
                            checked={notificationPrefs.hydration}
                            onChange={() => requestNotificationPermission('hydration', notificationPrefs.hydration)}
                        />
                    </div>
                    <div className="bg-surface-container p-4 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container shrink-0">
                                <Activity className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="font-bold text-on-surface text-sm">یادآور فعالیت</p>
                                <p className="text-xs text-on-surface-variant">یادآوری برای تحرک</p>
                            </div>
                        </div>
                        <Switch
                            label="یادآور فعالیت"
                            checked={notificationPrefs.activity}
                            onChange={() => requestNotificationPermission('activity', notificationPrefs.activity)}
                        />
                    </div>
                </div>
                {typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'denied' && (
                    <p className="text-xs text-on-surface-variant mt-2 px-2">
                        اعلان‌ها در تنظیمات مرورگر مسدود شده‌اند. برای فعال‌سازی، آن‌ها را از تنظیمات سایت اجازه دهید.
                  </p>
                )}
            </section>

            <section className="mb-8" id="password">
                <h3 className="font-bold text-lg mb-4 text-on-surface px-2">رمز عبور</h3>
                <form onSubmit={savePassword} className="card rounded-3xl p-5 flex flex-col gap-4">
                    <p className="text-sm text-on-surface-variant">
                        {hasPassword
                            ? 'با رمز عبور وارد می‌شوید و دیگر منتظر پیامک نمی‌مانید. برای تغییر آن، رمز فعلی را وارد کنید.'
                            : 'برای ورودهای بعدی یک رمز عبور بسازید تا دیگر منتظر پیامک نمانید. این کار اختیاری است.'}
                    </p>

                    {hasPassword && (
                        <div>
                            <label className="block text-sm font-medium mb-1" htmlFor="current-password">
                                رمز عبور فعلی
                            </label>
                            <input
                                id="current-password"
                                type="password"
                                autoComplete="current-password"
                                value={currentPassword}
                                onChange={(e) => { setCurrentPassword(e.target.value); setPasswordError(null); }}
                                className={`input text-left ${passwordError ? 'border-error' : ''}`}
                                aria-invalid={!!passwordError}
                                aria-describedby={passwordError ? 'password-error' : undefined}
                                dir="ltr"
                                disabled={savingPassword}
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium mb-1" htmlFor="new-password">
                            {hasPassword ? 'رمز عبور جدید' : 'رمز عبور جدید'}
                        </label>
                        <input
                            id="new-password"
                            type="password"
                            autoComplete="new-password"
                            value={newPassword}
                            onChange={(e) => { setNewPassword(e.target.value); setPasswordError(null); }}
                            placeholder="حداقل ۸ کاراکتر"
                            className={`input text-left ${passwordError ? 'border-error' : ''}`}
                            aria-invalid={!!passwordError}
                            aria-describedby={passwordError ? 'password-error' : undefined}
                            dir="ltr"
                            minLength={8}
                            required
                            disabled={savingPassword}
                        />
                    </div>

                    {passwordError && (
                        <p id="password-error" role="alert" className="text-error text-xs">{passwordError}</p>
                    )}
                    {passwordMessage && (
                        <p role="status" className="text-success text-xs">{passwordMessage}</p>
                    )}

                    <button
                        type="submit"
                        disabled={savingPassword}
                        className="btn btn-primary w-full py-2.5"
                    >
                        {savingPassword ? 'در حال ذخیره...' : hasPassword ? 'تغییر رمز عبور' : 'ذخیره رمز عبور'}
                    </button>
                </form>

                {/* Going back to signing in with a code only. This used to be
                    possible only from the command line, so a user who wanted
                    it had to ask somebody with access to the server. */}
                {hasPassword && (
                    <div className="card rounded-3xl p-5 mt-4 flex flex-col gap-3">
                        <p className="text-sm text-on-surface-variant leading-relaxed">
                            اگر ترجیح می‌دهید فقط با کد تایید وارد شوید، می‌توانید رمز عبور را حذف کنید.
                        </p>
                        <button
                            type="button"
                            onClick={() => {
                                setRemovePasswordError(null);
                                setRemovePasswordValue('');
                                setShowRemovePassword(true);
                            }}
                            className="btn btn-secondary w-full py-2.5"
                        >
                            <Shield className="w-4 h-4" />
                            حذف رمز عبور
                        </button>
                    </div>
                )}

                <Modal
                    open={showRemovePassword}
                    onClose={() => setShowRemovePassword(false)}
                    title="حذف رمز عبور"
                    description="پس از حذف، حساب شما فقط با کد تایید پیامکی وارد می‌شود."
                    size="sm"
                    footer={
                        <>
                            <button
                                type="button"
                                onClick={() => setShowRemovePassword(false)}
                                className="btn btn-secondary btn-md"
                                disabled={removingPassword}
                            >
                                انصراف
                            </button>
                            <button
                                type="button"
                                onClick={removePassword}
                                disabled={removingPassword}
                                className="btn btn-danger btn-md"
                            >
                                {removingPassword ? 'در حال حذف...' : 'حذف رمز عبور'}
                            </button>
                        </>
                    }
                >
                    <div className="flex flex-col gap-3">
                        <p className="text-sm text-on-surface-variant leading-relaxed">
                            برای امنیت، رمز عبور فعلی را وارد کنید. اگر آن را فراموش کرده‌اید،
                            از پشتیبانی بخواهید حساب شما را به حالت «فقط کد تایید» برگرداند.
                        </p>
                        <div>
                            <label className="block text-sm font-medium mb-1" htmlFor="remove-current-password">
                                رمز عبور فعلی
                            </label>
                            <input
                                id="remove-current-password"
                                type="password"
                                autoComplete="current-password"
                                value={removePasswordValue}
                                onChange={(e) => { setRemovePasswordValue(e.target.value); setRemovePasswordError(null); }}
                                className={`input text-left ${removePasswordError ? 'border-error' : ''}`}
                                aria-invalid={!!removePasswordError}
                                aria-describedby={removePasswordError ? 'remove-password-error' : undefined}
                                dir="ltr"
                                disabled={removingPassword}
                            />
                            {removePasswordError && (
                                <p id="remove-password-error" role="alert" className="text-error text-xs mt-1">
                                    {removePasswordError}
                                </p>
                            )}
                        </div>
                    </div>
                </Modal>
            </section>

            <section className="mb-8">
                <h3 className="font-bold text-lg mb-4 text-on-surface px-2">اشتراک</h3>
                {subscription?.subscription ? (
                    <div className="card rounded-3xl p-5 flex flex-col gap-4">
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                                    <Verified className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <p className="font-bold text-on-surface text-sm">
                                        {subscription.subscription.plan.title}
                                    </p>
                                    <p className="text-xs text-on-surface-variant">
                                        {subscription.isActive ? 'اشتراک فعال' : 'اشتراک منقضی شده'}
                                    </p>
                                </div>
                            </div>
                            <span
                                className={cn(
                                    'px-3 py-1 text-xs font-bold rounded-full',
                                    subscription.isActive
                                        ? 'bg-success-container text-success'
                                        : 'bg-warning/10 text-warning'
                                )}
                            >
                                {subscription.isActive ? 'فعال' : 'منقضی شده'}
                            </span>
                        </div>

                        <div className="flex items-center justify-between gap-3 text-xs">
                            <span className="text-on-surface-variant">اعتبار تا</span>
                            <span className="font-bold text-on-surface">
                                {new Intl.DateTimeFormat('fa-IR', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                }).format(new Date(subscription.subscription.expiresAt))}
                            </span>
                        </div>

                        <Link
                            href="/dashboard/education"
                            className="btn btn-primary btn-md w-full"
                        >
                            {subscription.isActive ? 'مشاهده محتوای ویژه' : 'تمدید اشتراک'}
                        </Link>
                    </div>
                ) : (
                    <div className="card rounded-3xl p-5 flex flex-col gap-4">
                        <p className="text-sm text-on-surface-variant leading-relaxed">
                            شما اشتراک فعالی ندارید. با فعال‌کردن اشتراک، همه ویدیوهای تخصصی و
                            برنامه تمرینی اختصاصی برای شما باز می‌شود.
                        </p>
                        <Link href="/dashboard/education" className="btn btn-secondary btn-md w-full">
                            مشاهده پلن‌ها
                        </Link>
                    </div>
                )}
            </section>

            <button
                type="button"
                onClick={() => setShowLogoutConfirm(true)}
                className="btn btn-danger w-full py-4 font-bold"
            >
                <LogOut className="w-5 h-5" />
                خروج از حساب
            </button>

            <EditProfileModal
                open={showEditProfile}
                onClose={() => setShowEditProfile(false)}
                onSave={(updates) => {
                    updateUserProfile(updates);
                    setShowEditProfile(false);
                    toast.success('اطلاعات شما به‌روزرسانی شد');
                }}
            />

            <ConfirmDialog
                open={showLogoutConfirm}
                onClose={() => setShowLogoutConfirm(false)}
                onConfirm={handleLogout}
                title="خروج از حساب"
                confirmLabel="بله، خروج کن"
                tone="danger"
                message="برای ورود دوباره باید شماره موبایل خود را وارد کنید. مطمئن هستید می‌خواهید خارج شوید؟"
            />
        </div>
    );
}

interface EditProfileModalProps {
    open: boolean;
    onClose: () => void;
    onSave: (updates: Record<string, unknown>) => void;
}

function EditProfileModal({ open, onClose, onSave }: EditProfileModalProps) {
    return (
        <Modal
            open={open}
            onClose={onClose}
            title="اطلاعات فردی"
            description="ویرایش این اطلاعات، شاخص سلامت و اهداف تغذیه‌ای را به‌روز می‌کند."
        >
            {/* The form is a separate component so it mounts fresh every time
                the dialog opens - the fields are then seeded from the current
                profile without an effect that copies props into state. */}
            <EditProfileForm onSave={onSave} onCancel={onClose} />
        </Modal>
    );
}

function EditProfileForm({ onSave, onCancel }: { onSave: (updates: Record<string, unknown>) => void; onCancel: () => void }) {
    const userProfile = useStore((state) => state.userProfile);

    const [fullName, setFullName] = useState(userProfile?.fullName || '');
    const [age, setAge] = useState(userProfile?.age?.toString() || '');
    const [gender, setGender] = useState<'male' | 'female'>(userProfile?.gender || 'male');
    const [height, setHeight] = useState(userProfile?.height?.toString() || '');
    const [weight, setWeight] = useState(userProfile?.weight?.toString() || '');
    const [activityLevel, setActivityLevel] = useState<'sedentary' | 'light' | 'moderate' | 'active'>(
        userProfile?.activityLevel || 'sedentary'
    );
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = () => {
        const parsedAge = parseInt(age);
        const parsedHeight = parseInt(height);
        const parsedWeight = parseInt(weight);

        if (!fullName.trim() || fullName.trim().length < 2) {
            setError('نام و نام خانوادگی باید حداقل ۲ حرف باشد');
            return;
        }
        if (Number.isNaN(parsedAge) || parsedAge < 1 || parsedAge > 120) {
            setError('سن باید بین ۱ تا ۱۲۰ باشد');
            return;
        }
        if (Number.isNaN(parsedHeight) || parsedHeight < 50 || parsedHeight > 250) {
            setError('قد باید بین ۵۰ تا ۲۵۰ سانتی‌متر باشد');
            return;
        }
        if (Number.isNaN(parsedWeight) || parsedWeight < 10 || parsedWeight > 300) {
            setError('وزن باید بین ۱۰ تا ۳۰۰ کیلوگرم باشد');
            return;
        }

        setError(null);
        onSave({
            fullName: fullName.trim(),
            age: parsedAge,
            gender,
            height: parsedHeight,
            weight: parsedWeight,
            activityLevel,
        });
    };

    return (
        <form
            className="flex flex-col gap-4"
            onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
            }}
        >
            <div>
                <label className="block text-sm font-medium mb-1" htmlFor="profile-full-name">نام و نام خانوادگی</label>
                <input
                    id="profile-full-name"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="input"
                />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="profile-age">سن</label>
                    <input id="profile-age" type="number" value={age} onChange={(e) => setAge(e.target.value)} className="input" />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="profile-gender">جنسیت</label>
                    <select id="profile-gender" value={gender} onChange={(e) => setGender(e.target.value as 'male' | 'female')} className="select">
                        <option value="male">مرد</option>
                        <option value="female">زن</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="profile-height">قد (سانتی‌متر)</label>
                    <input id="profile-height" type="number" value={height} onChange={(e) => setHeight(e.target.value)} className="input" />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="profile-weight">وزن (کیلوگرم)</label>
                    <input id="profile-weight" type="number" value={weight} onChange={(e) => setWeight(e.target.value)} className="input" />
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium mb-1" htmlFor="profile-activity">سطح فعالیت</label>
                <select
                    id="profile-activity"
                    value={activityLevel}
                    onChange={(e) => setActivityLevel(e.target.value as 'sedentary' | 'light' | 'moderate' | 'active')}
                    className="select"
                >
                    <option value="sedentary">بدون فعالیت</option>
                    <option value="light">سبک</option>
                    <option value="moderate">متوسط</option>
                    <option value="active">فعال</option>
                </select>
            </div>

            {error && (
                <p role="alert" className="text-error text-sm font-bold bg-error/10 rounded-xl px-3 py-2">
                    {error}
                </p>
            )}

            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-1">
                <button type="button" onClick={onCancel} className="btn btn-secondary btn-md">
                    انصراف
                </button>
                <button type="submit" className="btn btn-primary btn-md">
                    ذخیره تغییرات
                </button>
            </div>
        </form>
    );
}

function Switch({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            aria-label={label}
            onClick={onChange}
            className={cn(
                "w-12 h-7 rounded-full transition-colors relative shrink-0",
                checked ? "bg-primary" : "bg-outline-variant"
            )}
        >
            <motion.div
                className="w-5 h-5 bg-surface-container rounded-full absolute top-[3px] right-[3px] shadow-sm"
                style={{
                    transform: checked ? 'translateX(-22px)' : 'translateX(0px)',
                    transition: 'transform 0.2s ease-in-out'
                }}
            />
        </button>
    );
}
