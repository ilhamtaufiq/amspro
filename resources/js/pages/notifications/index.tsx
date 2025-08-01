import React from 'react';
import AuthenticatedLayout from '@/layouts/authenticated-layout';
import { PageProps, PaginatedData } from '@/types/index'; // Explicitly import from index
import { usePage } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDistanceToNow, parseISO } from 'date-fns';

interface Notification {
    id: string;
    title: string;
    message: string;
    read_at: string | null;
    created_at: string;
    type: 'info' | 'warning' | 'success' | 'error';
}

interface NotificationsProps extends PageProps {
    notifications: PaginatedData<Notification>;
}

export default function NotificationCenter() {
    const { auth, notifications } = usePage<NotificationsProps>().props;

    const getNotificationIcon = (type: Notification['type']) => {
        switch (type) {
            case 'success': return '✅';
            case 'warning': return '⚠️';
            case 'error': return '❌';
            default: return 'ℹ️';
        }
    };

    return (
        <AuthenticatedLayout user={auth.user} header="Notification Center">
            <div className="p-4 sm:p-6 lg:p-8">
                <Card className="max-w-4xl mx-auto">
                    <CardHeader>
                        <CardTitle>All Notifications</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {notifications.data.map((notification: Notification) => (
                                <div key={notification.id} className={`p-4 rounded-lg flex items-start space-x-4 ${notification.read_at ? 'bg-secondary/50' : 'bg-secondary'}`}>
                                    <span className="text-xl mt-1">{getNotificationIcon(notification.type)}</span>
                                    <div className="flex-grow">
                                        <div className="flex justify-between items-center">
                                            <h3 className="font-semibold">{notification.title}</h3>
                                            <p className="text-xs text-muted-foreground">
                                                {formatDistanceToNow(parseISO(notification.created_at), { addSuffix: true })}
                                            </p>
                                        </div>
                                        <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                                    </div>
                                    {!notification.read_at && (
                                        <div className="h-3 w-3 rounded-full bg-primary mt-1.5"></div>
                                    )}
                                </div>
                            ))}
                        </div>
                        {/* TODO: Add Pagination Links */}
                    </CardContent>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
