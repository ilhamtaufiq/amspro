import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    File,
    Calendar,
    FileText,
    ImageIcon,
    BarChart3,
    CheckCircle,
    TrendingUp,
} from "lucide-react";
import { StatusTab } from "./StatusTab";
import { ContractTab } from "./ContractTab";
import { OutputTab } from "./OutputTab";
import { ProgressTab } from "./ProgressTab";
import { OutcomeTab } from "./OutcomeTab";
import { PhotosTab } from "./PhotosTab";
import type { PageProps } from "./types";

export function TabsWrapper(props: PageProps) {
    const [activeTab, setActiveTab] = useState("status");

    return (
        <Tabs defaultValue="status" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="flex w-full overflow-x-auto md:grid md:grid-cols-6 gap-1">
                <TabsTrigger value="status" className="flex items-center gap-2 min-w-0 flex-shrink px-2">
                    <CheckCircle className="h-4 w-4" />
                    <span className="hidden md:inline">Status</span>
                </TabsTrigger>
                <TabsTrigger value="contract" className="flex items-center gap-2 min-w-0 flex-shrink px-2">
                    <FileText className="h-4 w-4" />
                    <span className="hidden md:inline">Kontrak</span>
                </TabsTrigger>
                <TabsTrigger value="output" className="flex items-center gap-2 min-w-0 flex-shrink px-2">
                    <CheckCircle className="h-4 w-4" />
                    <span className="hidden md:inline">Komponen</span>
                </TabsTrigger>
                <TabsTrigger value="progress" className="flex items-center gap-2 min-w-0 flex-shrink px-2">
                    <BarChart3 className="h-4 w-4" />
                    <span className="hidden md:inline">Progress</span>
                </TabsTrigger>
                <TabsTrigger value="outcome" className="flex items-center gap-2 min-w-0 flex-shrink px-2">
                    <TrendingUp className="h-4 w-4" />
                    <span className="hidden md:inline">Outcome</span>
                </TabsTrigger>
                <TabsTrigger value="photos" className="flex items-center gap-2 min-w-0 flex-shrink px-2">
                    <ImageIcon className="h-4 w-4" />
                    <span className="hidden md:inline">Foto</span>
                </TabsTrigger>
            </TabsList>

            <TabsContent value="status" className="space-y-4">
                <StatusTab {...props} />
            </TabsContent>
            <TabsContent value="contract" className="space-y-4">
                <ContractTab {...props} />
            </TabsContent>
            <TabsContent value="output" className="space-y-4">
                <OutputTab {...props} />
            </TabsContent>
            <TabsContent value="progress" className="space-y-4">
                <ProgressTab {...props} />
            </TabsContent>
            <TabsContent value="outcome" className="space-y-4">
                <OutcomeTab {...props} />
            </TabsContent>
            <TabsContent value="photos" className="space-y-4">
                <PhotosTab {...props} />
            </TabsContent>
        </Tabs>
    );
}
