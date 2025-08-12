import { Head, router, usePage } from '@inertiajs/react';
import { useState, useEffect, FormEvent } from 'react';
import AuthenticatedLayout from "@/layouts/authenticated-layout";
import { Search, FileText, Users, Building, Package } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ModeToggle } from '@/components/mode-toggle';

interface SearchResult {
    data: any[];
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
    type: string;
    title: string;
}

interface SearchResults {
    pekerjaan?: SearchResult;
    kontrak?: SearchResult;
    users?: SearchResult;
    penyedia?: SearchResult;
}

interface Props {
    query: string;
    type: string;
    results: SearchResults;
    searchTypes: Record<string, string>;
    auth: any;
}

export default function SearchIndex({ query, type, results, searchTypes, auth }: Props) {
    const [searchQuery, setSearchQuery] = useState(query);
    const [searchType, setSearchType] = useState(type);
    const [isLoading, setIsLoading] = useState(false);

    const handleSearch = (e?: FormEvent) => {
        if (e) e.preventDefault();
        if (!searchQuery.trim()) return;

        setIsLoading(true);
        router.get('/search', {
            q: searchQuery,
            type: searchType,
        }, {
            preserveState: true,
            onFinish: () => setIsLoading(false),
        });
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'pekerjaan':
                return <Package className="w-5 h-5" />;
            case 'kontrak':
                return <FileText className="w-5 h-5" />;
            case 'users':
                return <Users className="w-5 h-5" />;
            case 'penyedia':
                return <Building className="w-5 h-5" />;
            default:
                return <Search className="w-5 h-5" />;
        }
    };

    const renderSearchResults = () => {
        if (!query || !results || Object.keys(results).length === 0) {
            return (
                <div className="text-center py-12">
                    <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">
                        {query ? 'Tidak ada hasil ditemukan' : 'Mulai pencarian'}
                    </h3>
                    <p className="text-muted-foreground">
                        {query 
                            ? 'Coba gunakan kata kunci yang berbeda atau ubah filter pencarian'
                            : 'Masukkan kata kunci untuk mencari pekerjaan, kontrak, pengguna, atau penyedia'
                        }
                    </p>
                </div>
            );
        }

        return (
            <div className="space-y-8">
                {Object.entries(results).map(([resultType, result]) => (
                    <Card key={resultType}>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <Avatar className="h-9 w-9 mr-3">
                                        <AvatarFallback>{getTypeIcon(resultType)}</AvatarFallback>
                                    </Avatar>
                                    <CardTitle>{result.title}</CardTitle>
                                    <Badge variant="secondary" className="ml-2">{result.total} hasil</Badge>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {result.data.length > 0 ? (
                                <div className="space-y-4">
                                    {result.data.map((item: any) => (
                                        <SearchResultItem 
                                            key={item.id} 
                                            item={item} 
                                            type={resultType} 
                                        />
                                    ))}
                                </div>
                            ) : (
                                <p className="text-muted-foreground">Tidak ada hasil untuk kategori ini</p>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    };

    return (
        <AuthenticatedLayout user={auth.user} header="Pencarian">
            <Head title="Pencarian" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <Card className="mb-8">
                        <CardContent className="p-6">
                            <form onSubmit={handleSearch} className="space-y-4">
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <div className="flex-1 relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                        <Input
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="pl-10"
                                            placeholder="Masukkan kata kunci pencarian..."
                                        />
                                    </div>
                                    
                                    <Select value={searchType} onValueChange={setSearchType}>
                                        <SelectTrigger className="w-full sm:w-48">
                                            <SelectValue placeholder="Pilih tipe..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.entries(searchTypes).map(([value, label]) => (
                                                <SelectItem key={value} value={value}>
                                                    {label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    
                                    <Button type="submit" disabled={isLoading || !searchQuery.trim()}>
                                        {isLoading ? 'Mencari...' : 'Cari'}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    {renderSearchResults()}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

function SearchResultItem({ item, type }: { item: any; type: string }) {
    const getItemTitle = () => {
        switch (type) {
            case 'pekerjaan':
                return item.nama_paket;
            case 'kontrak':
                return item.nomor_penawaran || item.kode_rup;
            case 'users':
                return item.name;
            case 'penyedia':
                return item.nama;
            default:
                return 'Unknown';
        }
    };

    const getItemDescription = () => {
        switch (type) {
            case 'pekerjaan':
                return `${item.kode_rekening} - ${item.n_kec || 'N/A'}, ${item.n_desa || 'N/A'}`;
            case 'kontrak':
                return `Nilai: ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(item.nilai_kontrak || 0)}`;
            case 'users':
                return item.email;
            case 'penyedia':
                return `Direktur: ${item.direktur || 'N/A'}`;
            default:
                return '';
        }
    };

    return (
        <Card className="hover:bg-muted/50 transition-colors">
            <CardContent className="p-4">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <h4 className="text-sm font-medium text-foreground mb-1">
                            {getItemTitle()}
                        </h4>
                        <p className="text-sm text-muted-foreground mb-2">
                            {getItemDescription()}
                        </p>
                        {type === 'pekerjaan' && item.pagu && (
                            <p className="text-sm text-green-600">
                                Pagu: {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(item.pagu)}
                            </p>
                        )}
                    </div>
                    <div className="ml-4 flex-shrink-0">
                        <Badge variant="outline">{type}</Badge>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}     
