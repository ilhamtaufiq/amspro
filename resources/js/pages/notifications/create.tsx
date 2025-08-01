import React from 'react';
import { useForm, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/authenticated-layout';
import { PageProps } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

interface User {
    id: number;
    name: string;
}

interface CreateProps {
    users: User[];
}

export default function Create({ users }: CreateProps) {
    const { auth } = usePage<PageProps>().props;
    const { data, setData, post, errors, processing } = useForm({
        title: '',
        message: '',
        type: 'info',
        recipient_id: '',
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post(route('notifications.store'));
    }

    return (
        <AuthenticatedLayout user={auth.user} header="Create Notification">
            <div className="p-4 sm:p-6 lg:p-8">
                <Card className="max-w-2xl mx-auto">
                    <CardHeader>
                        <CardTitle>Send a New Notification</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="title">Title</Label>
                                <Input
                                    id="title"
                                    type="text"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    placeholder="Enter the notification title"
                                    className={errors.title ? 'border-destructive' : ''}
                                />
                                {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="message">Message</Label>
                                <Textarea
                                    id="message"
                                    value={data.message}
                                    onChange={(e) => setData('message', e.target.value)}
                                    placeholder="Enter the notification message"
                                    className={errors.message ? 'border-destructive' : ''}
                                />
                                {errors.message && <p className="text-sm text-destructive">{errors.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="type">Type</Label>
                                <Select onValueChange={(value) => setData('type', value)} defaultValue={data.type}>
                                    <SelectTrigger className={errors.type ? 'border-destructive' : ''}>
                                        <SelectValue placeholder="Select a notification type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="info">Info</SelectItem>
                                        <SelectItem value="success">Success</SelectItem>
                                        <SelectItem value="warning">Warning</SelectItem>
                                        <SelectItem value="error">Error</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.type && <p className="text-sm text-destructive">{errors.type}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="recipient_id">Recipient</Label>
                                <Select onValueChange={(value) => setData('recipient_id', value)} defaultValue={data.recipient_id}>
                                    <SelectTrigger className={errors.recipient_id ? 'border-destructive' : ''}>
                                        <SelectValue placeholder="Select a recipient" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {users.map((user) => (
                                            <SelectItem key={user.id} value={String(user.id)}>
                                                {user.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.recipient_id && <p className="text-sm text-destructive">{errors.recipient_id}</p>}
                            </div>

                            <div className="flex justify-end">
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Sending...' : 'Send Notification'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}